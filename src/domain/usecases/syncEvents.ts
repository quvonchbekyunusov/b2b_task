import { IEventRepository } from '../repositories/EventRepository';

export class SyncEventsUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(): Promise<void> {
    return this.eventRepository.syncEvents();
  }
}
