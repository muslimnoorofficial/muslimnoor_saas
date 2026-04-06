import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { NotificationModule } from './modules/notifications/notification.module';

async function bootstrap() {
  const logger = new Logger('NotificationWorkerBootstrap');
  const app = await NestFactory.createApplicationContext(NotificationModule, {
    logger: ['log', 'warn', 'error', 'debug'],
  });

  await app.init();
  logger.log('📬 Notification worker initialized and listening to the notifications queue');
}

bootstrap().catch((error) => {
  console.error('Notification worker failed to start', error);
  process.exit(1);
});
