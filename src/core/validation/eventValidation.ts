import * as yup from 'yup';
import { EventType } from '../../types/enums';

export const createEventSchema = yup.object().shape({
  objectId: yup
    .string()
    .required('Object is required')
    .min(1, 'Please select an object'),
  type: yup
    .string()
    .oneOf(Object.values(EventType), 'Invalid event type')
    .required('Event type is required'),
  comment: yup
    .string()
    .required('Comment is required')
    .min(5, 'Comment must be at least 5 characters')
    .max(500, 'Comment must not exceed 500 characters'),
  occurredAt: yup
    .date()
    .required('Date is required')
    .typeError('Date must be valid'),
  photoUri: yup
    .string()
    .trim()
    .notRequired()
    .test('is-url-or-empty', 'Photo must be a valid URL', value => {
      if (!value) return true;
      try {
        return /^data:|^https?:\/\//.test(value);
      } catch {
        return false;
      }
    }),
});

export type CreateEventFormData = yup.InferType<typeof createEventSchema>;
