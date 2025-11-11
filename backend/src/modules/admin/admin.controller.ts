import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('bookings')
  async getAllBookings(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAllBookings({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('users')
  async getAllUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAllUsers({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('export')
  async export(@Query('type') type: 'bookings' | 'users' | 'payments') {
    return this.adminService.exportData(type);
  }
}
