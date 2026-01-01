import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.service.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
    });
  }

  create(dto: CreateServiceDto) {
    return this.prisma.service.create({
      data: {
        name: dto.name,
        url: dto.url,
        description: dto.description,
        icon: dto.icon,
        iconUrl: dto.iconUrl,
        status: dto.status,
        target: dto.target ?? '_blank',
        requiresAuth: dto.requiresAuth ?? false,
        isFavorite: dto.isFavorite ?? false,
        sortOrder: dto.sortOrder ?? 0,
        categoryId: dto.categoryId
      }
    });
  }
}
