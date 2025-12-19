import { Event } from '../entities/Event';

export interface IEventRepository {
  getAllEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | null>;
  createEvent(event: Event): Promise<Event>;
  updateEvent(event: Event): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  syncEvents(): Promise<void>;
}
