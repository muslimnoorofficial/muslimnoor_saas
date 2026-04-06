import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DonationsPublicController, DonationsAuthController, DonationsAdminController } from './donations.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { DonationsService } from './donations.service';
import { StripeWebhookService } from './stripe-webhook.service';
// import { ReceiptProcessor } from './receipt.processor';
import { StripeConnectController } from '../stripe/stripe-connect.controller';
import { StripeConnectService } from '../stripe/stripe-connect.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { FeatureFlagGuard } from '../../common/guards/feature-flag.guard';

@Module({
  imports: [
    // BullModule.registerQueue({ name: 'receipts' }),
    SupabaseModule,
  ],
  controllers: [
    DonationsPublicController,
    DonationsAuthController,
    DonationsAdminController,
    StripeWebhookController,
    StripeConnectController,
  ],
  providers: [
    DonationsService,
    StripeWebhookService,
    TenantGuard,
    FeatureFlagGuard,
    // ReceiptProcessor,
    StripeConnectService,
  ],
  exports: [DonationsService],
})
export class DonationsModule {}
