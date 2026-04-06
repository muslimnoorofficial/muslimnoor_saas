import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  getTest() {
    return { message: 'Test endpoint works!', timestamp: new Date() };
  }

  @Get('donations')
  getDonationsTest() {
    return { message: 'Donations test endpoint works!' };
  }
}
