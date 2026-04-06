import { Injectable, BadRequestException, Inject } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class EventsService {
  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {}

  async createEvent(userId: string, eventData: any) {
    try {
      const supabase = this.supabaseService.client

      // Get user's mosque from mosque_members table
      const { data: memberData, error: memberError } = await supabase
        .from('mosque_members')
        .select('mosque_id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (memberError || !memberData) {
        throw new BadRequestException('User not found or not a member of any mosque')
      }

      const mosqueId = memberData.mosque_id

      // Insert event
      const { data: event, error: insertError } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          start_date: eventData.startLocal,
          end_date: eventData.endLocal,
          time_zone: eventData.timeZone,
          location: eventData.location,
          map_link: eventData.mapLink,
          special_guest: eventData.specialGuest,
          registration: eventData.registration,
          registration_link: eventData.registrationLink,
          age_group: eventData.ageGroup,
          food: eventData.food,
          contact_email: eventData.contactEmail,
          contact_phone: eventData.contactPhone,
          description: eventData.description,
          image_url: eventData.imageUrl,
          fee: eventData.fee,
          prize: eventData.prize,
          mosque_id: mosqueId,
          created_by: userId,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        throw new BadRequestException('Failed to create event')
      }

      return event
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  }

  async createAnnouncement(userId: string, announcementData: any) {
    try {
      const supabase = this.supabaseService.client

      // Get user's mosque from mosque_members table
      const { data: memberData, error: memberError } = await supabase
        .from('mosque_members')
        .select('mosque_id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (memberError || !memberData) {
        throw new BadRequestException('User not found or not a member of any mosque')
      }

      const mosqueId = memberData.mosque_id

      // Insert announcement
      const { data: announcement, error: insertError } = await supabase
        .from('announcements')
        .insert({
          title: announcementData.title,
          message: announcementData.message,
          schedule_at: announcementData.scheduleAt,
          mosque_id: mosqueId,
          created_by: userId,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        throw new BadRequestException('Failed to create announcement')
      }

      return announcement
    } catch (error) {
      console.error('Error creating announcement:', error)
      throw error
    }
  }

  async createReminder(userId: string, reminderData: any) {
    try {
      const supabase = this.supabaseService.client

      // Get user's mosque
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('mosque_id')
        .eq('id', userId)
        .single()

      if (userError || !userData) {
        throw new BadRequestException('User not found')
      }

      const mosqueId = userData.mosque_id

      // Insert reminder
      const { data: reminder, error: insertError } = await supabase
        .from('reminders')
        .insert({
          title: reminderData.title,
          message: reminderData.message,
          schedule_at: reminderData.scheduleAt,
          mosque_id: mosqueId,
          created_by: userId,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        throw new BadRequestException('Failed to create reminder')
      }

      return reminder
    } catch (error) {
      console.error('Error creating reminder:', error)
      throw error
    }
  }

  async getEvents(userId: string, page: number = 1, limit: number = 10) {
    try {
      const supabase = this.supabaseService.client

      // Get user's mosque, or use the first mosque if user doesn't have one
      const { data: userData } = await supabase
        .from('users')
        .select('mosque_id')
        .eq('id', userId)
        .single()

      let mosqueId = userData?.mosque_id

      // If user doesn't have a mosque_id, get the first mosque
      if (!mosqueId) {
        const { data: mosques } = await supabase
          .from('mosques')
          .select('id')
          .limit(1)
          .single()

        mosqueId = mosques?.id
      }

      if (!mosqueId) {
        return {
          data: [],
          total: 0,
          page,
          limit,
        }
      }

      const offset = (page - 1) * limit

      // Fetch events
      const { data: events, error: fetchError, count } = await supabase
        .from('events')
        .select('*', { count: 'exact' })
        .eq('mosque_id', mosqueId)
        .order('start_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        throw new BadRequestException('Failed to fetch events')
      }

      return {
        data: events || [],
        total: count || 0,
        page,
        limit,
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      throw error
    }
  }

  async getAnnouncements(userId: string, page: number = 1, limit: number = 10) {
    try {
      const supabase = this.supabaseService.client

      // Get user's mosque, or use the first mosque if user doesn't have one
      const { data: userData } = await supabase
        .from('users')
        .select('mosque_id')
        .eq('id', userId)
        .single()

      let mosqueId = userData?.mosque_id

      // If user doesn't have a mosque_id, get the first mosque
      if (!mosqueId) {
        const { data: mosques } = await supabase
          .from('mosques')
          .select('id')
          .limit(1)
          .single()

        mosqueId = mosques?.id
      }

      if (!mosqueId) {
        return {
          data: [],
          total: 0,
          page,
          limit,
        }
      }

      const offset = (page - 1) * limit

      // Fetch announcements
      const { data: announcements, error: fetchError, count } = await supabase
        .from('announcements')
        .select('*', { count: 'exact' })
        .eq('mosque_id', mosqueId)
        .eq('is_published', true)
        .order('published_at', { ascending: false, nullsFirst: false })
        .range(offset, offset + limit - 1)

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        throw new BadRequestException('Failed to fetch announcements')
      }

      return {
        data: announcements || [],
        total: count || 0,
        page,
        limit,
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
      throw error
    }
  }
}
