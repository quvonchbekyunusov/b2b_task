import { IEventRepository } from '../../domain/repositories/EventRepository';
import { Event } from '../../domain/entities/Event';
import { IEventLocalDataSource } from '../local/eventLocalDataSource';
import { INetworkInfo } from '../../core/network/networkInfo';
import { EventStatus } from '../../types/enums';

export class EventRepositoryImpl implements IEventRepository {
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 2000; // 2 seconds

  constructor(
    private localDataSource: IEventLocalDataSource,
    private networkInfo: INetworkInfo,
  ) {}

  async getAllEvents(): Promise<Event[]> {
    return this.localDataSource.getEvents();
  }

  async getEventById(id: string): Promise<Event | null> {
    return this.localDataSource.getEventById(id);
  }

  async createEvent(event: Event): Promise<Event> {
    const isConnected = await this.networkInfo.isConnected();

    if (isConnected) {
      try {
        const localeEvent = { ...event };
        localeEvent.status = EventStatus.SENT;
        localeEvent.syncAttempts = 0;
        await this.localDataSource.saveEvent(localeEvent);
        return localeEvent;
      } catch (error: any) {
        event.status = EventStatus.FAILED;
        event.syncAttempts = 1;
        event.lastSyncError = error?.message || 'Failed to sync';
        await this.localDataSource.saveEvent(event);
        return event;
      }
    } else {
      event.status = EventStatus.PENDING;
      event.syncAttempts = 0;
      await this.localDataSource.saveEvent(event);
      return event;
    }
  }

  async updateEvent(event: Event): Promise<Event> {
    const isConnected = await this.networkInfo.isConnected();

    if (isConnected) {
      try {
        const localeEvent = { ...event };
        localeEvent.status = EventStatus.SENT;
        localeEvent.syncAttempts = 0;
        event.lastSyncError = '';
        await this.localDataSource.saveEvent(localeEvent);
        return localeEvent;
      } catch (error: any) {
        console.error('Failed to update event:', error);
        event.status = EventStatus.FAILED;
        event.syncAttempts = Math.min(
          event.syncAttempts + 1,
          this.MAX_RETRY_ATTEMPTS,
        );
        event.lastSyncError = error?.message || 'Failed to sync';
        await this.localDataSource.saveEvent(event);
        return event;
      }
    } else {
      event.status = EventStatus.PENDING;
      await this.localDataSource.saveEvent(event);
      return event;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    const isConnected = await this.networkInfo.isConnected();

    if (isConnected) {
      try {
        await this.localDataSource.deleteEvent(id);
      } catch (error) {
        console.warn('Failed to delete event from server:', error);
      }
    }
  }

  async syncEvents(): Promise<void> {
    const isConnected = await this.networkInfo.isConnected();

    if (!isConnected) {
      console.log('No network connection. Sync will retry when online.');
      return;
    }

    try {
      const localEvents = await this.localDataSource.getEvents();
      const pendingOrFailedEvents = localEvents.filter(
        e =>
          e.status === EventStatus.PENDING || e.status === EventStatus.FAILED,
      );

      for (const event of pendingOrFailedEvents) {
        // Skip if exceeded max retry attempts
        if (event.syncAttempts >= this.MAX_RETRY_ATTEMPTS) {
          console.warn(`Event ${event.id} exceeded max retry attempts`);
          continue;
        }

        try {
          const syncedEvent = { ...event };

          syncedEvent.status = EventStatus.SENT;
          syncedEvent.syncAttempts = 0;
          await this.localDataSource.saveEvent(syncedEvent);
          console.log(`Event ${event.id} synced successfully`);
        } catch (error: any) {
          event.syncAttempts += 1;
          event.lastSyncError = error?.message || 'Sync failed';

          if (event.syncAttempts >= this.MAX_RETRY_ATTEMPTS) {
            event.status = EventStatus.FAILED;
          } else {
            event.status = EventStatus.PENDING;
          }

          await this.localDataSource.saveEvent(event);
          console.warn(`Failed to sync event ${event.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Sync process failed:', error);
    }
  }
}
