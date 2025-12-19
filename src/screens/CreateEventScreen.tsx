import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { EventType, EventStatus } from '../types/enums';
import { EventEntity } from '../domain/entities/Event';
import { generateUUID } from '../core/utils/uuid';
import {
  createEventSchema,
  CreateEventFormData,
} from '../core/validation/eventValidation';
import { useCreateEvent } from '../core/hooks/useEvents';

const CreateEventScreen = ({ navigation, route }: any) => {
  const { objectId } = route.params || {};
  const createEventMutation = useCreateEvent();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventFormData>({
    resolver: yupResolver(createEventSchema) as unknown as any,
    defaultValues: {
      objectId: objectId || '',
      type: undefined,
      comment: '',
      occurredAt: new Date(),
      photoUri: undefined,
    },
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const onSubmit = async (data: CreateEventFormData) => {
    const newEvent = new EventEntity(
      generateUUID(),
      data.objectId,
      data.type as EventType,
      data.comment,
      data.occurredAt,
      data.photoUri || undefined,
      EventStatus.PENDING,
      0,
    );

    createEventMutation.mutate(newEvent, {
      onSuccess: () => {
        Alert.alert(
          'Success',
          'Event saved locally. It will sync when online.',
        );
        navigation.goBack();
      },
      onError: error => {
        console.error('CreateEvent error', error);
        Alert.alert('Error', 'Failed to create event');
      },
    });
  };

  const getEventTypeLabel = (type: EventType): string => {
    switch (type) {
      case EventType.ACCIDENT:
        return 'Accident / Incident';
      case EventType.SERVICE:
        return 'Service / Maintenance';
      case EventType.TRANSFER:
        return 'Transfer / Handover';
      default:
        return '';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Object Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Object</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>ID: {objectId}</Text>
          </View>
        </View>

        {/* Event Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Event Type *{' '}
            {errors.type && <Text style={styles.error}>(Required)</Text>}
          </Text>
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <View style={styles.typeContainer}>
                {Object.values(EventType).map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      value === type && styles.typeButtonSelected,
                    ]}
                    onPress={() => onChange(type)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        value === type && styles.typeButtonTextSelected,
                      ]}
                    >
                      {getEventTypeLabel(type as EventType)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.type && (
            <Text style={styles.errorText}>{errors.type.message}</Text>
          )}
        </View>

        {/* Comment */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Comment / Description *
            {errors.comment && (
              <Text style={styles.error}> ({errors.comment.message})</Text>
            )}
          </Text>
          <Controller
            control={control}
            name="comment"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe what happened..."
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={5}
                placeholderTextColor="#ccc"
                editable={!isSubmitting}
              />
            )}
          />
          {errors.comment && (
            <Text style={styles.errorText}>{errors.comment.message}</Text>
          )}
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Date of Event *
            {errors.occurredAt && <Text style={styles.error}> (Required)</Text>}
          </Text>
          <Controller
            control={control}
            name="occurredAt"
            render={({ field: { onChange, value } }) => (
              <>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.dateButtonText}>
                    {value.toLocaleDateString()} {value.toLocaleTimeString()}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={value}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') {
                        setShowDatePicker(false);
                      }
                      if (selectedDate) {
                        onChange(selectedDate);
                      }
                    }}
                  />
                )}
              </>
            )}
          />
          {errors.occurredAt && (
            <Text style={styles.errorText}>{errors.occurredAt.message}</Text>
          )}
        </View>

        {/* Photo URL (optional) */}
        <View style={styles.section}>
          <Text style={styles.label}>Photo (URL or data URI)</Text>
          <Controller
            control={control}
            name="photoUri"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="https://... or data:image/..."
                  value={value ?? ''}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  editable={!isSubmitting}
                />
                {value ? (
                  <Image source={{ uri: value }} style={styles.photoPreview} />
                ) : null}
              </>
            )}
          />
          {errors.photoUri && (
            <Text style={styles.errorText}>{errors.photoUri.message}</Text>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>📌 Data Storage</Text>
          <Text style={styles.infoText}>
            Your event will be saved locally on your device. When internet
            connection is available, it will automatically sync to the server.
            Your data is never lost.
          </Text>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[
            styles.button,
            (isSubmitting || createEventMutation.isPending) &&
              styles.buttonDisabled,
          ]}
          onPress={handleSubmit(onSubmit as any)}
          disabled={isSubmitting || createEventMutation.isPending}
        >
          {isSubmitting || createEventMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Event</Text>
          )}
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  error: {
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: '400',
  },
  errorText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 4,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 12,
    minHeight: 100,
  },
  infoBox: {
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    fontSize: 14,
    color: '#0066cc',
  },
  typeContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  typeButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  typeButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e8f4f8',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  typeButtonTextSelected: {
    color: '#007AFF',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#ff9800',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 24,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 20,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
});

export default CreateEventScreen;
