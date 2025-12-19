export enum EventStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export enum EventType {
  ACCIDENT = 'ACCIDENT',
  SERVICE = 'SERVICE',
  TRANSFER = 'TRANSFER',
}

export enum SyncStatus {
  IDLE = 'IDLE',
  SYNCING = 'SYNCING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}
