import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SupabaseModule } from '../supabase/supabase.module';
import { NotificationProducerService } from './notification.service';
import { NotificationWorker } from './notification.worker';
import { FcmService } from './fcm.service';
import { NOTIFICATIONS_QUEUE_NAME, NOTIFICATION_QUEUE_DEFAULT_JOB_OPTIONS } from './notification.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: NOTIFICATIONS_QUEUE_NAME,
      connection: {
        host: process.env.REDIS_HOST ?? '127.0.0.1',
        port: Number(process.env.REDIS_PORT ?? 6379),
        password: process.env.REDIS_PASSWORD || undefined,
        db: Number(process.env.REDIS_DB ?? 0),
      },
      defaultJobOptions: NOTIFICATION_QUEUE_DEFAULT_JOB_OPTIONS,
    }),
    SupabaseModule,
  ],
  providers: [NotificationProducerService, NotificationWorker, FcmService],
  exports: [NotificationProducerService],
})
export class NotificationModule {}
