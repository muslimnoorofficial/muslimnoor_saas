export type NotificationJobType = 'NEW_EVENT';

export interface NotificationJobData {
  eventId: string;
  mosqueId: string;
  type: NotificationJobType;
}

export interface NotificationEventRow {
  id: string;
  mosque_id: string;
  title: string;
  description?: string | null;
  start_at: string;
}

export interface MosqueMemberRow {
  user_id: string;
}

export interface UserDeviceRow {
  id: string;
  user_id: string;
  device_token: string;
}

export interface FcmInvalidTokenRecord {
  id: string;
  token: string;
  reason: string;
}

export interface FcmSendReport {
  successCount: number;
  failureCount: number;
  invalidTokens: FcmInvalidTokenRecord[];
}
