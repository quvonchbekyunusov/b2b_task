import { configureStore } from '@reduxjs/toolkit';
import eventReducer from './eventSlice';

const store = configureStore({
  reducer: {
    events: eventReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: [
          'events/addEvent',
          'events/setEvents',
          'events/updateEvent',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
