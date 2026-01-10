import type { CookieOptions } from 'express';
import { ConfigService } from '@nestjs/config';
import { AUTH_COOKIE_MAX_AGE_MS } from './auth.constants';

type SameSiteOption = 'lax' | 'strict' | 'none';

const normalizeSameSite = (value?: string): SameSiteOption => {
  if (!value) return 'lax';
  const lowered = value.toLowerCase();
  if (lowered === 'strict' || lowered === 'none') return lowered;
  return 'lax';
};

const parseBoolean = (value?: string): boolean | undefined => {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

export const getAuthCookieOptions = (
  configService: ConfigService
): CookieOptions => {
  const secure =
    parseBoolean(configService.get<string>('COOKIE_SECURE')) ??
    configService.get<string>('NODE_ENV') === 'production';

  const sameSite = normalizeSameSite(
    configService.get<string>('COOKIE_SAME_SITE')
  );

  const domain = configService.get<string>('COOKIE_DOMAIN');

  return {
    httpOnly: true,
    secure,
    sameSite,
    domain: domain && domain.length > 0 ? domain : undefined,
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_MS
  };
};

export const getAuthCookieClearOptions = (
  configService: ConfigService
): CookieOptions => {
  const options = getAuthCookieOptions(configService);
  return {
    ...options,
    maxAge: 0,
    expires: new Date(0)
  };
};
