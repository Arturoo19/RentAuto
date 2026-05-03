import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats(@Query('period') period: 'day' | 'week' = 'day') {
    return this.adminService.getStats(period);
  }

  @Get('rentals/active')
  getActiveRentals() {
    return this.adminService.getActiveRentals();
  }

  @Get('rentals/expiring')
  getExpiringRentals() {
    return this.adminService.getExpiringRentals();
  }

  @Get('profitable')
  getMostProfitable() {
    return this.adminService.getMostProfitable();
  }
}
