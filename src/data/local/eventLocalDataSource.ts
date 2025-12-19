import { Event } from '../../domain/entities/Event';
import { IDatabase } from '../../core/storage/database';

export interface IEventLocalDataSource {
  saveEvents(events: Event[]): Promise<void>;
  getEvents(): Promise<Event[]>;
  saveEvent(event: Event): Promise<void>;
  getEventById(id: string): Promise<Event | null>;
  deleteEvent(id: string): Promise<void>;
  clearEvents(): Promise<void>;
}

export class EventLocalDataSource implements IEventLocalDataSource {
  private readonly EVENTS_KEY = 'events';

  constructor(private database: IDatabase) {}

  async saveEvents(events: Event[]): Promise<void> {
    const serialized = JSON.stringify(events);
    await this.database.setItem(this.EVENTS_KEY, serialized);
  }

  async getEvents(): Promise<Event[]> {
    const data = await this.database.getItem(this.EVENTS_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async saveEvent(event: Event): Promise<void> {
    const events = await this.getEvents();
    const index = events.findIndex(e => e.id === event.id);
    if (index >= 0) {
      events[index] = event;
    } else {
      events.push(event);
    }
    await this.saveEvents(events);
  }

  async getEventById(id: string): Promise<Event | null> {
    const events = await this.getEvents();
    return events.find(e => e.id === id) || null;
  }

  async deleteEvent(id: string): Promise<void> {
    const events = await this.getEvents();
    const filtered = events.filter(e => e.id !== id);
    await this.saveEvents(filtered);
  }

  async clearEvents(): Promise<void> {
    await this.database.removeItem(this.EVENTS_KEY);
  }
}
