import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  useGetEventById,
  useUpdateEvent,
  useSyncEvents,
} from '../core/hooks/useEvents';
import { useRoute } from '@react-navigation/native';

const EventDetailScreen = () => {
  const route = useRoute();
  const { eventId } = (route.params || {}) as { eventId?: string };

  const {
    data: event,
    isLoading,
    isError,
    refetch,
  } = useGetEventById(eventId || '');

  const updateMutation = useUpdateEvent();
  const syncAll = useSyncEvents();

  const handleRetry = async () => {
    if (!event) return;
    try {
      await updateMutation.mutateAsync(event);
      Alert.alert('Sync', 'Retry initiated');
      refetch();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Retry failed');
    }
  };

  const handleSyncAll = async () => {
    try {
      await syncAll.mutateAsync();
      Alert.alert('Sync', 'Sync completed');
      refetch();
    } catch {
      Alert.alert('Error', 'Sync failed');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (isError || !event) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
    >
      <View style={styles.card}>
        <Text style={styles.title}>{event.type}</Text>
        <Text style={styles.meta}>Object: {event.objectId}</Text>
        <Text style={styles.meta}>Status: {event.status}</Text>
        <Text style={styles.meta}>
          Occurred: {new Date(event.occurredAt).toLocaleString()}
        </Text>
        <Text style={styles.comment}>{event.comment}</Text>

        {event.photoUri ? (
          <Image source={{ uri: event.photoUri }} style={styles.photo} />
        ) : null}

        {event.lastSyncError ? (
          <Text style={styles.errorText}>
            Last sync error: {event.lastSyncError}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.button} onPress={handleRetry}>
            <Text style={styles.buttonText}>Retry Sync</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.outline]}
            onPress={handleSyncAll}
          >
            <Text style={[styles.buttonText, styles.outlineText]}>
              Sync All
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { margin: 16, backgroundColor: '#fff', padding: 16, borderRadius: 8 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  meta: { fontSize: 13, color: '#666', marginBottom: 6 },
  comment: { marginTop: 12, fontSize: 15, color: '#000' },
  photo: { width: '100%', height: 240, marginTop: 12, borderRadius: 8 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  outline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#007AFF' },
  outlineText: { color: '#007AFF' },
  errorText: { color: '#c62828', padding: 16 },
});

export default EventDetailScreen;
