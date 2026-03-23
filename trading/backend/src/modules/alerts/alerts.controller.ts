import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

class CreateAlertDto {
  @IsString()
  symbol: string;

  @IsEnum(['ABOVE', 'BELOW', 'CROSSES_UP', 'CROSSES_DOWN'])
  condition: string;

  @IsNumber()
  targetPrice: number;

  @IsOptional()
  @IsString()
  message?: string;
}

@Controller('alerts')
export class AlertsController {
  constructor(private alerts: AlertsService) {}

  @Post()
  create(@Body() dto: CreateAlertDto) {
    return this.alerts.create(dto);
  }

  @Get()
  findAll() {
    return this.alerts.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alerts.remove(id);
  }
}
