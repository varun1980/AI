import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, CancelBookingDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  async create(@Body() dto: CreateBookingDto, @Req() req) {
    return this.bookingsService.create(dto, req.user.id);
  }

  @Get('my-bookings')
  async getMyBookings(@Req() req, @Query('type') type?: string) {
    const params = type === 'upcoming' ? { upcoming: true } : type === 'past' ? { past: true } : {};
    return this.bookingsService.findByUser(req.user.id, params);
  }

  @Get('availability')
  async getAvailability(@Query('date') date: string, @Query('sessionConfigId') sessionConfigId: string) {
    return this.bookingsService.getAvailableSlots(date, sessionConfigId);
  }

  @Get(':id')
  async getBooking(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @Patch(':id/confirm')
  async confirm(@Param('id') id: string) {
    return this.bookingsService.confirmBooking(id);
  }

  @Patch(':id/reschedule')
  async reschedule(
    @Param('id') id: string,
    @Body('newStartTime') newStartTime: string,
    @Req() req,
  ) {
    return this.bookingsService.reschedule(id, newStartTime, req.user.id);
  }

  @Delete(':id')
  async cancel(@Param('id') id: string, @Body() dto: CancelBookingDto, @Req() req) {
    return this.bookingsService.cancel(id, dto, req.user.id);
  }
}
