export type Service = {
  id: string;
  name: string;
  url: string;
  description?: string | null;
  icon?: string | null;
  iconUrl?: string | null;
  status?: string | null;
  target?: string | null;
  requiresAuth?: boolean | null;
  isFavorite?: boolean | null;
  sortOrder?: number | null;
  categoryId?: string | null;
};

export type Category = {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  sortOrder?: number | null;
  services?: Service[];
};

export type DashboardConfig = {
  id: string;
  brandName: string;
  language: 'ko' | 'en' | 'ja' | 'zh';
  serviceGridColumnsLg: number;
  showBrand?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  dockSeparatorEnabled?: boolean;
  themeKey?: string;
  title: string;
  description: string;
  weatherMode: 'auto' | 'manual';
  weatherName?: string | null;
  weatherRegion?: string | null;
  weatherCountry?: string | null;
  weatherLatitude?: number | null;
  weatherLongitude?: number | null;
  systemSummaryOrder?: string[] | null;
  weatherMetaOrder?: string[] | null;
};

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};
