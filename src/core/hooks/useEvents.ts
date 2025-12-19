import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Event } from '../../domain/entities/Event';
import { EventRepositoryImpl } from '../../data/repositories/EventRepositoryImpl';
import { NetworkInfo } from '../network/networkInfo';

// Initialize repository (in production, use dependency injection)
let eventRepository: EventRepositoryImpl;

export const setEventRepository = (repo: EventRepositoryImpl) => {
  eventRepository = repo;
};

// Query Keys
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: string) => [...eventKeys.lists(), { filters }] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

// Queries
export const useGetEvents = (options?: UseQueryOptions<Event[], Error>) => {
  return useQuery<Event[], Error>({
    queryKey: eventKeys.lists(),
    queryFn: async () => {
      if (!eventRepository) throw new Error('Repository not initialized');
      return eventRepository.getAllEvents();
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    ...options,
  });
};

export const useGetEventById = (
  id: string,
  options?: UseQueryOptions<Event | null, Error>,
) => {
  return useQuery<Event | null, Error>({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      if (!eventRepository) throw new Error('Repository not initialized');
      return eventRepository.getEventById(id);
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

// Mutations
export const useCreateEvent = (
  options?: UseMutationOptions<Event, Error, Event>,
) => {
  const queryClient = useQueryClient();

  return useMutation<Event, Error, Event>({
    mutationFn: async (event: Event) => {
      if (!eventRepository) throw new Error('Repository not initialized');
      return eventRepository.createEvent(event);
    },
    onSuccess: newEvent => {
      // Invalidate and refetch events list
      queryClient.invalidateQueries({
        queryKey: eventKeys.lists(),
      });
      // Add the new event to cache
      queryClient.setQueryData(eventKeys.detail(newEvent.id), newEvent);
    },
    ...options,
  });
};

export const useUpdateEvent = (
  options?: UseMutationOptions<Event, Error, Event>,
) => {
  const queryClient = useQueryClient();

  return useMutation<Event, Error, Event>({
    mutationFn: async (event: Event) => {
      if (!eventRepository) throw new Error('Repository not initialized');
      return eventRepository.updateEvent(event);
    },
    onSuccess: updatedEvent => {
      // Update cache
      queryClient.setQueryData(eventKeys.detail(updatedEvent.id), updatedEvent);
      // Invalidate events list to refetch
      queryClient.invalidateQueries({
        queryKey: eventKeys.lists(),
      });
    },
    ...options,
  });
};

export const useDeleteEvent = (
  options?: UseMutationOptions<void, Error, string>,
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      if (!eventRepository) throw new Error('Repository not initialized');
      return eventRepository.deleteEvent(id);
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: eventKeys.detail(id),
      });
      // Invalidate events list
      queryClient.invalidateQueries({
        queryKey: eventKeys.lists(),
      });
    },
    ...options,
  });
};

export const useSyncEvents = (
  options?: UseMutationOptions<void, Error, void>,
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!eventRepository) throw new Error('Repository not initialized');
      return eventRepository.syncEvents();
    },
    onSuccess: () => {
      // Refetch events after sync
      queryClient.invalidateQueries({
        queryKey: eventKeys.lists(),
      });
    },
    ...options,
  });
};

/**
 * Hook to automatically sync events when app comes online
 * Monitors network connectivity and triggers sync on connection restoration
 */
export const useAutoSync = () => {
  const syncMutation = useSyncEvents();
  const syncMutationRef = useRef(syncMutation);

  // Update ref when syncMutation changes, but don't trigger effect
  useEffect(() => {
    syncMutationRef.current = syncMutation;
  }, [syncMutation]);

  // Set up network listener only once
  useEffect(() => {
    const networkInfo = new NetworkInfo();
    let isOnline = false;

    // Set up network listener
    const unsubscribe = networkInfo.observe(state => {
      const wasOnline = isOnline;
      isOnline = state.isConnected ?? false;

      // Trigger sync when transitioning from offline to online
      if (!wasOnline && isOnline) {
        console.log('📡 Network connected - syncing events...');
        syncMutationRef.current.mutate();
      }
    });

    // Initial check
    networkInfo.isConnected().then(connected => {
      isOnline = connected;
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe?.();
    };
  }, []); // Empty dependency array - only set up listener once
};
