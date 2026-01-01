import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService, DashboardUpdatePayload } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getPublic() {
    return this.dashboardService.getPublicDashboard();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  getAdmin() {
    return this.dashboardService.getAdminDashboard();
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin')
  update(@Body() body: DashboardUpdatePayload) {
    return this.dashboardService.updateDashboard(body);
  }
}
