import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Event } from '../domain/entities/Event';
import { SyncStatus } from '../types/enums';

// Helper to serialize dates to ISO strings
const serializeEvent = (event: Event): Event => ({
  ...event,
  occurredAt:
    event.occurredAt instanceof Date
      ? (event.occurredAt.toISOString() as unknown as Date)
      : event.occurredAt,
  createdAt:
    event.createdAt instanceof Date
      ? (event.createdAt.toISOString() as unknown as Date)
      : event.createdAt,
  updatedAt:
    event.updatedAt instanceof Date
      ? (event.updatedAt.toISOString() as unknown as Date)
      : event.updatedAt,
});

// Helper to deserialize ISO strings back to dates
const deserializeEvent = (event: Event): Event => ({
  ...event,
  occurredAt:
    typeof event.occurredAt === 'string'
      ? new Date(event.occurredAt)
      : event.occurredAt,
  createdAt:
    typeof event.createdAt === 'string'
      ? new Date(event.createdAt)
      : event.createdAt,
  updatedAt:
    typeof event.updatedAt === 'string'
      ? new Date(event.updatedAt)
      : event.updatedAt,
});

export interface EventState {
  events: Event[];
  loading: boolean;
  error: string | null;
  syncStatus: SyncStatus;
  pendingCount: number;
  storage: Record<string, string>; // Generic key-value storage for ReduxStorage backend
}

const initialState: EventState = {
  events: [],
  loading: false,
  error: null,
  syncStatus: SyncStatus.IDLE,
  pendingCount: 0,
  storage: {},
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload.map(serializeEvent);
      state.pendingCount = action.payload.filter(
        e => e.status === 'PENDING',
      ).length;
    },
    addEvent: (state, action: PayloadAction<Event>) => {
      state.events.push(serializeEvent(action.payload));
      if (action.payload.status === 'PENDING') {
        state.pendingCount += 1;
      }
    },
    updateEvent: (state, action: PayloadAction<Event>) => {
      const index = state.events.findIndex(e => e.id === action.payload.id);
      if (index >= 0) {
        const oldStatus = state.events[index].status;
        state.events[index] = serializeEvent(action.payload);
        // Update pending count
        if (oldStatus === 'PENDING' && action.payload.status !== 'PENDING') {
          state.pendingCount = Math.max(0, state.pendingCount - 1);
        } else if (
          oldStatus !== 'PENDING' &&
          action.payload.status === 'PENDING'
        ) {
          state.pendingCount += 1;
        }
      }
    },
    removeEvent: (state, action: PayloadAction<string>) => {
      const event = state.events.find(e => e.id === action.payload);
      if (event?.status === 'PENDING') {
        state.pendingCount = Math.max(0, state.pendingCount - 1);
      }
      state.events = state.events.filter(e => e.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSyncStatus: (state, action: PayloadAction<SyncStatus>) => {
      state.syncStatus = action.payload;
    },
    // Storage reducers for ReduxStorage backend
    setStorageItem: (
      state,
      action: PayloadAction<{ key: string; value: string }>,
    ) => {
      state.storage[action.payload.key] = action.payload.value;
    },
    removeStorageItem: (state, action: PayloadAction<string>) => {
      delete state.storage[action.payload];
    },
    clearStorage: state => {
      state.storage = {};
    },
  },
});

export const {
  setEvents,
  addEvent,
  updateEvent,
  removeEvent,
  setLoading,
  setError,
  setSyncStatus,
  setStorageItem,
  removeStorageItem,
  clearStorage,
} = eventSlice.actions;

// Selector to get events with deserialized dates
export const selectEvents = (state: { events: EventState }): Event[] =>
  state.events.events.map(deserializeEvent);

export default eventSlice.reducer;
