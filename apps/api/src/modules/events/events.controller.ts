import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Query,
  BadRequestException,
  Inject,
} from '@nestjs/common'
import { EventsService } from './events.service'
import { ConfigService } from '@nestjs/config'
import { SupabaseService } from '../supabase/supabase.service'

@Controller()
export class EventsController {
  constructor(
    private eventsService: EventsService,
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  // Routes for events management
  @Post('events')
  async createEvent(
    @Headers('authorization') authHeader: string,
    @Body()
    body: {
      title: string
      startLocal: string
      endLocal: string
      timeZone: string
      location: string
      mapLink?: string
      specialGuest?: string
      registration: boolean
      registrationLink?: string
      ageGroup?: string
      food?: boolean
      contactEmail: string
      contactPhone: string
      description?: string
      imageUrl?: string
      fee?: string
      prize?: string
    },
  ) {
    // Extract userId from auth header (format: "Bearer <jwt_token>")
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Missing authorization header')
    }

    const userId = this.supabaseService.extractUserIdFromToken(authHeader)

    // Validate required fields
    if (!body.title || !body.startLocal || !body.endLocal) {
      throw new BadRequestException('Missing required fields: title, startLocal, endLocal')
    }

    const event = await this.eventsService.createEvent(userId, body)
    return {
      success: true,
      data: event,
      message: 'Event created successfully',
    }
  }

  @Post('announcements')
  async createAnnouncement(
    @Headers('authorization') authHeader: string,
    @Body()
    body: {
      title: string
      message: string
      scheduleAt: string
    },
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Missing authorization header')
    }

    const userId = this.supabaseService.extractUserIdFromToken(authHeader)

    // Validate required fields
    if (!body.title || !body.message) {
      throw new BadRequestException('Missing required fields: title, message')
    }

    const announcement = await this.eventsService.createAnnouncement(userId, body)
    return {
      success: true,
      data: announcement,
      message: 'Announcement created successfully',
    }
  }

  @Post('reminders')
  async createReminder(
    @Headers('authorization') authHeader: string,
    @Body()
    body: {
      title: string
      message: string
      scheduleAt: string
    },
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Missing authorization header')
    }

    const userId = authHeader.replace('Bearer ', '')

    // Validate required fields
    if (!body.title || !body.message) {
      throw new BadRequestException('Missing required fields: title, message')
    }

    const reminder = await this.eventsService.createReminder(userId, body)
    return {
      success: true,
      data: reminder,
      message: 'Reminder created successfully',
    }
  }

  @Get('events')
  async getEvents(
    @Headers('authorization') authHeader: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.supabaseService.extractUserIdFromToken(authHeader)
    const pageNum = parseInt(page || '1', 10)
    const limitNum = parseInt(limit || '10', 10)

    const result = await this.eventsService.getEvents(userId, pageNum, limitNum)
    return {
      success: true,
      ...result,
    }
  }

  @Get('announcements')
  async getAnnouncements(
    @Headers('authorization') authHeader: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.supabaseService.extractUserIdFromToken(authHeader)
    const pageNum = parseInt(page || '1', 10)
    const limitNum = parseInt(limit || '10', 10)

    const result = await this.eventsService.getAnnouncements(userId, pageNum, limitNum)
    return {
      success: true,
      ...result,
    }
  }
}
