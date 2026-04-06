import {
  Controller,
  Headers,
  Post,
  type RawBodyRequest,
  Req,
} from '@nestjs/common';
import type { Request } from 'express'
import { StripeWebhookService } from './stripe-webhook.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/stripe')
export class StripeWebhookController {
  constructor(private webhookService: StripeWebhookService) {}

  @Public()
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.webhookService.handleWebhook(req.rawBody!, signature);
  }
}
