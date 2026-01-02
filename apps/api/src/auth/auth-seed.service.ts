import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthSeedService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async onModuleInit() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');

    if (!email || !password) {
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        role: 'admin'
      },
      create: {
        email,
        passwordHash,
        role: 'admin'
      }
    });
  }
}
