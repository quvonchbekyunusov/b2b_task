import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { MOCK_OBJECTS } from '../core/mocks/mockData';
import { EventStatus } from '../types/enums';
import { useGetEvents, useSyncEvents } from '../core/hooks/useEvents';

const ObjectListScreen = ({ navigation }: any) => {
  // Use React Query to fetch events
  const {
    data: events = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetEvents();

  // Use React Query mutation for sync
  const { mutate: syncEvents, isPending: isSyncing } = useSyncEvents();

  const handleSelectObject = (objectId: string) => {
    navigation.navigate('CreateEvent', { objectId });
  };

  const getObjectEventCount = (objectId: string) => {
    return events.filter(e => e.objectId === objectId).length;
  };

  const getObjectPendingCount = (objectId: string) => {
    return events.filter(
      e => e.objectId === objectId && e.status === EventStatus.PENDING,
    ).length;
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleSync = () => {
    syncEvents();
  };

  const renderObjectItem = ({ item }: { item: any }) => {
    const eventCount = getObjectEventCount(item.id);
    const itemPendingCount = getObjectPendingCount(item.id);
    const firstEventForObject = events.find(e => e.objectId === item.id);

    return (
      <TouchableOpacity
        style={styles.objectCard}
        onPress={() => handleSelectObject(item.id)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.objectName}>{item.name}</Text>
            <Text style={styles.objectType}>{item.type}</Text>
            {item.plate && (
              <Text style={styles.plate}>Plate: {item.plate}</Text>
            )}
          </View>
          {itemPendingCount > 0 && (
            <TouchableOpacity
              style={styles.pendingBadge}
              onPress={() => {
                if (firstEventForObject) {
                  navigation.navigate('EventDetail', {
                    eventId: firstEventForObject.id,
                  });
                }
              }}
            >
              <Text style={styles.pendingText}>{itemPendingCount}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.eventCount}>
            {eventCount} event{eventCount !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.createButtonText}>→ Create Event</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Objects</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('EventsList')}
          >
            <Text style={styles.viewAllButtonText}>📋 Events</Text>
          </TouchableOpacity>
          {events.filter(e => e.status === EventStatus.PENDING).length > 0 && (
            <TouchableOpacity
              style={styles.syncButton}
              onPress={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#ff9800" />
              ) : (
                <Text style={styles.syncButtonText}>⟳ Sync</Text>
              )}
            </TouchableOpacity>
          )}
          {events.filter(e => e.status === EventStatus.PENDING).length > 0 && (
            <View style={styles.syncIndicator}>
              <Text style={styles.syncText}>
                {events.filter(e => e.status === EventStatus.PENDING).length}{' '}
                pending
              </Text>
            </View>
          )}
        </View>
      </View>

      {isError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error?.message || 'Failed to load events'}
          </Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={MOCK_OBJECTS}
          renderItem={renderObjectItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncButton: {
    backgroundColor: '#ff9800',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  syncButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  viewAllButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  syncIndicator: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  syncText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  objectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  objectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  objectType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  plate: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#ff6b6b',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  eventCount: {
    fontSize: 13,
    color: '#999',
  },
  createButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  eventCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ObjectListScreen;
