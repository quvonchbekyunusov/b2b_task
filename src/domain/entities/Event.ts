import { EventStatus, EventType } from '../../types/enums';

export interface Event {
  id: string;
  objectId: string;
  type: EventType;
  comment: string;
  occurredAt: Date;
  photoUri?: string;
  status: EventStatus;
  syncAttempts: number;
  lastSyncError?: string;
  createdAt: Date;
  updatedAt: Date;
  serverId?: string;
}

export class EventEntity implements Event {
  id: string;
  objectId: string;
  type: EventType;
  comment: string;
  occurredAt: Date;
  photoUri?: string;
  status: EventStatus;
  syncAttempts: number;
  lastSyncError?: string;
  createdAt: Date;
  updatedAt: Date;
  serverId?: string;

  constructor(
    id: string,
    objectId: string,
    type: EventType,
    comment: string,
    occurredAt: Date,
    photoUri?: string,
    status: EventStatus = EventStatus.PENDING,
    syncAttempts: number = 0,
    lastSyncError?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    serverId?: string,
  ) {
    this.id = id;
    this.objectId = objectId;
    this.type = type;
    this.comment = comment;
    this.occurredAt = occurredAt;
    this.photoUri = photoUri;
    this.status = status;
    this.syncAttempts = syncAttempts;
    this.lastSyncError = lastSyncError;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.serverId = serverId;
  }
}
