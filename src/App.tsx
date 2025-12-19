import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from './store';
import ObjectListScreen from './screens/ObjectListScreen';
import CreateEventScreen from './screens/CreateEventScreen';
import EventDetailScreen from './screens/EventDetailScreen';
import EventsListScreen from './screens/EventsListScreen';
import { Database, IDatabase } from './core/storage/database';
import { MemoryStorage } from './core/storage/memoryStorage';
import { SQLiteStorage } from './core/storage/sqliteStorage';
import { ReduxStorage } from './core/storage/reduxStorage';
import { NetworkInfo } from './core/network/networkInfo';
import { EventLocalDataSource } from './data/local/eventLocalDataSource';
import { EventRepositoryImpl } from './data/repositories/EventRepositoryImpl';
import { setEventRepository, useAutoSync } from './core/hooks/useEvents';

const Stack = createNativeStackNavigator();

// Storage type options
export type StorageType = 'asyncStorage' | 'memory' | 'sqlite' | 'redux';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Create storage instance based on type
 * @param storageType - The type of storage to use: 'asyncStorage' | 'memory' | 'sqlite' | 'redux'
 * @returns IDatabase instance
 */
const createStorage = (
  storageType: StorageType = 'asyncStorage',
): IDatabase => {
  switch (storageType) {
    case 'memory':
      console.log('Initializing Memory Storage');
      return new MemoryStorage();
    case 'sqlite':
      console.log('Initializing SQLite Storage');
      return new SQLiteStorage();
    case 'redux':
      console.log('Initializing Redux Storage');
      return new ReduxStorage(store);
    case 'asyncStorage':
    default:
      console.log('Initializing AsyncStorage');
      return new Database();
  }
};

// Initialize dependencies (can switch storage type here)
const initializeRepository = (storageType: StorageType = 'asyncStorage') => {
  const database = createStorage(storageType);
  const networkInfo = new NetworkInfo();
  const localDataSource = new EventLocalDataSource(database);
  const repository = new EventRepositoryImpl(localDataSource, networkInfo);
  setEventRepository(repository);
};

function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';

  // Set up automatic sync when app comes online
  useAutoSync();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: true,
          }}
        >
          <Stack.Screen
            name="ObjectList"
            component={ObjectListScreen}
            options={{ title: 'Events' }}
          />
          <Stack.Screen
            name="EventsList"
            component={EventsListScreen}
            options={{ title: 'All Events' }}
          />
          <Stack.Screen
            name="CreateEvent"
            component={CreateEventScreen}
            options={{ title: 'Create Event' }}
          />
          <Stack.Screen
            name="EventDetail"
            component={EventDetailScreen}
            options={{ title: 'Event Details' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function App() {
  // Initialize repository on app startup with desired storage type
  // Change 'redux' to 'asyncStorage', 'memory', or 'sqlite' to switch storage backends
  useEffect(() => {
    initializeRepository('redux');
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
