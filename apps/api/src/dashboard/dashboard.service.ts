import { Injectable } from '@nestjs/common';
import type { Dashboard } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import {
  DEFAULT_DASHBOARD_CONFIG,
  DEFAULT_DASHBOARD_STORAGE
} from './dashboard.defaults';

type DashboardConfigInput = {
  brandName?: string;
  language?: 'ko' | 'en' | 'ja' | 'zh';
  serviceGridColumnsLg?: number;
  showBrand?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  dockSeparatorEnabled?: boolean;
  themeKey?: string;
  title?: string;
  description?: string;
  weatherMode?: 'auto' | 'manual';
  weatherName?: string | null;
  weatherRegion?: string | null;
  weatherCountry?: string | null;
  weatherLatitude?: number | null;
  weatherLongitude?: number | null;
  systemSummaryOrder?: string[] | null;
  weatherMetaOrder?: string[] | null;
};

type DashboardServiceItemInput = {
  id?: string;
  name: string;
  url: string;
  description?: string | null;
  icon?: string | null;
  iconUrl?: string | null;
  target?: string | null;
  requiresAuth?: boolean | null;
  isFavorite?: boolean | null;
  sortOrder?: number | null;
};

type DashboardCategoryInput = {
  id?: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  sortOrder?: number | null;
  services?: DashboardServiceItemInput[];
};

export type DashboardUpdatePayload = {
  config?: DashboardConfigInput;
  categories?: DashboardCategoryInput[];
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicDashboard() {
    const config = this.formatConfig(await this.ensureDashboard());
    const categories = await this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        services: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    const filteredCategories = categories
      .map((category) => ({
        ...category,
        services: category.services.filter((service) => !service.requiresAuth)
      }))
      .filter((category) => category.services.length > 0);

    return { config, categories: filteredCategories };
  }

  async getAdminDashboard() {
    const config = this.formatConfig(await this.ensureDashboard());
    const categories = await this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        services: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    return { config, categories };
  }

  async updateDashboard(payload: DashboardUpdatePayload) {
    if (payload.config) {
      await this.updateConfig(payload.config);
    }

    if (payload.categories) {
      await this.replaceCategories(payload.categories);
    }

    return this.getAdminDashboard();
  }

  private async ensureDashboard() {
    const existing = await this.prisma.dashboard.findFirst();
    if (existing) {
      return existing;
    }

    return this.prisma.dashboard.create({
      data: DEFAULT_DASHBOARD_STORAGE
    });
  }

  private formatConfig(dashboard: Dashboard) {
    return {
      ...dashboard,
      systemSummaryOrder: parseOrder(
        dashboard.systemSummaryOrder,
        DEFAULT_DASHBOARD_CONFIG.systemSummaryOrder
      ),
      weatherMetaOrder: parseOrder(
        dashboard.weatherMetaOrder,
        DEFAULT_DASHBOARD_CONFIG.weatherMetaOrder
      )
    };
  }

  private async updateConfig(config: DashboardConfigInput) {
    const dashboard = await this.ensureDashboard();
    const nextSystemSummary =
      config.systemSummaryOrder ??
      parseOrder(
        dashboard.systemSummaryOrder,
        DEFAULT_DASHBOARD_CONFIG.systemSummaryOrder
      );
    const nextWeatherMeta =
      config.weatherMetaOrder ??
      parseOrder(
        dashboard.weatherMetaOrder,
        DEFAULT_DASHBOARD_CONFIG.weatherMetaOrder
      );
    return this.prisma.dashboard.update({
      where: { id: dashboard.id },
      data: {
        brandName: config.brandName ?? dashboard.brandName,
        language: config.language ?? dashboard.language,
        serviceGridColumnsLg:
          config.serviceGridColumnsLg ?? dashboard.serviceGridColumnsLg,
        showBrand: config.showBrand ?? dashboard.showBrand,
        showTitle: config.showTitle ?? dashboard.showTitle,
        showDescription: config.showDescription ?? dashboard.showDescription,
        dockSeparatorEnabled:
          config.dockSeparatorEnabled ?? dashboard.dockSeparatorEnabled,
        themeKey: config.themeKey ?? dashboard.themeKey,
        title: config.title ?? dashboard.title,
        description: config.description ?? dashboard.description,
        weatherMode: config.weatherMode ?? dashboard.weatherMode,
        weatherName: config.weatherName ?? dashboard.weatherName,
        weatherRegion: config.weatherRegion ?? dashboard.weatherRegion,
        weatherCountry: config.weatherCountry ?? dashboard.weatherCountry,
        weatherLatitude: config.weatherLatitude ?? dashboard.weatherLatitude,
        weatherLongitude: config.weatherLongitude ?? dashboard.weatherLongitude,
        systemSummaryOrder: serializeOrder(
          nextSystemSummary,
          DEFAULT_DASHBOARD_CONFIG.systemSummaryOrder
        ),
        weatherMetaOrder: serializeOrder(
          nextWeatherMeta,
          DEFAULT_DASHBOARD_CONFIG.weatherMetaOrder
        )
      }
    });
  }

  private async replaceCategories(categories: DashboardCategoryInput[]) {
    const existingCategories = await this.prisma.category.findMany({
      include: { services: true }
    });

    const incomingCategoryIds = categories
      .map((category) => category.id)
      .filter((id): id is string => Boolean(id));

    const deleteCategoryIds = existingCategories
      .filter((category) => !incomingCategoryIds.includes(category.id))
      .map((category) => category.id);

    if (deleteCategoryIds.length > 0) {
      await this.prisma.service.deleteMany({
        where: { categoryId: { in: deleteCategoryIds } }
      });
      await this.prisma.category.deleteMany({
        where: { id: { in: deleteCategoryIds } }
      });
    }

    for (const [index, category] of categories.entries()) {
      const categoryId = category.id ?? undefined;
      const sortOrder = Number.isFinite(category.sortOrder)
        ? Number(category.sortOrder)
        : index;

      const data = {
        name: category.name,
        description: category.description ?? null,
        icon: category.icon ?? null,
        color: category.color ?? null,
        sortOrder
      };

      const upsertedCategory = categoryId
        ? await this.prisma.category.upsert({
            where: { id: categoryId },
            update: data,
            create: { id: categoryId, ...data }
          })
        : await this.prisma.category.create({
            data
          });

      await this.replaceServices(upsertedCategory.id, category.services ?? []);
    }
  }

  private async replaceServices(
    categoryId: string,
    services: DashboardServiceItemInput[]
  ) {
    const incomingServiceIds = services
      .map((service) => service.id)
      .filter((id): id is string => Boolean(id));

    if (incomingServiceIds.length > 0) {
      await this.prisma.service.deleteMany({
        where: {
          categoryId,
          id: { notIn: incomingServiceIds }
        }
      });
    } else {
      await this.prisma.service.deleteMany({ where: { categoryId } });
    }

    for (const [index, service] of services.entries()) {
      const serviceId = service.id ?? undefined;
      const sortOrder = Number.isFinite(service.sortOrder)
        ? Number(service.sortOrder)
        : index;

      const data = {
        name: service.name,
        url: service.url,
        description: service.description ?? null,
        icon: service.icon ?? null,
        iconUrl: service.iconUrl ?? null,
        target: normalizeTarget(service.target),
        requiresAuth: Boolean(service.requiresAuth),
        isFavorite: Boolean(service.isFavorite),
        sortOrder,
        categoryId
      };

      if (serviceId) {
        await this.prisma.service.upsert({
          where: { id: serviceId },
          update: data,
          create: { id: serviceId, ...data }
        });
      } else {
        await this.prisma.service.create({ data });
      }
    }
  }
}

function parseOrder(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string');
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === 'string');
      }
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function serializeOrder(value: string[] | null | undefined, fallback: string[]) {
  const base = Array.isArray(value) && value.length > 0 ? value : fallback;
  return JSON.stringify(base);
}

function normalizeTarget(target?: string | null) {
  if (target === '_self' || target === '_blank') {
    return target;
  }
  if (target === 'window') {
    return '_blank';
  }
  return '_blank';
}
