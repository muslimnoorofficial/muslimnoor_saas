import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common'
import { MembersService } from './members.service'

@Controller('api/members')
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Get()
  async getMembers(
    @Headers('authorization') authHeader: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Missing authorization header')
    }

    const userId = authHeader.replace('Bearer ', '')
    const pageNum = parseInt(page, 10) || 1
    const limitNum = parseInt(limit, 10) || 10

    return this.membersService.getMembers(userId, pageNum, limitNum)
  }

  @Get(':id')
  async getMember(
    @Headers('authorization') authHeader: string,
    @Param('id') memberId: string,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Missing authorization header')
    }

    const userId = authHeader.replace('Bearer ', '')

    return this.membersService.getMember(userId, memberId)
  }
}