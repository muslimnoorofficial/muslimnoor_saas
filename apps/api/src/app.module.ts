import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestController } from './test.controller';
import { DonationsModule } from './modules/donations/donations.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { EventsModule } from './modules/events/events.module';
import { AuthModule } from './modules/auth/auth.module';
import { MembersModule } from './modules/members/members.module';
import { StripeConnectModule } from './modules/stripe/stripe-connect.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
    DonationsModule,
    NotificationModule,
    EventsModule,
    AuthModule,
    MembersModule,
    StripeConnectModule,
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}
