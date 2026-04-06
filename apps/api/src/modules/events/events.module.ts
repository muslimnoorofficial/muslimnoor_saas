import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EventsController } from './events.controller'
import { EventsService } from './events.service'
import { SupabaseModule } from '../supabase/supabase.module'

@Module({
  imports: [ConfigModule, SupabaseModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
