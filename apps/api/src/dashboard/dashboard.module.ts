import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardSeedService } from './dashboard.seed';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardSeedService]
})
export class DashboardModule {}
