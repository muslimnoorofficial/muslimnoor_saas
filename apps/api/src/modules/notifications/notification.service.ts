/* eslint-disable prettier/prettier */
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { NotificationJobData } from './notification.types';
import {
  NOTIFICATIONS_QUEUE_NAME,
  NOTIFICATION_JOB_ID_PREFIX,
  NOTIFICATION_JOB_NAME_NEW_EVENT,
  NOTIFICATION_QUEUE_DEFAULT_JOB_OPTIONS,
} from './notification.constants';

@Injectable()
export class NotificationProducerService {
  private readonly logger = new Logger(NotificationProducerService.name);

  constructor(
    @InjectQueue(NOTIFICATIONS_QUEUE_NAME)
    private readonly notificationQueue: Queue<NotificationJobData>,
  ) {}

  /**
   * Enqueue a minimal notification job immediately after event creation.
   * This method is intentionally fire-and-forget to avoid blocking the API response.
   */
  publishNewEventNotification(eventId: string, mosqueId: string): void {
    const jobId = `${NOTIFICATION_JOB_ID_PREFIX}${eventId}`;
    const jobData: NotificationJobData = {
      eventId,
      mosqueId,
      type: NOTIFICATION_JOB_NAME_NEW_EVENT,
    };

    void this.notificationQueue
      .add(NOTIFICATION_JOB_NAME_NEW_EVENT, jobData, {
        jobId,
        ...NOTIFICATION_QUEUE_DEFAULT_JOB_OPTIONS,
      })
      .then(() => {
        this.logger.log(`Enqueued notification job ${jobId} for mosque=${mosqueId}`);
      })
      .catch((error) => {
        this.logger.error(
          `Failed to enqueue notification job ${jobId} for mosque=${mosqueId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      });
  }
}
