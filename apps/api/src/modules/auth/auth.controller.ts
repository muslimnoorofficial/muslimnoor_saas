import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register-device-token')
  async registerDeviceToken(
    @Headers('authorization') authHeader: string,
    @Body()
    body: {
      deviceId: string
      deviceToken: string
      platform: 'ios' | 'android' | 'web'
    },
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Missing authorization header')
    }

    const userId = authHeader.replace('Bearer ', '')

    // Validate required fields
    if (!body.deviceId || !body.deviceToken) {
      throw new BadRequestException('Missing required fields: deviceId, deviceToken')
    }

    const platform = body.platform || 'web'

    const result = await this.authService.registerDeviceToken(
      userId,
      body.deviceId,
      body.deviceToken,
      platform,
    )

    return result
  }
}
