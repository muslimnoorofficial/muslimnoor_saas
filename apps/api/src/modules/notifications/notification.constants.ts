export const NOTIFICATIONS_QUEUE_NAME = 'notifications';

export const NOTIFICATION_JOB_NAME_NEW_EVENT = 'NEW_EVENT';

export const NOTIFICATION_JOB_ID_PREFIX = 'new-event:';

export const NOTIFICATION_QUEUE_DEFAULT_JOB_OPTIONS = {
  attempts: 5,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: { age: 86400, count: 1000 },
  removeOnFail: { age: 604800, count: 1000 },
};

export const FCM_BATCH_SIZE = 500;
