import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Get('events')
  async getEvents(@Query('start') start: string, @Query('end') end: string) {
    return this.calendarService.getEvents(new Date(start), new Date(end));
  }

  @Post('availability-block')
  @UseGuards(RolesGuard)
  async createBlock(@Body() dto: any) {
    return this.calendarService.createAvailabilityBlock({
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      reason: dto.reason,
      isBlocked: dto.isBlocked,
    });
  }

  @Delete('availability-block/:id')
  @UseGuards(RolesGuard)
  async removeBlock(@Param('id') id: string) {
    return this.calendarService.removeAvailabilityBlock(id);
  }
}
