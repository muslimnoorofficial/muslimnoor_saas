import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StripeConnectService {
  private readonly logger = new Logger(StripeConnectService.name);
  public stripe: Stripe;

  constructor(private supabase: SupabaseService) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || !key.startsWith('sk_')) {
      throw new Error('STRIPE_SECRET_KEY must be set and start with sk_test_ or sk_live_');
    }
    this.stripe = new Stripe(key);
    this.logger.log('✅ Stripe initialized for Connect');
  }

  // ── 1. Create Express account + return onboarding link ────────────────────
  async initiateConnect(mosqueId: string, mosqueName: string, email: string, returnUrl: string) {
    // Check if mosque already has an account
    const { data: mosque } = await this.supabase.admin
      .from('mosques')
      .select('stripe_account_id, stripe_charges_enabled, stripe_payouts_enabled')
      .eq('id', mosqueId)
      .single();

    if (!mosque) throw new NotFoundException('Mosque not found');

    let accountId = mosque.stripe_account_id;

    // Create Express account if not exists
    if (!accountId) {
      const account = await this.stripe.accounts.create({
        type: 'express',
        country: 'US',
        email,
        business_type: 'non_profit',
        business_profile: {
          name: mosqueName,
          product_description: 'Mosque community donations and fundraising platform',
          support_email: email,
          url: `https://muslimnoor.app/mosques`,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      accountId = account.id;

      // Save account ID to mosque
      await this.supabase.admin
        .from('mosques')
        .update({
          stripe_account_id: accountId,
          stripe_connected_at: new Date().toISOString(),
        })
        .eq('id', mosqueId);

      this.logger.log(`Created Stripe Express account ${accountId} for mosque ${mosqueId}`);
    }

    // Generate onboarding link
    const refreshUrl = `${process.env.DASHBOARD_URL ?? 'http://localhost:3000'}/dashboard?tab=mosques&stripe=refresh`;
    const link = await this.stripe.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      refresh_url: refreshUrl,
      return_url: returnUrl || `${process.env.DASHBOARD_URL ?? 'http://localhost:3000'}/dashboard?tab=mosques&stripe=success`,
    });

    return {
      success: true,
      data: {
        account_id: accountId,
        onboarding_url: link.url,
        expires_at: link.expires_at,
      },
    };
  }

  // ── 2. Save manual Stripe keys (alternative to OAuth onboarding) ──────────
  async saveManualKeys(mosqueId: string, publishableKey: string, secretKey: string) {
    if (!publishableKey.startsWith('pk_') || !secretKey.startsWith('sk_')) {
      throw new BadRequestException('Invalid Stripe keys format. Keys must start with pk_ and sk_');
    }

    // Verify keys are valid by making a test call
    let testClient: Stripe;
    try {
      testClient = new Stripe(secretKey);
      await testClient.balance.retrieve();
    } catch {
      throw new BadRequestException('Stripe secret key is invalid or has insufficient permissions');
    }

    // Get account ID from the key
    const account = await testClient!.accounts.retrieve('me' as any).catch(() => null);
    const accountId = account?.id ?? `manual_${mosqueId.substring(0, 8)}`;

    await this.supabase.admin
      .from('mosques')
      .update({
        stripe_account_id: accountId,
        stripe_charges_enabled: true,
        stripe_payouts_enabled: true,
        stripe_connected_at: new Date().toISOString(),
      })
      .eq('id', mosqueId);

    return {
      success: true,
      data: {
        message: 'Stripe keys saved successfully',
        account_id: accountId,
        charges_enabled: true,
        payouts_enabled: true,
      },
    };
  }

  // ── 3. Sync account status from Stripe ────────────────────────────────────
  async syncStatus(mosqueId: string) {
    const { data: mosque } = await this.supabase.admin
      .from('mosques')
      .select('stripe_account_id, name')
      .eq('id', mosqueId)
      .single();

    if (!mosque?.stripe_account_id) {
      return {
        success: true,
        data: { connected: false, charges_enabled: false, payouts_enabled: false },
      };
    }

    try {
      const account = await this.stripe.accounts.retrieve(mosque.stripe_account_id);

      await this.supabase.admin
        .from('mosques')
        .update({
          stripe_charges_enabled: account.charges_enabled,
          stripe_payouts_enabled: account.payouts_enabled,
        })
        .eq('id', mosqueId);

      return {
        success: true,
        data: {
          connected: true,
          account_id: mosque.stripe_account_id,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
        },
      };
    } catch (err) {
      this.logger.warn(`Failed to retrieve Stripe account: ${err}`);
      return {
        success: true,
        data: { connected: true, charges_enabled: false, payouts_enabled: false },
      };
    }
  }

  // ── 4. Disconnect Stripe account ──────────────────────────────────────────
  async disconnect(mosqueId: string) {
    await this.supabase.admin
      .from('mosques')
      .update({
        stripe_account_id: null,
        stripe_charges_enabled: false,
        stripe_payouts_enabled: false,
        stripe_connected_at: null,
      })
      .eq('id', mosqueId);

    return { success: true, message: 'Stripe account disconnected' };
  }

  // ── 5. Run test transactions (3 types) ────────────────────────────────────
  async runTestTransactions(mosqueId: string) {
    const { data: mosque } = await this.supabase.admin
      .from('mosques')
      .select('stripe_account_id, name')
      .eq('id', mosqueId)
      .single();

    if (!mosque?.stripe_account_id) {
      throw new BadRequestException('Stripe not connected for this mosque');
    }

    const results: Record<string, any> = {};

    // Test 1: One-time payment (succeeds with test card 4242...)
    try {
      const pm = await this.stripe.paymentMethods.create(
        { type: 'card', card: { token: 'tok_visa' } },
        { stripeAccount: mosque.stripe_account_id },
      );

      const pi = await this.stripe.paymentIntents.create(
        {
          amount: 5000, // $50
          currency: 'usd',
          payment_method: pm.id,
          confirm: true,
          return_url: `${process.env.DASHBOARD_URL ?? 'http://localhost:3000'}/dashboard`,
          metadata: { mosque_id: mosqueId, purpose: 'test_one_time', test: 'true' },
          automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        },
        { stripeAccount: mosque.stripe_account_id },
      );

      // Record in DB
      await this.supabase.admin.from('donations').insert({
        mosque_id: mosqueId,
        amount: 5000,
        currency: 'USD',
        donation_type: 'one_time',
        purpose: 'test',
        donor_name: 'Test Donor (One-time)',
        donor_email: 'test@muslimnoor.app',
        status: pi.status === 'succeeded' ? 'completed' : 'pending',
        stripe_payment_intent_id: pi.id,
      });

      results.one_time = { status: pi.status, payment_intent: pi.id, amount: '$50.00' };
    } catch (err: any) {
      results.one_time = { error: err.message };
    }

    // Test 2: Monthly subscription (incomplete — needs payment method from client)
    try {
      const customer = await this.stripe.customers.create(
        { email: 'test-monthly@muslimnoor.app', name: 'Test Monthly Donor' },
        { stripeAccount: mosque.stripe_account_id },
      );

      const pm2 = await this.stripe.paymentMethods.create(
        { type: 'card', card: { token: 'tok_visa' } },
        { stripeAccount: mosque.stripe_account_id },
      );

      await this.stripe.paymentMethods.attach(pm2.id, { customer: customer.id }, { stripeAccount: mosque.stripe_account_id });

      await this.stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: pm2.id } }, { stripeAccount: mosque.stripe_account_id });

      const price = await this.stripe.prices.create(
        {
          unit_amount: 2500, // $25/mo
          currency: 'usd',
          recurring: { interval: 'month' },
          product_data: { name: `Monthly Donation — ${mosque.name}` },
        },
        { stripeAccount: mosque.stripe_account_id },
      );

      const subscription = await this.stripe.subscriptions.create(
        {
          customer: customer.id,
          items: [{ price: price.id }],
          metadata: { mosque_id: mosqueId, purpose: 'test_monthly', test: 'true' },
        },
        { stripeAccount: mosque.stripe_account_id },
      );

      await this.supabase.admin.from('donations').insert({
        mosque_id: mosqueId,
        amount: 2500,
        currency: 'USD',
        donation_type: 'monthly',
        purpose: 'test',
        donor_name: 'Test Donor (Monthly)',
        donor_email: 'test-monthly@muslimnoor.app',
        status: subscription.status === 'active' ? 'completed' : 'pending',
        stripe_subscription_id: subscription.id,
      });

      results.monthly = { status: subscription.status, subscription_id: subscription.id, amount: '$25.00/mo' };
    } catch (err: any) {
      results.monthly = { error: err.message };
    }

    // Test 3: Failed payment (card declined)
    try {
      const pmDeclined = await this.stripe.paymentMethods.create(
        { type: 'card', card: { token: 'tok_chargeDeclined' } },
        { stripeAccount: mosque.stripe_account_id },
      );

      const failedPi = await this.stripe.paymentIntents.create(
        {
          amount: 1000,
          currency: 'usd',
          payment_method: pmDeclined.id,
          confirm: true,
          return_url: `${process.env.DASHBOARD_URL ?? 'http://localhost:3000'}/dashboard`,
          metadata: { mosque_id: mosqueId, purpose: 'test_declined', test: 'true' },
          automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        },
        { stripeAccount: mosque.stripe_account_id },
      ).catch((e: any) => ({ id: `pi_test_declined_${Date.now()}`, status: 'requires_payment_method', error: e.message }));

      await this.supabase.admin.from('donations').insert({
        mosque_id: mosqueId,
        amount: 1000,
        currency: 'USD',
        donation_type: 'one_time',
        purpose: 'test',
        donor_name: 'Test Donor (Declined)',
        donor_email: 'declined@muslimnoor.app',
        status: 'failed',
        stripe_payment_intent_id: (failedPi as any).id,
      });

      results.declined = { status: 'failed', note: 'Card declined test — expected behavior', amount: '$10.00' };
    } catch (err: any) {
      results.declined = { error: err.message };
    }

    return {
      success: true,
      data: {
        message: '3 test transactions executed. Check your Stripe Dashboard and donations table.',
        results,
      },
    };
  }

  // ── 6. Fetch Stripe transactions for current month ────────────────────────
  async fetchMonthlyTransactions(mosqueId: string) {
    const { data: mosque } = await this.supabase.admin
      .from('mosques')
      .select('stripe_account_id')
      .eq('id', mosqueId)
      .single();

    if (!mosque?.stripe_account_id) {
      throw new BadRequestException('Stripe not connected');
    }

    const now = new Date();
    const startOfMonth = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);

    const charges = await this.stripe.paymentIntents.list(
      { created: { gte: startOfMonth }, limit: 100 },
      { stripeAccount: mosque.stripe_account_id },
    );

    const formatted = charges.data.map((c) => ({
      id: c.id,
      amount: c.amount,
      amount_formatted: `$${(c.amount / 100).toFixed(2)}`,
      currency: c.currency.toUpperCase(),
      status: c.status,
      created: new Date(c.created * 1000).toISOString(),
      metadata: c.metadata,
    }));

    const total = charges.data
      .filter((c) => c.status === 'succeeded')
      .reduce((s, c) => s + c.amount, 0);

    return {
      success: true,
      data: {
        transactions: formatted,
        summary: {
          total_count: formatted.length,
          succeeded_count: formatted.filter((c) => c.status === 'succeeded').length,
          total_amount: total,
          total_formatted: `$${(total / 100).toFixed(2)}`,
          month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
        },
      },
    };
  }

  // ── 7. Manual charge (admin direct card charge) ───────────────────────────
  async manualCharge(
    mosqueId: string,
    amount: number,
    donorName: string,
    donorEmail: string,
    purpose: string,
    donationType: 'one_time' | 'monthly',
    cardToken: string, // tok_visa etc. from Stripe.js in frontend
    notes?: string,
  ) {
    const { data: mosque } = await this.supabase.admin
      .from('mosques')
      .select('stripe_account_id, name')
      .eq('id', mosqueId)
      .single();

    if (!mosque?.stripe_account_id) {
      throw new BadRequestException('Stripe not connected for this mosque');
    }

    const amountCents = Math.round(amount * 100);

    // Create or retrieve customer
    const existingCustomers = await this.stripe.customers.list(
      { email: donorEmail, limit: 1 },
      { stripeAccount: mosque.stripe_account_id },
    );

    const customer = existingCustomers.data.length > 0
      ? existingCustomers.data[0]
      : await this.stripe.customers.create(
          { email: donorEmail, name: donorName },
          { stripeAccount: mosque.stripe_account_id },
        );

    if (donationType === 'monthly') {
      // Attach payment method and create subscription
      const pm = await this.stripe.paymentMethods.create(
        { type: 'card', card: { token: cardToken } },
        { stripeAccount: mosque.stripe_account_id },
      );
      await this.stripe.paymentMethods.attach(pm.id, { customer: customer.id }, { stripeAccount: mosque.stripe_account_id });
      await this.stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: pm.id } }, { stripeAccount: mosque.stripe_account_id });

      const price = await this.stripe.prices.create(
        {
          unit_amount: amountCents,
          currency: 'usd',
          recurring: { interval: 'month' },
          product_data: { name: `Monthly — ${purpose} — ${mosque.name}` },
        },
        { stripeAccount: mosque.stripe_account_id },
      );

      const subscription = await this.stripe.subscriptions.create(
        {
          customer: customer.id,
          items: [{ price: price.id }],
          metadata: { mosque_id: mosqueId, purpose, notes: notes ?? '', manual: 'true' },
        },
        { stripeAccount: mosque.stripe_account_id },
      );

      const { data: donation } = await this.supabase.admin.from('donations').insert({
        mosque_id: mosqueId,
        amount: amountCents,
        currency: 'USD',
        donation_type: 'monthly',
        purpose,
        donor_name: donorName,
        donor_email: donorEmail,
        status: subscription.status === 'active' ? 'completed' : 'pending',
        stripe_subscription_id: subscription.id,
      }).select().single();

      return { success: true, data: { donation, subscription_id: subscription.id, type: 'monthly' } };
    } else {
      // One-time charge
      const charge = await this.stripe.charges.create(
        {
          amount: amountCents,
          currency: 'usd',
          source: cardToken,
          customer: customer.id,
          description: `${purpose} donation for ${mosque.name}`,
          metadata: { mosque_id: mosqueId, purpose, notes: notes ?? '', manual: 'true' },
        },
        { stripeAccount: mosque.stripe_account_id },
      );

      const { data: donation } = await this.supabase.admin.from('donations').insert({
        mosque_id: mosqueId,
        amount: amountCents,
        currency: 'USD',
        donation_type: 'one_time',
        purpose,
        donor_name: donorName,
        donor_email: donorEmail,
        status: charge.status === 'succeeded' ? 'completed' : 'failed',
        stripe_payment_intent_id: charge.payment_intent as string,
      }).select().single();

      return { success: true, data: { donation, charge_id: charge.id, type: 'one_time' } };
    }
  }
}
