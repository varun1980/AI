import { Controller, Get, Post, Put, Delete, Patch, Body, Param } from '@nestjs/common';
import { StrategiesService } from './strategies.service';
import { CreateStrategyDto, UpdateStrategyDto } from './strategies.dto';

@Controller('strategies')
export class StrategiesController {
  constructor(private strategies: StrategiesService) {}

  @Post()
  create(@Body() dto: CreateStrategyDto) {
    return this.strategies.create(dto);
  }

  @Get()
  findAll() {
    return this.strategies.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.strategies.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStrategyDto) {
    return this.strategies.update(id, dto);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.strategies.activate(id);
  }

  @Patch(':id/pause')
  pause(@Param('id') id: string) {
    return this.strategies.pause(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.strategies.remove(id);
  }
}
