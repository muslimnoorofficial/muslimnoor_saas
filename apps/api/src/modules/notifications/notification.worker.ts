/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable prettier/prettier */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { FcmService } from './fcm.service';
import {
  NOTIFICATIONS_QUEUE_NAME,
  NOTIFICATION_JOB_NAME_NEW_EVENT,
} from './notification.constants';
import {
  NotificationJobData,
  NotificationEventRow,
  MosqueMemberRow,
  UserDeviceRow,
  FcmInvalidTokenRecord,
} from './notification.types';

@Processor(NOTIFICATIONS_QUEUE_NAME)
export class NotificationWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationWorker.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly fcmService: FcmService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>) {
    const startTime = Date.now();
    const { eventId, mosqueId, type } = job.data;

    this.logger.log(`Worker started job=${job.id} type=${type} eventId=${eventId} mosqueId=${mosqueId}`);

    if (type !== NOTIFICATION_JOB_NAME_NEW_EVENT) {
      this.logger.warn(`Unsupported notification job type=${type} job=${job.id}`);
      return;
    }

    const event = await this.loadEvent(eventId, mosqueId);
    const members = await this.loadMosqueMembers(mosqueId);
    const userIds = members.map((member) => member.user_id).filter(Boolean);

    if (userIds.length === 0) {
      this.logger.log(`No active mosque members found for mosque=${mosqueId}, job=${job.id}`);
      return;
    }

    const devices = await this.loadActiveDeviceTokens(userIds);
    const tokenSet = new Set<string>();
    const validDeviceRecords: UserDeviceRow[] = [];

    devices.forEach((device) => {
      const token = device.device_token?.trim();
      if (token) {
        if (!tokenSet.has(token)) {
          tokenSet.add(token);
          validDeviceRecords.push(device);
        }
      }
    });

    const validTokens = Array.from(tokenSet);
    if (validTokens.length === 0) {
      this.logger.log(`No valid push tokens found for mosque=${mosqueId}, job=${job.id}`);
      return;
    }

    const fcmReport = await this.fcmService.sendNewEventNotification(validTokens, event);

    if (fcmReport.invalidTokens.length > 0) {
      await this.deactivateInvalidDeviceTokens(fcmReport.invalidTokens, validDeviceRecords);
    }

    const durationMs = Date.now() - startTime;
    this.logger.log(
      `Worker completed job=${job.id} eventId=${eventId} mosqueId=${mosqueId} users=${userIds.length} validTokens=${validTokens.length} success=${fcmReport.successCount} failure=${fcmReport.failureCount} durationMs=${durationMs}ms`,
    );
  }

  private async loadEvent(eventId: string, mosqueId: string): Promise<NotificationEventRow> {
    const result = await this.supabase.client
      .from('events')
      .select('id, mosque_id, title, description, start_at')
      .eq('id', eventId)
      .eq('mosque_id', mosqueId)
      .single();

    const data = result.data as NotificationEventRow | null;
    if (result.error || !data) {
      throw new Error(`Event not found or inaccessible eventId=${eventId} mosqueId=${mosqueId} ${result.error?.message ?? ''}`);
    }

    return data;
  }

  private async loadMosqueMembers(mosqueId: string): Promise<MosqueMemberRow[]> {
    const result = await this.supabase.client
      .from('mosque_members')
      .select('user_id')
      .eq('mosque_id', mosqueId)
      .eq('is_active', true);

    if (result.error) {
      throw new Error(`Failed to load mosque members mosqueId=${mosqueId} ${result.error.message}`);
    }

    return (result.data as MosqueMemberRow[] | null) ?? [];
  }

  private async loadActiveDeviceTokens(userIds: string[]): Promise<UserDeviceRow[]> {
    const result = await this.supabase.client
      .from('user_devices')
      .select('id, user_id, device_token')
      .in('user_id', userIds)
      .eq('is_active', true)
      .not('device_token', 'is', null)
      .neq('device_token', '');

    if (result.error) {
      throw new Error(`Failed to load user devices ${result.error.message}`);
    }

    return (result.data as UserDeviceRow[] | null) ?? [];
  }

  private async deactivateInvalidDeviceTokens(
    invalidTokens: FcmInvalidTokenRecord[],
    deviceRecords: UserDeviceRow[],
  ) {
    const invalidTokenSet = new Set(invalidTokens.map((record) => record.token));
    const deviceIdsToDeactivate = deviceRecords
      .filter((record) => invalidTokenSet.has(record.device_token))
      .map((record) => record.id);

    if (deviceIdsToDeactivate.length === 0) {
      return;
    }

    const { error } = await this.supabase.client
      .from('user_devices')
      .update({ is_active: false, last_failed_at: new Date().toISOString(), failure_reason: 'FCM invalid or unregistered token' })
      .in('id', deviceIdsToDeactivate);

    if (error) {
      this.logger.warn(`Failed to mark invalid device tokens inactive: ${error.message}`);
    } else {
      this.logger.log(`Marked ${deviceIdsToDeactivate.length} invalid device tokens inactive`);
    }
  }
}
