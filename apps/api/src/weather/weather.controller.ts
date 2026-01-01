import { Controller, Get, Query, Req } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  getWeather(@Req() request: { headers: Record<string, string>; ip?: string }) {
    const forwarded = request.headers['x-forwarded-for'] ?? '';
    const realIp = request.headers['x-real-ip'] ?? '';
    const ip = forwarded || realIp || request.ip;
    return this.weatherService.getWeather(ip);
  }

  @Get('locations')
  searchLocations(@Query('query') query?: string) {
    return this.weatherService.searchLocations(query ?? '');
  }
}
