import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const DEFAULT_LOCATION = {
  name: '서울',
  region: '서울특별시',
  country: '대한민국',
  latitude: 37.5665,
  longitude: 126.978
};

type WeatherLocation = {
  name: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
  source: 'ip' | 'default' | 'manual';
};

type WeatherCurrent = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number;
  uvIndex: number;
  windSpeed: number;
  cloudCover: number;
  pressure: number;
  visibility: number;
  windDirection: number;
  windGust: number;
  dewPoint: number;
  rain: number;
  snowfall: number;
  summary: string;
  icon: string;
  code: number;
};

type WeatherDaily = {
  minTemp: number;
  maxTemp: number;
  sunrise: string;
  sunset: string;
};

export type WeatherPayload = {
  location: WeatherLocation;
  current: WeatherCurrent;
  daily: WeatherDaily;
  observedAt: string;
};

@Injectable()
export class WeatherService {
  private cache?: { key: string; data: WeatherPayload; expiresAt: number };

  constructor(private readonly prisma: PrismaService) {}

  async getWeather(ip?: string) {
    const normalizedIp = normalizeIp(ip);
    const now = Date.now();
    const manualLocation = await this.resolveManualLocation();
    const cacheKey = manualLocation
      ? `manual:${manualLocation.latitude},${manualLocation.longitude}`
      : normalizedIp;

    if (
      this.cache &&
      now < this.cache.expiresAt &&
      this.cache.key === cacheKey
    ) {
      return this.cache.data;
    }

    const location =
      manualLocation ?? (await this.resolveLocation(normalizedIp));
    const weather = await this.fetchWeather(location);

    const payload: WeatherPayload = {
      location,
      current: weather.current,
      daily: weather.daily,
      observedAt: weather.observedAt
    };

    this.cache = {
      key: cacheKey,
      data: payload,
      expiresAt: now + 10 * 60 * 1000
    };

    return payload;
  }

  async searchLocations(query: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', query);
    url.searchParams.set('count', '6');
    url.searchParams.set('language', 'ko');
    url.searchParams.set('format', 'json');

    try {
      const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'HomeDock' }
      });

      if (!response.ok) {
        return [];
      }

      const data = (await response.json()) as {
        results?: Array<{
          name?: string;
          admin1?: string;
          country?: string;
          latitude?: number;
          longitude?: number;
        }>;
      };

      return (data.results ?? [])
        .filter((item) => item.latitude && item.longitude)
        .map((item) => ({
          name: item.name ?? '알 수 없음',
          region: item.admin1 ?? undefined,
          country: item.country ?? undefined,
          latitude: item.latitude as number,
          longitude: item.longitude as number
        }));
    } catch {
      return [];
    }
  }

  private async resolveManualLocation(): Promise<WeatherLocation | null> {
    const dashboard = await this.prisma.dashboard.findFirst();
    if (!dashboard) {
      return null;
    }

    if (dashboard.weatherMode !== 'manual') {
      return null;
    }

    if (
      dashboard.weatherLatitude === null ||
      dashboard.weatherLongitude === null
    ) {
      return null;
    }

    return {
      name: dashboard.weatherName ?? DEFAULT_LOCATION.name,
      region: dashboard.weatherRegion ?? DEFAULT_LOCATION.region,
      country: dashboard.weatherCountry ?? DEFAULT_LOCATION.country,
      latitude: dashboard.weatherLatitude,
      longitude: dashboard.weatherLongitude,
      source: 'manual'
    };
  }

  private async resolveLocation(ip?: string): Promise<WeatherLocation> {
    if (!ip || isPrivateIp(ip)) {
      return { ...DEFAULT_LOCATION, source: 'default' };
    }

    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: { 'User-Agent': 'HomeDock' }
      });

      if (!response.ok) {
        throw new Error('geo lookup failed');
      }

      const data = (await response.json()) as {
        city?: string;
        region?: string;
        country_name?: string;
        latitude?: number;
        longitude?: number;
        error?: boolean;
      };

      if (data.error || !data.latitude || !data.longitude) {
        return { ...DEFAULT_LOCATION, source: 'default' };
      }

      return {
        name: data.city ?? DEFAULT_LOCATION.name,
        region: data.region ?? DEFAULT_LOCATION.region,
        country: data.country_name ?? DEFAULT_LOCATION.country,
        latitude: data.latitude,
        longitude: data.longitude,
        source: 'ip'
      };
    } catch {
      return { ...DEFAULT_LOCATION, source: 'default' };
    }
  }

  private async fetchWeather(location: WeatherLocation) {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', location.latitude.toString());
    url.searchParams.set('longitude', location.longitude.toString());
    url.searchParams.set(
      'current',
      'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,pressure_msl,precipitation'
    );
    url.searchParams.set(
      'hourly',
      'precipitation_probability,precipitation,uv_index,visibility,dew_point_2m,cloud_cover,pressure_msl,wind_direction_10m,wind_gusts_10m,rain,snowfall'
    );
    url.searchParams.set(
      'daily',
      'temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max'
    );
    url.searchParams.set('timezone', 'auto');

    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'HomeDock' }
    });

    if (!response.ok) {
      return fallbackWeather();
    }

    const data = (await response.json()) as {
      current?: {
        temperature_2m?: number;
        apparent_temperature?: number;
        relative_humidity_2m?: number;
        weather_code?: number;
        wind_speed_10m?: number;
        wind_direction_10m?: number;
        wind_gusts_10m?: number;
        cloud_cover?: number;
        pressure_msl?: number;
        precipitation?: number;
        time?: string;
      };
      hourly?: {
        time?: string[];
        precipitation_probability?: number[];
        precipitation?: number[];
        uv_index?: number[];
        visibility?: number[];
        dew_point_2m?: number[];
        cloud_cover?: number[];
        pressure_msl?: number[];
        wind_direction_10m?: number[];
        wind_gusts_10m?: number[];
        rain?: number[];
        snowfall?: number[];
      };
      daily?: {
        time?: string[];
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
        sunrise?: string[];
        sunset?: string[];
        uv_index_max?: number[];
      };
    };

    if (!data.current) {
      return fallbackWeather();
    }

    const code = Number(data.current.weather_code ?? 0);
    const mapped = mapWeather(code);
    const hourlyIndex = findClosestIndex(
      data.hourly?.time,
      data.current.time
    );
    const dailyIndex = 0;
    const precipitationProbability = getArrayValue(
      data.hourly?.precipitation_probability,
      hourlyIndex
    );
    const hourlyPrecipitation = getArrayValue(
      data.hourly?.precipitation,
      hourlyIndex
    );
    const uvIndex = getArrayValue(data.daily?.uv_index_max, dailyIndex);
    const visibilityMeters = getArrayValue(
      data.hourly?.visibility,
      hourlyIndex
    );
    const dewPoint = getArrayValue(data.hourly?.dew_point_2m, hourlyIndex);
    const cloudCover =
      data.current.cloud_cover ??
      getArrayValue(data.hourly?.cloud_cover, hourlyIndex);
    const pressure =
      data.current.pressure_msl ??
      getArrayValue(data.hourly?.pressure_msl, hourlyIndex);
    const windDirection =
      data.current.wind_direction_10m ??
      getArrayValue(data.hourly?.wind_direction_10m, hourlyIndex);
    const windGust =
      data.current.wind_gusts_10m ??
      getArrayValue(data.hourly?.wind_gusts_10m, hourlyIndex);
    const rain = getArrayValue(data.hourly?.rain, hourlyIndex);
    const snowfall = getArrayValue(data.hourly?.snowfall, hourlyIndex);

    return {
      observedAt: data.current.time ?? new Date().toISOString(),
      daily: {
        minTemp: getArrayValue(data.daily?.temperature_2m_min, dailyIndex),
        maxTemp: getArrayValue(data.daily?.temperature_2m_max, dailyIndex),
        sunrise: formatTime(data.daily?.sunrise?.[dailyIndex]),
        sunset: formatTime(data.daily?.sunset?.[dailyIndex])
      },
      current: {
        temperature: roundNumber(data.current.temperature_2m, 0),
        feelsLike: roundNumber(data.current.apparent_temperature, 0),
        humidity: roundNumber(data.current.relative_humidity_2m, 0),
        precipitationProbability: roundNumber(precipitationProbability, 0),
        precipitation: roundNumber(
          hourlyPrecipitation ?? data.current.precipitation,
          1
        ),
        uvIndex: roundNumber(uvIndex, 0),
        windSpeed: roundNumber(data.current.wind_speed_10m, 0),
        cloudCover: roundNumber(cloudCover, 0),
        pressure: roundNumber(pressure, 0),
        visibility: roundTo(visibilityMeters ? visibilityMeters / 1000 : undefined, 1),
        windDirection: roundNumber(windDirection, 0),
        windGust: roundNumber(windGust, 0),
        dewPoint: roundNumber(dewPoint, 0),
        rain: roundTo(rain, 1),
        snowfall: roundTo(snowfall, 1),
        summary: mapped.summary,
        icon: mapped.icon,
        code
      }
    };
  }
}

function normalizeIp(ip?: string) {
  if (!ip) return '';
  const trimmed = ip.split(',')[0]?.trim() ?? '';
  return trimmed.startsWith('::ffff:') ? trimmed.slice(7) : trimmed;
}

function isPrivateIp(ip: string) {
  return (
    ip === '::1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    ip.startsWith('127.')
  );
}

function roundNumber(value?: number, fallback = 0) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }
  return Math.round(value);
}

function roundTo(value?: number, decimals = 0, fallback = 0) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function fallbackWeather() {
  return {
    observedAt: new Date().toISOString(),
    daily: {
      minTemp: 18,
      maxTemp: 26,
      sunrise: '06:52',
      sunset: '19:38'
    },
    current: {
      temperature: 22,
      feelsLike: 24,
      humidity: 48,
      precipitationProbability: 0,
      precipitation: 0,
      uvIndex: 5,
      windSpeed: 3,
      cloudCover: 35,
      pressure: 1012,
      visibility: 10,
      windDirection: 180,
      windGust: 6,
      dewPoint: 12,
      rain: 0,
      snowfall: 0,
      summary: '맑음',
      icon: '☀️',
      code: 0
    }
  };
}

function mapWeather(code: number) {
  if (code === 0) {
    return { summary: '맑음', icon: '☀️' };
  }
  if ([1, 2].includes(code)) {
    return { summary: '구름 조금', icon: '🌤️' };
  }
  if (code === 3) {
    return { summary: '흐림', icon: '☁️' };
  }
  if ([45, 48].includes(code)) {
    return { summary: '안개', icon: '🌫️' };
  }
  if ([51, 53, 55].includes(code)) {
    return { summary: '이슬비', icon: '🌦️' };
  }
  if ([56, 57].includes(code)) {
    return { summary: '진눈깨비', icon: '🌧️' };
  }
  if ([61, 63, 65].includes(code)) {
    return { summary: '비', icon: '🌧️' };
  }
  if ([66, 67].includes(code)) {
    return { summary: '어는 비', icon: '🌧️' };
  }
  if ([71, 73, 75].includes(code)) {
    return { summary: '눈', icon: '❄️' };
  }
  if (code === 77) {
    return { summary: '눈알갱이', icon: '🌨️' };
  }
  if ([80, 81, 82].includes(code)) {
    return { summary: '소나기', icon: '🌧️' };
  }
  if ([85, 86].includes(code)) {
    return { summary: '소낙눈', icon: '🌨️' };
  }
  if (code === 95) {
    return { summary: '천둥번개', icon: '⛈️' };
  }
  if ([96, 99].includes(code)) {
    return { summary: '우박 동반 폭풍', icon: '⛈️' };
  }
  return { summary: '변덕스러움', icon: '🌥️' };
}

function findClosestIndex(times?: string[], target?: string) {
  if (!times || times.length === 0 || !target) {
    return 0;
  }
  const targetTime = Date.parse(target);
  if (Number.isNaN(targetTime)) {
    return 0;
  }
  let bestIndex = 0;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (let i = 0; i < times.length; i += 1) {
    const timeValue = Date.parse(times[i]);
    if (Number.isNaN(timeValue)) continue;
    const diff = Math.abs(timeValue - targetTime);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = i;
    }
  }
  return bestIndex;
}

function getArrayValue(values?: number[], index = 0) {
  if (!values || values.length === 0) {
    return 0;
  }
  return values[Math.min(Math.max(index, 0), values.length - 1)] ?? 0;
}

function formatTime(value?: string) {
  if (!value) return '--:--';
  const parts = value.split('T');
  return parts[1]?.slice(0, 5) ?? value;
}
