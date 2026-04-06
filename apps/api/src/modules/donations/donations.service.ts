import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { SupabaseService } from '../supabase/supabase.service';
import { TenantContext } from '../../common/decorators/tenant.decorator';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateDonationIntentDto } from './dto/create-donation-from-mobile.dto';

interface ListDonationsOptions {
  page: number;
  limit: number;
  status?: string;
  purpose?: string;
  type?: string;
}

@Injectable()
export class DonationsService {
  private logger: any = { log: console.log, warn: console.warn, error: console.error };
  private stripe: Stripe | null;

  constructor(
    private supabase: SupabaseService,
  ) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      try {
        this.stripe = new Stripe(stripeKey);
        this.logger.log('✅ Stripe initialized');
      } catch (err) {
        this.logger.warn('⚠️ Stripe initialization failed, using mock mode');
        this.stripe = null;
      }
    } else {
      this.logger.warn('⚠️ STRIPE_SECRET_KEY not set, using mock mode for donations');
      this.stripe = null;
    }
  }

  async createIntent(
    tenant: TenantContext,
    dto: CreateDonationIntentDto,
    user: AuthUser | null,
  ) {
    // Get mosque — feature flag already checked by FeatureFlagGuard
    const { data: mosque } = await this.supabase.client
      .from('mosques')
      .select('stripe_account_id, stripe_charges_enabled, stripe_payouts_enabled, name')
      .eq('id', tenant.mosque_id)
      .single();

    if (!mosque?.stripe_account_id) {
      throw new BadRequestException({
        code: 'STRIPE_NOT_CONNECTED',
        message: 'This mosque has not connected Stripe yet',
      });
    }

    if (!mosque.stripe_charges_enabled || !mosque.stripe_payouts_enabled) {
      throw new BadRequestException({
        code: 'STRIPE_NOT_ACTIVE',
        message: 'Stripe account is still under review',
      });
    }

    // Build donor info
    const donationInsert: Record<string, any> = {
      mosque_id: tenant.mosque_id,
      amount: dto.amount,
      currency: 'usd',
      donation_type: dto.donation_type,
      purpose: dto.purpose,
      status: 'pending',
    };

    if (user) {
      const { data: userRecord } = await this.supabase.client
        .from('users')
        .select('name, email')
        .eq('id', user.id)
        .single();

      donationInsert.user_id = user.id;
      donationInsert.donor_name = dto.donor_name ?? userRecord?.name;
      donationInsert.donor_email = dto.donor_email ?? userRecord?.email;
    } else {
      if (!dto.donor_name || !dto.donor_email) {
        throw new BadRequestException({
          code: 'GUEST_INFO_REQUIRED',
          message: 'Guest donations require donor_name and donor_email',
        });
      }
      donationInsert.donor_name = dto.donor_name;
      donationInsert.donor_email = dto.donor_email.toLowerCase().trim();
    }

    // Insert pending donation first
    const { data: donation, error: insertError } = await this.supabase.client
      .from('donations')
      .insert(donationInsert)
      .select()
      .single();

    if (insertError || !donation) {
      throw new BadRequestException({ code: 'DONATION_CREATE_FAILED', message: 'Failed to create donation' });
    }

    // ── One-time ──────────────────────────────────────────────
    if (dto.donation_type === 'one_time') {
      let paymentIntent: any;
      
      if (this.stripe) {
        // For testing: create regular payment intent (not Connect)
        // In production, this would use transfer_data to connected accounts
        paymentIntent = await this.stripe.paymentIntents.create({
          amount: dto.amount,
          currency: 'usd',
          metadata: {
            mosque_id: tenant.mosque_id,
            donation_id: donation.id,
            user_id: user?.id ?? 'guest',
            purpose: dto.purpose,
          },
        });
      } else {
        // Mock Stripe response for development
        paymentIntent = {
          id: `pi_mock_${donation.id.substring(0, 8)}`,
          client_secret: `pi_mock_${donation.id.substring(0, 8)}_secret`,
          amount: dto.amount,
          currency: 'usd',
          status: 'requires_payment_method',
        };
        this.logger.log(`📦 Mock payment intent created: ${paymentIntent.id}`);
      }

      await this.supabase.client
        .from('donations')
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq('id', donation.id);

      return {
        success: true,
        data: {
          donation_id: donation.id,
          client_secret: paymentIntent.client_secret,
          type: 'payment_intent',
        },
      };
    }

    // ── Monthly recurring ─────────────────────────────────────
    if (dto.donation_type === 'monthly') {
      const customer = await this.getOrCreateStripeCustomer(
        donationInsert.donor_email,
        donationInsert.donor_name,
        mosque.stripe_account_id,
      );

      let price: any;
      let subscription: any;

      if (this.stripe) {
        price = await this.stripe.prices.create(
          {
            unit_amount: dto.amount,
            currency: 'usd',
            recurring: { interval: 'month' },
            product_data: { name: `Monthly Donation — ${mosque.name} (${dto.purpose})` },
          },
          { stripeAccount: mosque.stripe_account_id },
        );

        subscription = await this.stripe.subscriptions.create(
          {
            customer: customer.id,
            items: [{ price: price.id }],
            payment_behavior: 'default_incomplete',
            metadata: {
              mosque_id: tenant.mosque_id,
              donation_id: donation.id,
              purpose: dto.purpose,
            },
          },
          { stripeAccount: mosque.stripe_account_id },
        );
      } else {
        // Mock subscription for development
        price = {
          id: `price_mock_${donation.id.substring(0, 8)}`,
          unit_amount: dto.amount,
          currency: 'usd',
          recurring: { interval: 'month' },
        };

        subscription = {
          id: `sub_mock_${donation.id.substring(0, 8)}`,
          customer: customer.id,
          items: { data: [{ price: price.id }] },
          latest_invoice: {
            payment_intent: {
              client_secret: `pi_mock_${donation.id.substring(0, 8)}_secret`,
            },
          },
          status: 'incomplete',
        };
        this.logger.log(`📦 Mock subscription created: ${subscription.id}`);
      }

      const invoice = subscription.latest_invoice as unknown as { payment_intent?: string | Stripe.PaymentIntent };
      const paymentIntentData = invoice?.payment_intent;
      const paymentIntent = typeof paymentIntentData === 'string' ? { client_secret: null } : paymentIntentData;

      await this.supabase.client
        .from('donations')
        .update({ stripe_subscription_id: subscription.id })
        .eq('id', donation.id);

      return {
        success: true,
        data: {
          donation_id: donation.id,
          client_secret: (paymentIntent as any)?.client_secret,
          subscription_id: subscription.id,
          type: 'subscription',
        },
      };
    }

    throw new BadRequestException({ code: 'INVALID_DONATION_TYPE', message: 'Invalid donation type' });
  }

  async cancelSubscription(
    tenant: TenantContext,
    userId: string,
    subscriptionId: string,
  ) {
    // Verify this subscription belongs to this user + mosque
    const { data: donation } = await this.supabase.client
      .from('donations')
      .select('id, stripe_subscription_id, user_id, mosque_id, status')
      .eq('stripe_subscription_id', subscriptionId)
      .eq('mosque_id', tenant.mosque_id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (!donation) {
      throw new NotFoundException({ code: 'SUBSCRIPTION_NOT_FOUND', message: 'Subscription not found' });
    }

    // Only the donor themselves can cancel (not even mosque admin — by design)
    if (donation.user_id !== userId) {
      throw new BadRequestException({ code: 'NOT_YOUR_SUBSCRIPTION', message: 'You can only cancel your own subscriptions' });
    }

    if (donation.status === 'refunded') {
      throw new BadRequestException({ code: 'SUBSCRIPTION_ALREADY_CANCELLED', message: 'Subscription already cancelled' });
    }

    // Get mosque Stripe account
    const { data: mosque } = await this.supabase.client
      .from('mosques')
      .select('stripe_account_id')
      .eq('id', tenant.mosque_id)
      .single();

    // Cancel at period end — donor gets full current month
    if (this.stripe) {
      await this.stripe.subscriptions.update(
        subscriptionId,
        { cancel_at_period_end: true },
        { stripeAccount: mosque!.stripe_account_id! },
      );
    } else {
      this.logger.log(`📦 Mock: Subscription ${subscriptionId} marked for cancellation (mock mode)`);
    }

    return {
      success: true,
      data: { message: 'Recurring donation will be cancelled at the end of the current billing period' },
    };
  }

  async getHistory(tenant: TenantContext, userId: string) {
    const { data, error } = await this.supabase.client
      .from('donations')
      .select('id, amount, currency, donation_type, purpose, status, stripe_subscription_id, created_at, receipt_sent_at')
      .eq('mosque_id', tenant.mosque_id)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return { success: true, data };
  }

  async listDonations(tenant: TenantContext, opts: ListDonationsOptions) {
    const { page, limit, status, purpose, type } = opts;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.supabase.client
      .from('donations')
      .select('id, amount, currency, donation_type, purpose, status, donor_name, donor_email, user_id, created_at, receipt_sent_at', { count: 'exact' })
      .eq('mosque_id', tenant.mosque_id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) query = query.eq('status', status);
    if (purpose) query = query.eq('purpose', purpose);
    if (type) query = query.eq('donation_type', type);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      success: true,
      data,
      meta: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
    };
  }

  async getSummary(tenant: TenantContext) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [mtdResult, allTimeResult, recurringResult] = await Promise.all([
      // Month-to-date completed donations
      this.supabase.client
        .from('donations')
        .select('amount')
        .eq('mosque_id', tenant.mosque_id)
        .eq('status', 'completed')
        .gte('created_at', startOfMonth),

      // All-time unique donors
      this.supabase.client
        .from('donations')
        .select('user_id, donor_email')
        .eq('mosque_id', tenant.mosque_id)
        .eq('status', 'completed'),

      // Active recurring subscriptions (monthly, not cancelled)
      this.supabase.client
        .from('donations')
        .select('id')
        .eq('mosque_id', tenant.mosque_id)
        .eq('donation_type', 'monthly')
        .eq('status', 'completed')
        .not('stripe_subscription_id', 'is', null),
    ]);

    const mtdTotal = (mtdResult.data ?? []).reduce((sum, d) => sum + d.amount, 0);

    const uniqueDonors = new Set(
      (allTimeResult.data ?? []).map((d) => d.user_id ?? d.donor_email),
    ).size;

    return {
      success: true,
      data: {
        total_donations_mtd_cents: mtdTotal,
        total_donations_mtd_formatted: `$${(mtdTotal / 100).toFixed(2)}`,
        total_unique_donors: uniqueDonors,
        active_recurring_count: recurringResult.data?.length ?? 0,
      },
    };
  }

  private async getOrCreateStripeCustomer(
    email: string,
    name: string,
    stripeAccountId: string,
  ): Promise<Stripe.Customer | any> {
    if (!this.stripe) {
      // Mock customer for development
      return {
        id: `cus_mock_${email.substring(0, 4)}`,
        email,
        name,
        object: 'customer',
      };
    }
    
    const existing = await this.stripe.customers.list(
      { email, limit: 1 },
      { stripeAccount: stripeAccountId },
    );
    if (existing.data.length > 0) return existing.data[0];
    return this.stripe.customers.create({ email, name }, { stripeAccount: stripeAccountId });
  }
}
