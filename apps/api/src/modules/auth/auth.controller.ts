import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Headers,
  Param,
  BadRequestException,
  Query,
} from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ── Public: Login ──────────────────────────────────────────────────────────
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    if (!body.email || !body.password)
      throw new BadRequestException('email and password required')
    return this.authService.login(body.email, body.password)
  }

  // ── Public: Register (mosque admin self-sign-up) ───────────────────────────
  @Post('register')
  async register(
    @Body() body: { email: string; password: string; full_name: string; phone?: string },
  ) {
    if (!body.email || !body.password || !body.full_name)
      throw new BadRequestException('email, password, full_name required')
    return this.authService.register(body.email, body.password, body.full_name, body.phone)
  }

  // ── Public: Resend verification email ─────────────────────────────────────
  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    if (!body.email) throw new BadRequestException('email required')
    return this.authService.resendVerification(body.email)
  }

  // ── Public: Forgot password ────────────────────────────────────────────────
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    if (!body.email) throw new BadRequestException('email required')
    return this.authService.forgotPassword(body.email)
  }

  // ── Authenticated: Logout ──────────────────────────────────────────────────
  @Post('logout')
  async logout(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '') ?? ''
    return this.authService.logout(token)
  }

  // ── Authenticated: Refresh token ───────────────────────────────────────────
  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    if (!body.refresh_token) throw new BadRequestException('refresh_token required')
    return this.authService.refresh(body.refresh_token)
  }

  // ── Authenticated: Current user ────────────────────────────────────────────
  @Get('me')
  async me(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '') ?? ''
    if (!token) throw new BadRequestException('Authorization header required')
    return this.authService.me(token)
  }

  // ── Admin: List all users ──────────────────────────────────────────────────
  @Get('users')
  async listUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('role') role?: string,
  ) {
    return this.authService.listUsers(Number(page), Number(limit), role)
  }

  // ── Admin: Update user role ────────────────────────────────────────────────
  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: { global_role: string },
  ) {
    if (!body.global_role) throw new BadRequestException('global_role required')
    return this.authService.updateUserRole(id, body.global_role)
  }

  // ── Device tokens (FCM/APNS) ───────────────────────────────────────────────
  @Post('register-device-token')
  async registerDeviceToken(
    @Headers('authorization') authHeader: string,
    @Body() body: { deviceId: string; deviceToken: string; platform: 'ios' | 'android' | 'web' },
  ) {
    if (!authHeader?.startsWith('Bearer '))
      throw new BadRequestException('Missing authorization header')
    if (!body.deviceId || !body.deviceToken)
      throw new BadRequestException('Missing required fields: deviceId, deviceToken')
    // Extract userId from token
    const token = authHeader.replace('Bearer ', '')
    const { data } = await (this.authService as any).supabase.admin.auth.getUser(token)
    if (!data?.user) throw new BadRequestException('Invalid token')
    return this.authService.registerDeviceToken(
      data.user.id,
      body.deviceId,
      body.deviceToken,
      body.platform || 'web',
    )
  }
}
