import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeConnectService {
  private stripe: Stripe | null = null;
  private readonly logger = new Logger(StripeConnectService.name);

  constructor() {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey && stripeKey.startsWith('sk_')) {
      this.stripe = new Stripe(stripeKey);
      this.logger.log('✅ Stripe initialized');
    } else {
      this.logger.warn('⚠️ Stripe key not configured, donations will use mock data');
    }
  }

  async createConnectAccount(mosqueName: string, email: string) {
    if (!this.stripe) {
      throw new Error('Stripe not configured. Set STRIPE_SECRET_KEY env var with sk_test_* or sk_live_*');
    }
    
    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'US',
      email,
      business_profile: {
        name: mosqueName,
        product_description: 'Mosque donation platform',
        support_email: email,
      },
    });

    return account;
  }

  async getOnboardingLink(accountId: string, refreshUrl: string, returnUrl: string) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }
    
    const link = await this.stripe.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      refresh_url: refreshUrl,
      return_url: returnUrl,
    });

    return link;
  }

  async getAccountStatus(accountId: string) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }
    
    const account = await this.stripe.accounts.retrieve(accountId);
    return {
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    };
  }
}
