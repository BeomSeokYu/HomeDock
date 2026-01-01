import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DEFAULT_CATEGORIES, DEFAULT_DASHBOARD_CONFIG } from './dashboard.defaults';

@Injectable()
export class DashboardSeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureConfig();
    await this.ensureCategories();
  }

  private async ensureConfig() {
    const existing = await this.prisma.dashboard.findFirst();
    if (existing) return;
    await this.prisma.dashboard.create({ data: DEFAULT_DASHBOARD_CONFIG });
  }

  private async ensureCategories() {
    const categoryCount = await this.prisma.category.count();
    if (categoryCount > 0) {
      return;
    }

    for (const category of DEFAULT_CATEGORIES) {
      await this.prisma.category.create({
        data: {
          name: category.name,
          description: category.description ?? null,
          icon: category.icon ?? null,
          color: category.color ?? null,
          sortOrder: category.sortOrder,
          services: {
            create: category.services.map((service) => ({
              name: service.name,
              url: service.url,
              description: service.description ?? null,
              icon: service.icon ?? null,
              iconUrl: service.iconUrl ?? null,
              status: service.status ?? null,
              target: service.target ?? '_blank',
              requiresAuth: service.requiresAuth ?? false,
              isFavorite: service.isFavorite ?? false,
              sortOrder: service.sortOrder ?? 0
            }))
          }
        }
      });
    }
  }
}
