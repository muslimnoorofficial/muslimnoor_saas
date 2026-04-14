import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(private supabase: SupabaseService) {}

  // ── Login ──────────────────────────────────────────────────────────────────
  async login(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        throw new UnauthorizedException({
          code: 'EMAIL_NOT_CONFIRMED',
          message: 'Please check your email and click the confirmation link before signing in.',
        })
      }
      throw new UnauthorizedException(error.message)
    }

    // Fetch the user profile row
    const { data: profile } = await this.supabase.admin
      .from('users')
      .select('id, email, full_name, global_role, avatar_url, phone, email_notifications_enabled')
      .eq('id', data.user!.id)
      .single()

    return {
      success: true,
      data: {
        access_token: data.session!.access_token,
        refresh_token: data.session!.refresh_token,
        expires_at: data.session!.expires_at,
        user: profile ?? {
          id: data.user!.id,
          email: data.user!.email,
          full_name: data.user!.user_metadata?.full_name ?? null,
          global_role: data.user!.user_metadata?.global_role ?? 'member',
        },
      },
    }
  }

  // ── Register (mosque admin self-sign-up) ────────────────────────────────────
  async register(
    email: string,
    password: string,
    fullName: string,
    phone?: string,
  ) {
    const redirectUrl =
      process.env.DASHBOARD_URL
        ? `${process.env.DASHBOARD_URL}/auth/callback`
        : 'http://localhost:3000/auth/callback'

    const { data, error } = await this.supabase.client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          global_role: 'mosque_admin',
          phone: phone ?? null,
        },
      },
    })

    if (error) throw new BadRequestException(error.message)

    // If email confirmations are disabled Supabase returns a session immediately.
    // Otherwise session is null and we wait for email confirmation.
    if (data.session) {
      await this.ensureUserProfile(
        data.user!.id,
        email,
        fullName,
        phone,
        'mosque_admin',
      )
      const { data: profile } = await this.supabase.admin
        .from('users')
        .select('*')
        .eq('id', data.user!.id)
        .single()

      return {
        success: true,
        data: {
          message: 'Account created. You are now signed in.',
          requires_confirmation: false,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          user: profile,
        },
      }
    }

    // Email confirmation required — profile will be created via DB trigger or
    // on first login.  We pre-create it here using admin so the row exists.
    if (data.user) {
      await this.ensureUserProfile(
        data.user.id,
        email,
        fullName,
        phone,
        'mosque_admin',
      )
    }

    return {
      success: true,
      data: {
        message:
          'Registration successful! Please check your email and click the verification link to activate your account.',
        requires_confirmation: true,
        email,
      },
    }
  }

  // ── Logout ──────────────────────────────────────────────────────────────────
  async logout(token: string) {
    // Sign out on the user-scoped client
    const userClient = this.supabase.forUser(token)
    await userClient.auth.signOut()
    return { success: true, message: 'Logged out successfully' }
  }

  // ── Refresh ─────────────────────────────────────────────────────────────────
  async refresh(refreshToken: string) {
    const { data, error } = await this.supabase.client.auth.refreshSession({
      refresh_token: refreshToken,
    })
    if (error) throw new UnauthorizedException('Invalid or expired refresh token')
    return {
      success: true,
      data: {
        access_token: data.session!.access_token,
        refresh_token: data.session!.refresh_token,
        expires_at: data.session!.expires_at,
      },
    }
  }

  // ── Me ──────────────────────────────────────────────────────────────────────
  async me(token: string) {
    const { data, error } = await this.supabase.admin.auth.getUser(token)
    if (error || !data.user) throw new UnauthorizedException('Invalid token')

    const { data: profile } = await this.supabase.admin
      .from('users')
      .select('id, email, full_name, global_role, avatar_url, phone, email_notifications_enabled, created_at')
      .eq('id', data.user.id)
      .single()

    return {
      success: true,
      data: {
        user: profile ?? {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name ?? null,
          global_role: data.user.user_metadata?.global_role ?? 'member',
        },
      },
    }
  }

  // ── Resend verification email ────────────────────────────────────────────────
  async resendVerification(email: string) {
    const { error } = await this.supabase.client.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: process.env.DASHBOARD_URL
          ? `${process.env.DASHBOARD_URL}/auth/callback`
          : 'http://localhost:3000/auth/callback',
      },
    })
    if (error) throw new BadRequestException(error.message)
    return { success: true, message: 'Verification email resent. Check your inbox.' }
  }

  // ── Request password reset ───────────────────────────────────────────────────
  async forgotPassword(email: string) {
    const { error } = await this.supabase.client.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.DASHBOARD_URL
        ? `${process.env.DASHBOARD_URL}/auth/reset-password`
        : 'http://localhost:3000/auth/reset-password',
    })
    if (error) throw new BadRequestException(error.message)
    return { success: true, message: 'Password reset email sent.' }
  }

  // ── Register device token (FCM/APNS push) ───────────────────────────────────
  async registerDeviceToken(
    userId: string,
    deviceId: string,
    deviceToken: string,
    platform: 'ios' | 'android' | 'web',
  ) {
    const { data: user, error: userError } = await this.supabase.admin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (userError || !user) throw new BadRequestException('User not found')

    const { data: device, error: upsertError } = await this.supabase.admin
      .from('user_devices')
      .upsert(
        {
          user_id: userId,
          device_id: deviceId,
          device_token: deviceToken,
          platform,
          is_active: true,
          last_failure_at: null,
          failure_reason: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'device_id' },
      )
      .select()
      .single()

    if (upsertError) throw new BadRequestException('Failed to register device token')
    return { success: true, data: device, message: 'Device token registered' }
  }

  async markDeviceTokenInactive(deviceToken: string, failureReason: string) {
    const { data } = await this.supabase.admin
      .from('user_devices')
      .update({
        is_active: false,
        failure_reason: failureReason,
        last_failure_at: new Date().toISOString(),
      })
      .eq('device_token', deviceToken)
      .select()
      .single()
    return data
  }

  // ── Admin: list all users ───────────────────────────────────────────────────
  async listUsers(page = 1, limit = 20, role?: string) {
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = this.supabase.admin
      .from('users')
      .select(
        'id, email, full_name, global_role, avatar_url, phone, email_notifications_enabled, created_at',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(from, to)

    if (role) query = query.eq('global_role', role)

    const { data, error, count } = await query
    if (error) throw new BadRequestException(error.message)

    return {
      success: true,
      data,
      meta: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
    }
  }

  // ── Admin: update a user's role ─────────────────────────────────────────────
  async updateUserRole(userId: string, globalRole: string) {
    const { data, error } = await this.supabase.admin
      .from('users')
      .update({ global_role: globalRole, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    if (error) throw new BadRequestException(error.message)
    return { success: true, data }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────
  private async ensureUserProfile(
    id: string,
    email: string,
    fullName: string,
    phone: string | undefined,
    role: string,
  ) {
    const { error } = await this.supabase.admin.from('users').upsert(
      {
        id,
        email,
        full_name: fullName,
        global_role: role,
        phone: phone ?? null,
        email_notifications_enabled: true,
      },
      { onConflict: 'id' },
    )
    if (error) this.logger.warn(`Failed to upsert user profile for ${email}: ${error.message}`)
  }
}
