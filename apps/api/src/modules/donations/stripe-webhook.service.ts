import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);
  private stripe: Stripe | null;

  constructor(
    private supabase: SupabaseService,
  ) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      try {
        this.stripe = new Stripe(stripeKey);
        this.logger.log('✅ Stripe webhook service initialized');
      } catch (err) {
        this.logger.warn('⚠️ Stripe webhook initialization failed');
        this.stripe = null;
      }
    } else {
      this.logger.warn('⚠️ STRIPE_SECRET_KEY not set, webhook service running without Stripe');
      this.stripe = null;
    }
  }

  async handleWebhook(body: Buffer, signature: string) {
    if (!this.stripe) {
      this.logger.warn('⏭️ Stripe not configured, ignoring webhook');
      return { received: true };
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err: any) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    this.logger.log(`Received Stripe event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'charge.refunded':
        await this.handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      case 'account.updated':
        await this.handleAccountUpdated(event.data.object as Stripe.Account);
        break;
      default:
        this.logger.warn(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const { mosque_id, donation_id, user_id } = paymentIntent.metadata ?? {};

    if (!donation_id) {
      this.logger.warn(`Payment intent ${paymentIntent.id} has no donation_id in metadata`);
      return;
    }

    // Update donation status
    await this.supabase.client
      .from('donations')
      .update({
        status: 'completed',
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq('id', donation_id);

    // Queue receipt job (disabled in dev mode)
    // TODO: Enable queue when BullMQ/Redis available
    // await this.receiptsQueue.add('send-receipt', { donation_id, mosque_id, user_id });

    this.logger.log(`Payment intent succeeded for donation ${donation_id}`);
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const { donation_id } = paymentIntent.metadata ?? {};

    if (!donation_id) {
      this.logger.warn(`Payment intent ${paymentIntent.id} has no donation_id in metadata`);
      return;
    }

    await this.supabase.client
      .from('donations')
      .update({ status: 'failed' })
      .eq('id', donation_id);

    this.logger.log(`Payment intent failed for donation ${donation_id}`);
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const { mosque_id, donation_id, user_id, purpose } = invoice.metadata ?? {};

    if (!mosque_id || !user_id) {
      this.logger.warn(`Invoice ${invoice.id} missing required metadata`);
      return;
    }

    // Get subscription to extract amount
    const invoiceObj = invoice as unknown as { subscription?: string | { id: string }; payment_intent?: string | { id: string } };
    const subscriptionId = typeof invoiceObj.subscription === 'string' ? invoiceObj.subscription : invoiceObj.subscription?.id;
    const paymentIntentId = typeof invoiceObj.payment_intent === 'string' ? invoiceObj.payment_intent : invoiceObj.payment_intent?.id;

    // Create a new donation record for this recurring payment
    const { data: newDonation, error } = await this.supabase.client
      .from('donations')
      .insert({
        mosque_id,
        user_id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        donation_type: 'monthly',
        purpose: purpose || 'general',
        status: 'completed',
        stripe_subscription_id: subscriptionId,
        stripe_payment_intent_id: paymentIntentId,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to create donation from invoice: ${error.message}`);
      return;
    }

    // Queue receipt (disabled in dev mode)
    // TODO: Enable queue when BullMQ/Redis available
    // await this.receiptsQueue.add('send-receipt', { donation_id: newDonation.id, mosque_id, user_id });

    this.logger.log(`Recurring donation created from invoice ${invoice.id}`);
  }

  private async handleChargeRefunded(charge: Stripe.Charge) {
    // Find donation by payment intent
    const { data: donation } = await this.supabase.client
      .from('donations')
      .select('id')
      .eq('stripe_payment_intent_id', charge.payment_intent)
      .single();

    if (donation) {
      await this.supabase.client
        .from('donations')
        .update({ status: 'refunded' })
        .eq('id', donation.id);

      this.logger.log(`Donation ${donation.id} marked as refunded`);
    }
  }

  private async handleAccountUpdated(account: Stripe.Account) {
    // Find mosque by stripe_account_id
    const { data: mosque } = await this.supabase.client
      .from('mosques')
      .select('id')
      .eq('stripe_account_id', account.id)
      .single();

    if (mosque) {
      await this.supabase.client
        .from('mosques')
        .update({
          stripe_charges_enabled: account.charges_enabled ?? false,
          stripe_payouts_enabled: account.payouts_enabled ?? false,
          stripe_onboarding_completed_at: account.charges_enabled
            ? new Date().toISOString()
            : null,
        })
        .eq('id', mosque.id);

      this.logger.log(`Mosque ${mosque.id} Stripe account updated`);
    }
  }
}
