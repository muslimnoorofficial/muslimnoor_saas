import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { StripeConnectService } from './stripe-connect.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import type { TenantContext } from '../../common/decorators/tenant.decorator'
import { CurrentTenant } from '../../common/decorators/tenant.decorator'
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/mosques/:slug/stripe')
@UseGuards(JwtGuard, TenantGuard, RolesGuard)
@Roles('admin')
export class StripeConnectController {
  constructor(private stripeConnectService: StripeConnectService) {}

  @Post('connect')
  async initiateConnect(
    @CurrentTenant() tenant: TenantContext,
    @Body() body: { returnUrl: string },
  ) {
    // In a real implementation, this would:
    // 1. Create Express account if not exists
    // 2. Generate onboarding link
    // 3. Return link to frontend
    return {
      success: true,
      data: { onboarding_url: '' },
    };
  }

  @Get('status')
  async getStatus(@CurrentTenant() tenant: TenantContext) {
    // Return account status
    return {
      success: true,
      data: { charges_enabled: false, payouts_enabled: false },
    };
  }
}
