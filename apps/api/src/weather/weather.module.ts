import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

@Module({
  imports: [PrismaModule],
  controllers: [WeatherController],
  providers: [WeatherService]
})
export class WeatherModule {}
