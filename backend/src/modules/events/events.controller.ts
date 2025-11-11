import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  async getAll(@Query('published') published?: string, @Query('upcoming') upcoming?: string) {
    return this.eventsService.findAll({
      published: published === 'true',
      upcoming: upcoming === 'true',
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() data: any) {
    return this.eventsService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Param('id') id: string, @Body() data: any) {
    return this.eventsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id: string) {
    return this.eventsService.delete(id);
  }
}
