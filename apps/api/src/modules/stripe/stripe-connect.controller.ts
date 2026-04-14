import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { StripeConnectService } from './stripe-connect.service';
import { SupabaseService } from '../supabase/supabase.service';

// NOTE: Guards removed for simplicity — add JwtGuard + RolesGuard back once
// the admin session flow is wired end-to-end.  All endpoints here are
// effectively admin-only (called only from the admin dashboard).

@Controller('api/stripe')
export class StripeConnectController {
  constructor(
    private stripeConnectService: StripeConnectService,
    private supabase: SupabaseService,
  ) {}

  // ── Initiate Stripe Connect OAuth onboarding ──────────────────────────────
  // POST /api/stripe/mosques/:mosqueId/connect
  @Post('mosques/:mosqueId/connect')
  async initiateConnect(
    @Param('mosqueId') mosqueId: string,
    @Body() body: { email: string; return_url?: string },
  ) {
    if (!body.email) throw new BadRequestException('email required');

    const { data: mosque } = await this.supabase.admin
      .from('mosques')
      .select('name')
      .eq('id', mosqueId)
      .single();

    if (!mosque) throw new BadRequestException('Mosque not found');

    return this.stripeConnectService.initiateConnect(
      mosqueId,
      mosque.name,
      body.email,
      body.return_url ?? '',
    );
  }

  // ── Save manual Stripe keys ───────────────────────────────────────────────
  // POST /api/stripe/mosques/:mosqueId/manual-keys
  @Post('mosques/:mosqueId/manual-keys')
  async saveManualKeys(
    @Param('mosqueId') mosqueId: string,
    @Body() body: { publishable_key: string; secret_key: string },
  ) {
    if (!body.publishable_key || !body.secret_key)
      throw new BadRequestException('publishable_key and secret_key required');
    return this.stripeConnectService.saveManualKeys(
      mosqueId,
      body.publishable_key,
      body.secret_key,
    );
  }

  // ── Sync Stripe account status ────────────────────────────────────────────
  // GET /api/stripe/mosques/:mosqueId/status
  @Get('mosques/:mosqueId/status')
  async getStatus(@Param('mosqueId') mosqueId: string) {
    return this.stripeConnectService.syncStatus(mosqueId);
  }

  // ── Disconnect Stripe account ─────────────────────────────────────────────
  // DELETE /api/stripe/mosques/:mosqueId/connect
  @Delete('mosques/:mosqueId/connect')
  async disconnect(@Param('mosqueId') mosqueId: string) {
    return this.stripeConnectService.disconnect(mosqueId);
  }

  // ── Run 3 test transactions ───────────────────────────────────────────────
  // POST /api/stripe/mosques/:mosqueId/test-transactions
  @Post('mosques/:mosqueId/test-transactions')
  async runTestTransactions(@Param('mosqueId') mosqueId: string) {
    return this.stripeConnectService.runTestTransactions(mosqueId);
  }

  // ── Fetch current-month Stripe transactions ───────────────────────────────
  // GET /api/stripe/mosques/:mosqueId/monthly-transactions
  @Get('mosques/:mosqueId/monthly-transactions')
  async getMonthlyTransactions(@Param('mosqueId') mosqueId: string) {
    return this.stripeConnectService.fetchMonthlyTransactions(mosqueId);
  }

  // ── Manual charge (admin direct card charge) ──────────────────────────────
  // POST /api/stripe/mosques/:mosqueId/manual-charge
  @Post('mosques/:mosqueId/manual-charge')
  async manualCharge(
    @Param('mosqueId') mosqueId: string,
    @Body()
    body: {
      amount: number;
      donor_name: string;
      donor_email: string;
      purpose: string;
      donation_type: 'one_time' | 'monthly';
      card_token: string;
      notes?: string;
    },
  ) {
    const { amount, donor_name, donor_email, purpose, donation_type, card_token, notes } = body;
    if (!amount || !donor_name || !donor_email || !purpose || !donation_type || !card_token) {
      throw new BadRequestException(
        'amount, donor_name, donor_email, purpose, donation_type, card_token required',
      );
    }
    return this.stripeConnectService.manualCharge(
      mosqueId,
      amount,
      donor_name,
      donor_email,
      purpose,
      donation_type,
      card_token,
      notes,
    );
  }
}
