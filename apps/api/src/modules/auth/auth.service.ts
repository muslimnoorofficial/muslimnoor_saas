import { Injectable, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async registerDeviceToken(
    userId: string,
    deviceId: string,
    deviceToken: string,
    platform: 'ios' | 'android' | 'web',
  ) {
    try {
      const supabase = this.supabaseService.client

      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        throw new BadRequestException('User not found')
      }

      // Upsert device token (insert or update if device_id already exists)
      const { data: device, error: upsertError } = await supabase
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
          { onConflict: 'device_id' }, // This tells Supabase which column to use for upsert
        )
        .select()
        .single()

      if (upsertError) {
        console.error('Upsert error:', upsertError)
        throw new BadRequestException('Failed to register device token')
      }

      return {
        success: true,
        data: device,
        message: 'Device token registered successfully',
      }
    } catch (error) {
      console.error('Error registering device token:', error)
      throw error
    }
  }

  async markDeviceTokenInactive(deviceToken: string, failureReason: string) {
    try {
      const supabase = this.supabaseService.client

      const { data: device, error: updateError } = await supabase
        .from('user_devices')
        .update({
          is_active: false,
          failure_reason: failureReason,
          last_failure_at: new Date().toISOString(),
        })
        .eq('device_token', deviceToken)
        .select()
        .single()

      if (updateError) {
        console.error('Update error:', updateError)
        return null
      }

      return device
    } catch (error) {
      console.error('Error marking device token inactive:', error)
      return null
    }
  }
}
