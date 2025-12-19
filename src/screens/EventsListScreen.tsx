import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SectionList,
} from 'react-native';
import { useGetEvents, useSyncEvents } from '../core/hooks/useEvents';
import { EventStatus, EventType } from '../types/enums';

const EventsListScreen = ({ navigation }: any) => {
  const [filterStatus, setFilterStatus] = useState<EventStatus | 'ALL'>('ALL');

  // Use React Query to fetch events
  const {
    data: events = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetEvents();

  // Use React Query mutation for sync
  const { mutate: syncEvents, isPending: isSyncing } = useSyncEvents();

  const getStatusColor = (status: EventStatus): string => {
    switch (status) {
      case EventStatus.SENT:
        return '#4caf50';
      case EventStatus.PENDING:
        return '#ff9800';
      case EventStatus.FAILED:
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getEventTypeLabel = (type: EventType): string => {
    switch (type) {
      case EventType.ACCIDENT:
        return 'Accident';
      case EventType.SERVICE:
        return 'Service';
      case EventType.TRANSFER:
        return 'Transfer';
      default:
        return type;
    }
  };

  // Filter events by status
  const filteredEvents =
    filterStatus === 'ALL'
      ? events
      : events.filter(e => e.status === filterStatus);

  // Group events by status
  const groupedEvents = [
    {
      title: 'Sent',
      data: filteredEvents.filter(e => e.status === EventStatus.SENT),
      status: EventStatus.SENT,
    },
    {
      title: 'Pending',
      data: filteredEvents.filter(e => e.status === EventStatus.PENDING),
      status: EventStatus.PENDING,
    },
    {
      title: 'Failed',
      data: filteredEvents.filter(e => e.status === EventStatus.FAILED),
      status: EventStatus.FAILED,
    },
  ].filter(group => filterStatus === 'ALL' || group.status === filterStatus);

  const handleRefresh = () => {
    refetch();
  };

  const handleSync = () => {
    syncEvents();
  };

  const renderEventItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      <View style={styles.eventHeader}>
        <View style={styles.eventInfo}>
          <Text style={styles.eventType}>{getEventTypeLabel(item.type)}</Text>
          <Text style={styles.eventObjectId}>{item.objectId}</Text>
          <Text style={styles.eventDate}>
            {new Date(item.occurredAt).toLocaleDateString()}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.eventComment} numberOfLines={2}>
        {item.comment}
      </Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View
      style={[
        styles.sectionHeader,
        { borderLeftColor: getStatusColor(section.status) },
      ]}
    >
      <Text style={styles.sectionTitle}>
        {section.title} ({section.data.length})
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No events yet</Text>
      <Text style={styles.emptySubtext}>Create one to get started</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.syncButtonText}>⟳ Sync</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(
          [
            'ALL',
            EventStatus.SENT,
            EventStatus.PENDING,
            EventStatus.FAILED,
          ] as const
        ).map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filterStatus === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === status && styles.filterButtonTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error?.message || 'Failed to load events'}
          </Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : filteredEvents.length === 0 ? (
        renderEmptyState()
      ) : (
        <SectionList
          sections={groupedEvents}
          keyExtractor={(item, index) => item.id + index}
          renderItem={renderEventItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  syncButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  listContent: {
    padding: 12,
  },
  sectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventInfo: {
    flex: 1,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  eventObjectId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 11,
    color: '#999',
  },
  eventComment: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
  },
});

export default EventsListScreen;
