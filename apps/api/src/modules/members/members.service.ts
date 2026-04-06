import { Injectable, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class MembersService {
  constructor(private supabaseService: SupabaseService) {}

  async getMembers(userId: string, page: number = 1, limit: number = 10) {
    try {
      const supabase = this.supabaseService.client

      // Get user's mosque
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
      const offset = (page - 1) * limit

      // Get members of the same mosque
      const { data: members, error: membersError, count } = await supabase
        .from('mosque_members')
        .select(`
          user_id,
          role,
          is_active,
          created_at,
          users!inner (
            id,
            email,
            full_name,
            phone,
            created_at
          )
        `, { count: 'exact' })
        .eq('mosque_id', mosqueId)
        .eq('is_active', true)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (membersError) {
        throw new BadRequestException('Failed to fetch members')
      }

      // Transform the data to match the expected format
      const transformedMembers = members.map(member => {
        const user = Array.isArray(member.users) ? member.users[0] : member.users;
        return {
          id: user.id,
          name: user.full_name || user.email,
          email: user.email,
          phone: user.phone,
          joined_at: member.created_at,
          status: member.is_active ? 'active' : 'inactive',
          role: member.role,
        };
      });

      return {
        data: transformedMembers,
        total: count || 0,
        page,
        limit,
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      throw error
    }
  }

  async getMember(userId: string, memberId: string) {
    try {
      const supabase = this.supabaseService.client

      // Get user's mosque
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

      // Get specific member
      const { data: member, error: memberError2 } = await supabase
        .from('mosque_members')
        .select(`
          user_id,
          role,
          is_active,
          created_at,
          users!inner (
            id,
            email,
            full_name,
            phone,
            created_at
          )
        `)
        .eq('mosque_id', mosqueId)
        .eq('user_id', memberId)
        .eq('is_active', true)
        .single()

      if (memberError2 || !member) {
        throw new BadRequestException('Member not found')
      }

      const user = Array.isArray(member.users) ? member.users[0] : member.users;
      return {
        id: user.id,
        name: user.full_name || user.email,
        email: user.email,
        phone: user.phone,
        joined_at: member.created_at,
        status: member.is_active ? 'active' : 'inactive',
        role: member.role,
      }
    } catch (error) {
      console.error('Error fetching member:', error)
      throw error
    }
  }
}