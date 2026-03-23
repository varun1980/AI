import { Controller, Get, Post, Delete, Patch, Body, Param } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { CreateScheduledOrderDto } from './scheduler.dto';

@Controller('scheduler')
export class SchedulerController {
  constructor(private scheduler: SchedulerService) {}

  @Post()
  create(@Body() dto: CreateScheduledOrderDto) {
    return this.scheduler.create(dto);
  }

  @Get()
  findAll() {
    return this.scheduler.findAll();
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.scheduler.activate(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.scheduler.deactivate(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduler.remove(id);
  }
}
