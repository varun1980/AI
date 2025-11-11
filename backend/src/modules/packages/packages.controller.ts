import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('packages')
@UseGuards(JwtAuthGuard)
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  @Post()
  async create(@Body() dto: any, @Req() req) {
    return this.packagesService.create({
      userId: req.user.id,
      type: dto.type,
      preferredDay: dto.preferredDay,
      preferredTime: dto.preferredTime,
    });
  }

  @Get('my-packages')
  async getMyPackages(@Req() req) {
    return this.packagesService.findByUser(req.user.id);
  }

  @Get(':id')
  async getPackage(@Param('id') id: string) {
    return this.packagesService.findById(id);
  }

  @Get(':id/balance')
  async getBalance(@Param('id') id: string) {
    return this.packagesService.getRemainingBalance(id);
  }
}
