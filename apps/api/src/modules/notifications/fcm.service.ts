/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { getApp, getApps, initializeApp, cert } from 'firebase-admin/app';
// eslint-disable-next-line prettier/prettier
import { getMessaging, MulticastMessage, BatchResponse } from 'firebase-admin/messaging';
import { FCM_BATCH_SIZE, NOTIFICATION_JOB_NAME_NEW_EVENT } from './notification.constants';
import { NotificationEventRow, FcmInvalidTokenRecord, FcmSendReport } from './notification.types';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private messaging: ReturnType<typeof getMessaging> | null = null;

  constructor() {
    const credentialJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY;

    if (!credentialJson) {
      this.logger.warn('Firebase Admin service account is not configured. Push notifications will fail until FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY is set.');
      return;
    }

    try {
      const credential = JSON.parse(credentialJson);
      const app = getApps().length ? getApp() : initializeApp({ credential: cert(credential) });
      this.messaging = getMessaging(app);
      this.logger.log('✅ Firebase Admin initialized for FCM delivery');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK for FCM', error as Error);
      this.messaging = null;
    }
  }

  async sendNewEventNotification(tokens: string[], event: NotificationEventRow): Promise<FcmSendReport> {
    if (!this.messaging) {
      throw new Error('Firebase messaging client is not initialized');
    }

    const message: MulticastMessage = {
      notification: {
        title: 'New Event',
        body: event.title || event.description?.slice(0, 120) || 'A new mosque event is available.',
      },
      data: {
        eventId: event.id,
        mosqueId: event.mosque_id,
        type: NOTIFICATION_JOB_NAME_NEW_EVENT,
        screen: 'EventDetails',
      },
      tokens,
    };

    return this.sendTokenChunks(tokens, message);
  }

  private async sendTokenChunks(tokens: string[], message: MulticastMessage): Promise<FcmSendReport> {
    const report: FcmSendReport = {
      successCount: 0,
      failureCount: 0,
      invalidTokens: [],
    };

    for (let i = 0; i < tokens.length; i += FCM_BATCH_SIZE) {
      const chunk = tokens.slice(i, i + FCM_BATCH_SIZE);
      const batchMessage = { ...message, tokens: chunk };

      this.logger.log(`Sending FCM batch ${Math.floor(i / FCM_BATCH_SIZE) + 1} / ${Math.ceil(tokens.length / FCM_BATCH_SIZE)}`);

      const response = await this.messaging!.sendEachForMulticast(batchMessage);
      report.successCount += response.successCount;
      report.failureCount += response.failureCount;

      response.responses.forEach((sendResponse, index: number) => {
        if (!sendResponse.success) {
          const token = chunk[index];
          const reason = sendResponse.error?.code || sendResponse.error?.message || 'unknown';

          if (
            sendResponse.error?.code === 'messaging/invalid-registration-token' ||
            sendResponse.error?.code === 'messaging/registration-token-not-registered' ||
            sendResponse.error?.code === 'messaging/invalid-argument'
          ) {
            report.invalidTokens.push({
              id: '',
              token,
              reason,
            });
          }
        }
      });
    }

    return report;
  }
}
