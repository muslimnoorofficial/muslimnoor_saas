import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { DonationsService } from './donations.service';
import { CreateDonationIntentDto, DonationIntentResponseDto } from './dto/create-donation-from-mobile.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FeatureFlagGuard } from '../../common/guards/feature-flag.guard';
import type { TenantContext } from '../../common/decorators/tenant.decorator';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequiresFeature } from '../../common/guards/feature-flag.guard';

// ── Public + optional-auth donation routes ──────────────────
@Controller('mosques/:slug/donations')
@UseGuards(TenantGuard, FeatureFlagGuard)
export class DonationsPublicController {
  constructor(private donationsService: DonationsService) {}

  @RequiresFeature('donations')
  @Post('create-intent')
  async createIntent(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateDonationIntentDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user as AuthUser | undefined;
    return this.donationsService.createIntent(tenant, dto, user ?? null);
  }
}

// ── Authenticated donor routes ───────────────────────────────
@Controller('mosques/:slug/donations')
@UseGuards(JwtGuard, TenantGuard)
export class DonationsAuthController {
  constructor(private donationsService: DonationsService) {}

  @Get('history')
  async getHistory(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthUser,
  ) {
    return this.donationsService.getHistory(tenant, user.id);
  }

  @Delete('subscriptions/:subscriptionId')
  async cancelSubscription(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthUser,
    @Param('subscriptionId') subscriptionId: string,
  ) {
    return this.donationsService.cancelSubscription(tenant, user.id, subscriptionId);
  }
}

// ── Admin routes ─────────────────────────────────────────────
@Controller('mosques/:slug/donations')
@UseGuards(JwtGuard, TenantGuard, RolesGuard)
@Roles('admin')
export class DonationsAdminController {
  constructor(private donationsService: DonationsService) {}

  @Get()
  async listDonations(
    @CurrentTenant() tenant: TenantContext,
    @Query('page') page = '1',
    @Query('limit') limit = '25',
    @Query('status') status?: string,
    @Query('purpose') purpose?: string,
    @Query('type') type?: string,
  ) {
    return this.donationsService.listDonations(tenant, {
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10), 100),
      status,
      purpose,
      type,
    });
  }

  @Get('summary')
  async getSummary(@CurrentTenant() tenant: TenantContext) {
    return this.donationsService.getSummary(tenant);
  }
}
