import { IEventRepository } from '../repositories/EventRepository';
import { Event, EventEntity } from '../entities/Event';
import { EventStatus, EventType } from '../../types/enums';
import { generateUUID } from '../../core/utils/uuid';

export interface CreateEventParams {
  objectId: string;
  type: EventType;
  comment: string;
  occurredAt: Date;
  photoUri?: string;
}

export class CreateEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(params: CreateEventParams): Promise<Event> {
    const event = new EventEntity(
      generateUUID(),
      params.objectId,
      params.type,
      params.comment,
      params.occurredAt,
      params.photoUri,
      EventStatus.PENDING,
      0,
    );

    return this.eventRepository.createEvent(event);
  }
}
