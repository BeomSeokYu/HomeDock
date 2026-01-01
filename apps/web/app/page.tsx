'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, PointerEvent } from 'react';
import { AppIcon, appIconOptions } from './components/AppIcon';
import type { Category, DashboardConfig, Service } from '@homedock/types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api';

const categoryTones = [
  { accent: '#7ef5d2', glow: 'rgba(126, 245, 210, 0.35)' },
  { accent: '#ffb86b', glow: 'rgba(255, 184, 107, 0.35)' },
  { accent: '#8ab6ff', glow: 'rgba(138, 182, 255, 0.35)' },
  { accent: '#ff8bcf', glow: 'rgba(255, 139, 207, 0.35)' }
];

const defaultConfig: DashboardConfig = {
  id: 'default',
  brandName: 'HomeDock',
  title: 'HomeDock 메인 대시보드',
  description:
    '홈서버에 숨겨진 모든 서비스를 하나의 런처로 정리하세요. 카테고리별 정렬, 포트/도메인 빠른 확인, 바로 실행까지 한 번에.',
  weatherMode: 'auto',
  systemSummaryOrder: [
    'activeServices',
    'authStatus',
    'lastSync',
    'categoryCount'
  ],
  weatherMetaOrder: [
    'humidity',
    'precipitationProbability',
    'precipitation',
    'uvIndex',
    'windSpeed'
  ]
};

const SYSTEM_SUMMARY_MAX = 4;
const WEATHER_META_MAX = 5;

const SYSTEM_SUMMARY_OPTIONS = [
  { key: 'activeServices', label: '활성 서비스' },
  { key: 'authStatus', label: '인증 상태' },
  { key: 'lastSync', label: '마지막 동기화' },
  { key: 'categoryCount', label: '카테고리 수' },
  { key: 'favoriteCount', label: '즐겨찾기' }
] as const;

const WEATHER_META_OPTIONS = [
  { key: 'humidity', label: '습도' },
  { key: 'precipitationProbability', label: '강수확률' },
  { key: 'precipitation', label: '예상강수량' },
  { key: 'uvIndex', label: '자외선' },
  { key: 'windSpeed', label: '풍속' },
  { key: 'cloudCover', label: '구름량' },
  { key: 'pressure', label: '기압' },
  { key: 'visibility', label: '가시거리' },
  { key: 'windGust', label: '돌풍' },
  { key: 'windDirection', label: '풍향' },
  { key: 'dewPoint', label: '이슬점' },
  { key: 'rain', label: '시간당 비' },
  { key: 'snowfall', label: '시간당 눈' }
] as const;

type SystemSummaryKey = (typeof SYSTEM_SUMMARY_OPTIONS)[number]['key'];
type WeatherMetaKey = (typeof WEATHER_META_OPTIONS)[number]['key'];

const SYSTEM_SUMMARY_KEYS = SYSTEM_SUMMARY_OPTIONS.map(
  (option) => option.key
) as SystemSummaryKey[];
const WEATHER_META_KEYS = WEATHER_META_OPTIONS.map(
  (option) => option.key
) as WeatherMetaKey[];

const IDLE_LOCK_TIMEOUT_MS = 60000;

type CategoryWithTone = Category & {
  tone: { accent: string; glow: string };
  services: Service[];
};

type WeatherState = {
  icon: string;
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
  location: string;
  minTemp: number;
  maxTemp: number;
  sunrise: string;
  sunset: string;
};

type LocationOption = {
  name: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
};

const fallbackCategories: Category[] = [
  {
    id: 'media',
    name: '미디어 존',
    color: categoryTones[0].accent,
    sortOrder: 0,
    services: [
      {
        id: 'plex',
        name: 'Plex',
        url: 'http://192.168.1.2:32400',
        description: '라이브러리 스트리밍 허브',
        icon: 'tv',
        target: '_blank',
        isFavorite: true
      },
      {
        id: 'jellyfin',
        name: 'Jellyfin',
        url: 'http://192.168.1.2:8096',
        description: '자가 호스팅 미디어 센터',
        icon: 'play',
        target: '_blank'
      },
      {
        id: 'emby',
        name: 'Emby',
        url: 'http://192.168.1.2:8097',
        description: '멀티미디어 관리 허브',
        icon: 'film',
        target: '_blank'
      },
      {
        id: 'navidrome',
        name: 'Navidrome',
        url: 'http://192.168.1.2:4533',
        description: '음악 스트리밍',
        icon: 'music',
        target: '_blank'
      },
      {
        id: 'photoprism',
        name: 'PhotoPrism',
        url: 'https://photos.homedock.local',
        description: '사진 아카이브',
        icon: 'camera',
        target: '_blank'
      }
    ]
  },
  {
    id: 'infra',
    name: '인프라 컨트롤',
    color: categoryTones[1].accent,
    sortOrder: 1,
    services: [
      {
        id: 'portainer',
        name: 'Portainer',
        url: 'https://portainer.homedock.local',
        description: '도커 스택 관리',
        icon: 'containers',
        target: '_blank',
        isFavorite: true
      },
      {
        id: 'grafana',
        name: 'Grafana',
        url: 'https://grafana.homedock.local',
        description: '메트릭과 대시보드',
        icon: 'chart',
        target: '_blank'
      },
      {
        id: 'prometheus',
        name: 'Prometheus',
        url: 'http://192.168.1.2:9090',
        description: '메트릭 수집',
        icon: 'activity',
        target: '_blank'
      },
      {
        id: 'traefik',
        name: 'Traefik',
        url: 'https://traefik.homedock.local',
        description: '리버스 프록시 라우팅',
        icon: 'compass',
        target: '_blank'
      },
      {
        id: 'netdata',
        name: 'Netdata',
        url: 'http://192.168.1.2:19999',
        description: '실시간 시스템 모니터링',
        icon: 'monitor',
        target: '_blank'
      }
    ]
  },
  {
    id: 'storage',
    name: '스토리지 볼트',
    color: categoryTones[2].accent,
    sortOrder: 2,
    services: [
      {
        id: 'syncthing',
        name: 'Syncthing',
        url: 'http://192.168.1.2:8384',
        description: '파일 동기화 허브',
        icon: 'sync',
        target: '_blank'
      },
      {
        id: 'minio',
        name: 'MinIO',
        url: 'https://minio.homedock.local',
        description: 'S3 호환 오브젝트 스토리지',
        icon: 'database',
        target: '_blank'
      },
      {
        id: 'nextcloud',
        name: 'Nextcloud',
        url: 'https://cloud.homedock.local',
        description: '개인 클라우드',
        icon: 'cloud',
        target: '_blank'
      },
      {
        id: 'filebrowser',
        name: 'File Browser',
        url: 'http://192.168.1.2:8088',
        description: '웹 파일 관리자',
        icon: 'folder',
        target: '_blank',
        isFavorite: true
      },
      {
        id: 'paperless',
        name: 'Paperless',
        url: 'https://docs.homedock.local',
        description: '문서 아카이빙',
        icon: 'docs',
        target: '_blank'
      }
    ]
  },
  {
    id: 'tools',
    name: '툴박스',
    color: categoryTones[3].accent,
    sortOrder: 3,
    services: [
      {
        id: 'n8n',
        name: 'n8n',
        url: 'https://automate.homedock.local',
        description: '워크플로 자동화',
        icon: 'workflow',
        target: '_blank'
      },
      {
        id: 'uptime',
        name: 'Uptime Kuma',
        url: 'http://192.168.1.2:3001',
        description: '서비스 상태 모니터',
        icon: 'heartbeat',
        target: '_blank'
      },
      {
        id: 'gitea',
        name: 'Gitea',
        url: 'https://git.homedock.local',
        description: '경량 Git 서버',
        icon: 'git',
        target: '_blank'
      },
      {
        id: 'vaultwarden',
        name: 'Vaultwarden',
        url: 'https://vault.homedock.local',
        description: '패스워드 금고',
        icon: 'shield',
        target: '_blank'
      },
      {
        id: 'homepage',
        name: 'Homepage',
        url: 'http://192.168.1.2:3000',
        description: '홈서버 런처 대안',
        icon: 'home',
        target: '_blank'
      }
    ]
  }
];

function formatTime(now: Date) {
  return now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function formatDate(now: Date) {
  return now.toLocaleDateString('ko-KR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}

function hexToRgb(hex: string) {
  const cleaned = hex.replace('#', '').trim();
  if (cleaned.length !== 6) return null;
  const value = Number.parseInt(cleaned, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function toGlow(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`;
}

function withTones(categories: Category[]): CategoryWithTone[] {
  return categories.map((category, index) => {
    const fallback = categoryTones[index % categoryTones.length];
    const accent = category.color ?? fallback.accent;
    const glow = toGlow(accent) ?? fallback.glow;

    return {
      ...category,
      services: category.services ?? [],
      tone: { accent, glow }
    };
  });
}

function buildAutoIconUrl(url?: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return `${parsed.origin}/favicon.ico`;
  } catch {
    return null;
  }
}

function splitUrl(raw: string) {
  if (!raw) {
    return { protocol: 'http', rest: '' };
  }

  const trimmed = raw.trim();
  const match = trimmed.match(
    /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/(.*)$/
  );
  if (match) {
    return { protocol: match[1].toLowerCase(), rest: match[2] };
  }
  return { protocol: 'http', rest: trimmed };
}

function buildUrl(protocol: string, rest: string) {
  const normalizedProtocol = protocol === 'https' ? 'https' : 'http';
  const trimmed = rest
    .trim()
    .replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/{2}/, '');
  if (!trimmed) {
    return `${normalizedProtocol}://`;
  }
  return `${normalizedProtocol}://${trimmed}`;
}

function normalizeOrder(
  order: string[] | null | undefined,
  defaults: readonly string[],
  allowed: readonly string[],
  max: number
) {
  const base = Array.isArray(order) && order.length > 0 ? order : defaults;
  const filtered = base.filter((key) => allowed.includes(key));
  const unique = Array.from(new Set(filtered));
  if (unique.length > 0) {
    return unique.slice(0, max);
  }
  return defaults.filter((key) => allowed.includes(key)).slice(0, max);
}

function normalizeConfig(input: DashboardConfig) {
  const next = { ...defaultConfig, ...input };
  if (
    !Array.isArray(next.systemSummaryOrder) ||
    next.systemSummaryOrder.length === 0
  ) {
    next.systemSummaryOrder = [...defaultConfig.systemSummaryOrder];
  }
  if (!Array.isArray(next.weatherMetaOrder) || next.weatherMetaOrder.length === 0) {
    next.weatherMetaOrder = [...defaultConfig.weatherMetaOrder];
  }
  return next;
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function ServiceIcon({ service, size = 28 }: { service: Service; size?: number }) {
  const explicitUrl = service.iconUrl?.trim();
  const namedIcon = service.icon?.trim();
  const autoUrl =
    !explicitUrl && !namedIcon ? buildAutoIconUrl(service.url) : null;
  const [explicitStatus, setExplicitStatus] = useState<
    'idle' | 'pending' | 'ready' | 'error'
  >('idle');
  const [autoStatus, setAutoStatus] = useState<
    'idle' | 'pending' | 'ready' | 'error'
  >('idle');

  useEffect(() => {
    if (explicitUrl) {
      setExplicitStatus('pending');
      return;
    }
    setExplicitStatus('idle');
  }, [explicitUrl]);

  useEffect(() => {
    if (autoUrl) {
      setAutoStatus('pending');
      return;
    }
    setAutoStatus('idle');
  }, [autoUrl]);

  useEffect(() => {
    if (!explicitUrl) return;
    const handle = window.setTimeout(() => {
      setExplicitStatus((prev) => (prev === 'ready' ? prev : 'error'));
    }, 1500);
    return () => window.clearTimeout(handle);
  }, [explicitUrl]);

  useEffect(() => {
    if (!autoUrl) return;
    const handle = window.setTimeout(() => {
      setAutoStatus((prev) => (prev === 'ready' ? prev : 'error'));
    }, 1500);
    return () => window.clearTimeout(handle);
  }, [autoUrl]);

  if (explicitUrl && explicitStatus !== 'error') {
    return (
      <img
        src={explicitUrl}
        alt=""
        width={size}
        height={size}
        onLoad={() => setExplicitStatus('ready')}
        onError={() => setExplicitStatus('error')}
        style={{ opacity: explicitStatus === 'ready' ? 1 : 0.85 }}
      />
    );
  }

  if (namedIcon) {
    return <AppIcon name={namedIcon} size={size} />;
  }

  if (autoUrl && autoStatus !== 'error') {
    return (
      <img
        src={autoUrl}
        alt=""
        width={size}
        height={size}
        onLoad={() => setAutoStatus('ready')}
        onError={() => setAutoStatus('error')}
        style={{ opacity: autoStatus === 'ready' ? 1 : 0.85 }}
      />
    );
  }

  return <AppIcon name="default" size={size} />;
}

function IconPicker({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const options = useMemo(() => {
    if (!query) {
      return appIconOptions.slice(0, 18);
    }
    const lowered = query.toLowerCase();
    return appIconOptions
      .filter((name) => name.includes(lowered))
      .slice(0, 18);
  }, [query]);

  const handleSelect = (name: string) => {
    setQuery(name);
    onChange(name);
    setOpen(false);
  };

  return (
    <div
      className="icon-picker"
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
    >
      <input
        type="text"
        value={query}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          onChange(next);
          setOpen(true);
        }}
        placeholder={placeholder}
      />
      {open && options.length > 0 ? (
        <div className="icon-options">
          {options.map((name) => (
            <button
              key={name}
              type="button"
              className="icon-option"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(name)}
            >
              <AppIcon name={name} size={18} />
              <span>{name}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  const [unlocked, setUnlocked] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [token, setToken] = useState<string | null>(null);
  const [config, setConfig] = useState<DashboardConfig>(defaultConfig);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<WeatherState>({
    icon: '⛅',
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
    location: '서울',
    minTemp: 18,
    maxTemp: 26,
    sunrise: '06:52',
    sunset: '19:38'
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [draftConfig, setDraftConfig] = useState<DashboardConfig | null>(null);
  const [draftCategories, setDraftCategories] = useState<Category[]>([]);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [saving, setSaving] = useState(false);
  const lockRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({ active: false, startY: 0, delta: 0 });
  const idleTimer = useRef<number | null>(null);

  const timeLabel = useMemo(() => formatTime(now), [now]);
  const dateLabel = useMemo(() => formatDate(now), [now]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!unlocked) {
      if (idleTimer.current) {
        window.clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }
      return;
    }

    const scheduleLock = () => {
      if (idleTimer.current) {
        window.clearTimeout(idleTimer.current);
      }
      idleTimer.current = window.setTimeout(
        () => setUnlocked(false),
        IDLE_LOCK_TIMEOUT_MS
      );
    };

    const handleActivity = () => scheduleLock();

    scheduleLock();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (idleTimer.current) {
        window.clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }
    };
  }, [unlocked]);

  useEffect(() => {
    const stored = window.localStorage.getItem('homedock_token');
    setToken(stored);
  }, []);

  useEffect(() => {
    if (token) {
      window.localStorage.setItem('homedock_token', token);
    } else {
      window.localStorage.removeItem('homedock_token');
    }
    void loadDashboard(token);
  }, [token]);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const response = await fetch(`${API_BASE}/weather`);
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as {
          location?: { name?: string };
          current?: {
            temperature?: number;
            feelsLike?: number;
            humidity?: number;
            precipitationProbability?: number;
            precipitation?: number;
            uvIndex?: number;
            windSpeed?: number;
            cloudCover?: number;
            pressure?: number;
            visibility?: number;
            windDirection?: number;
            windGust?: number;
            dewPoint?: number;
            rain?: number;
            snowfall?: number;
            summary?: string;
            icon?: string;
          };
          daily?: {
            minTemp?: number;
            maxTemp?: number;
            sunrise?: string;
            sunset?: string;
          };
        };

        if (!data.current) return;

        setWeather({
          icon: data.current.icon ?? '⛅',
          temperature: Number(data.current.temperature ?? 22),
          feelsLike: Number(data.current.feelsLike ?? 24),
          humidity: Number(data.current.humidity ?? 48),
          precipitationProbability: Number(
            data.current.precipitationProbability ?? 0
          ),
          precipitation: Number(data.current.precipitation ?? 0),
          uvIndex: Number(data.current.uvIndex ?? 5),
          windSpeed: Number(data.current.windSpeed ?? 3),
          cloudCover: Number(data.current.cloudCover ?? 35),
          pressure: Number(data.current.pressure ?? 1012),
          visibility: Number(data.current.visibility ?? 10),
          windDirection: Number(data.current.windDirection ?? 180),
          windGust: Number(data.current.windGust ?? 6),
          dewPoint: Number(data.current.dewPoint ?? 12),
          rain: Number(data.current.rain ?? 0),
          snowfall: Number(data.current.snowfall ?? 0),
          summary: data.current.summary ?? '맑음',
          location: data.location?.name ?? '서울',
          minTemp: Number(data.daily?.minTemp ?? 18),
          maxTemp: Number(data.daily?.maxTemp ?? 26),
          sunrise: data.daily?.sunrise ?? '06:52',
          sunset: data.daily?.sunset ?? '19:38'
        });
      } catch {
        return;
      }
    };

    void loadWeather();
  }, []);

  useEffect(() => {
    if (!settingsOpen || !draftConfig) return;
    if (draftConfig.weatherMode !== 'manual') {
      setLocationOptions([]);
      return;
    }

    const query = locationQuery.trim();
    if (!query) {
      setLocationOptions([]);
      return;
    }

    const handle = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_BASE}/weather/locations?query=${encodeURIComponent(query)}`
        );
        if (!response.ok) {
          setLocationOptions([]);
          return;
        }
        const data = (await response.json()) as LocationOption[];
        setLocationOptions(data);
      } catch {
        setLocationOptions([]);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [locationQuery, settingsOpen, draftConfig]);

  const loadDashboard = async (authToken?: string | null) => {
    try {
      const headers: Record<string, string> = {};
      const url = authToken ? `${API_BASE}/dashboard/admin` : `${API_BASE}/dashboard`;
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(url, { headers });
      if (response.status === 401) {
        setToken(null);
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to load dashboard');
      }

      const data = (await response.json()) as {
        config?: DashboardConfig;
        categories?: Category[];
      };

      const nextConfig = normalizeConfig(data.config ?? defaultConfig);
      setConfig(nextConfig);
      setCategories(data.categories?.length ? data.categories : fallbackCategories);
    } catch {
      setConfig(defaultConfig);
      setCategories(fallbackCategories);
    }
  };

  const loadAdminDashboard = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/admin`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.status === 401) {
        setToken(null);
        setLoginError('세션이 만료되었습니다. 다시 로그인하세요.');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to load admin data');
      }

      const data = (await response.json()) as {
        config?: DashboardConfig;
        categories?: Category[];
      };

      const nextConfig = normalizeConfig(data.config ?? config);
      setDraftConfig(nextConfig);
      setDraftCategories(data.categories ?? categories);
      setLocationQuery(nextConfig.weatherName ?? '');
      setLoginError(null);
    } catch {
      setDraftConfig(config);
      setDraftCategories(categories);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragState.current.active = true;
    dragState.current.startY = event.clientY;
    dragState.current.delta = 0;
    lockRef.current?.setPointerCapture(event.pointerId);
    if (lockRef.current) {
      lockRef.current.style.transition = 'none';
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active || !lockRef.current) return;
    const delta = dragState.current.startY - event.clientY;
    if (delta < 0) return;
    dragState.current.delta = delta;
    lockRef.current.style.transform = `translateY(-${delta}px)`;
  };

  const handlePointerUp = () => {
    if (!dragState.current.active || !lockRef.current) return;
    dragState.current.active = false;
    const { delta } = dragState.current;
    lockRef.current.style.transition = 'transform 0.5s ease';

    if (delta > 120) {
      setUnlocked(true);
      lockRef.current.style.transform = '';
      return;
    }

    lockRef.current.style.transform = 'translateY(0)';
  };

  const authStatusLabel = token ? '편집 로그인 유지 중' : '로그인 제외(메인 보기)';

  const tonedCategories = useMemo(() => withTones(categories), [categories]);

  const visibleCategories = useMemo(() => {
    const list = token
      ? tonedCategories
      : tonedCategories.map((category) => ({
          ...category,
          services: category.services.filter((service) => !service.requiresAuth)
        }));

    if (!query.trim()) {
      return list;
    }

    const search = query.toLowerCase();
    return list
      .map((category) => ({
        ...category,
        services: category.services.filter((service) =>
          [service.name, service.url, service.description]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(search)
        )
      }))
      .filter((category) => category.services.length > 0);
  }, [query, tonedCategories, token]);

  const favorites = useMemo(() => {
    const items = categories.flatMap((category) => category.services ?? []);
    return items
      .filter((service) => service.isFavorite)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, 3);
  }, [categories]);

  const systemSummaryOrder = useMemo(
    () =>
      normalizeOrder(
        config.systemSummaryOrder,
        defaultConfig.systemSummaryOrder,
        SYSTEM_SUMMARY_KEYS,
        SYSTEM_SUMMARY_MAX
      ),
    [config.systemSummaryOrder]
  );

  const weatherMetaOrder = useMemo(
    () =>
      normalizeOrder(
        config.weatherMetaOrder,
        defaultConfig.weatherMetaOrder,
        WEATHER_META_KEYS,
        WEATHER_META_MAX
      ),
    [config.weatherMetaOrder]
  );

  const systemSummaryValues = useMemo<Record<SystemSummaryKey, string>>(
    () => ({
      activeServices: `${categories.reduce(
        (sum, cat) => sum + (cat.services?.length ?? 0),
        0
      )}`,
      authStatus: authStatusLabel,
      lastSync: timeLabel,
      categoryCount: `${categories.length}`,
      favoriteCount: `${favorites.length}`
    }),
    [authStatusLabel, categories, favorites.length, timeLabel]
  );

  const weatherMetaValues = useMemo<Record<WeatherMetaKey, string>>(
    () => ({
      humidity: `${Math.round(weather.humidity)}%`,
      precipitationProbability: `${Math.round(
        weather.precipitationProbability
      )}%`,
      precipitation: `${weather.precipitation.toFixed(1)}mm`,
      uvIndex: `${Math.round(weather.uvIndex)}`,
      windSpeed: `${Math.round(weather.windSpeed)}m/s`,
      cloudCover: `${Math.round(weather.cloudCover)}%`,
      pressure: `${Math.round(weather.pressure)}hPa`,
      visibility: `${weather.visibility.toFixed(1)}km`,
      windDirection: `${Math.round(weather.windDirection)}°`,
      windGust: `${Math.round(weather.windGust)}m/s`,
      dewPoint: `${Math.round(weather.dewPoint)}°C`,
      rain: `${weather.rain.toFixed(1)}mm`,
      snowfall: `${weather.snowfall.toFixed(1)}cm`
    }),
    [weather]
  );

  const openSettings = () => {
    setSettingsOpen(true);
    if (token) {
      void loadAdminDashboard(token);
    } else {
      setDraftConfig(null);
      setDraftCategories([]);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      if (!response.ok) {
        setLoginError('이메일 또는 비밀번호를 확인해 주세요.');
        return;
      }

      const data = (await response.json()) as {
        accessToken?: string;
      };

      if (!data.accessToken) {
        setLoginError('로그인 토큰을 받지 못했습니다.');
        return;
      }

      setToken(data.accessToken);
      await loadAdminDashboard(data.accessToken);
    } catch {
      setLoginError('로그인 중 오류가 발생했습니다.');
    }
  };

  const updateCategory = (categoryId: string, patch: Partial<Category>) => {
    setDraftCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId ? { ...category, ...patch } : category
      )
    );
  };

  const updateService = (
    categoryId: string,
    serviceId: string,
    patch: Partial<Service>
  ) => {
    setDraftCategories((prev) =>
      prev.map((category) => {
        if (category.id !== categoryId) return category;
        return {
          ...category,
          services: (category.services ?? []).map((service) =>
            service.id === serviceId ? { ...service, ...patch } : service
          )
        };
      })
    );
  };

  const addCategory = () => {
    const next: Category = {
      id: createId(),
      name: '새 카테고리',
      color: categoryTones[0].accent,
      sortOrder: draftCategories.length,
      services: []
    };
    setDraftCategories((prev) => [...prev, next]);
  };

  const removeCategory = (categoryId: string) => {
    setDraftCategories((prev) =>
      prev.filter((category) => category.id !== categoryId)
    );
  };

  const moveCategory = (index: number, direction: number) => {
    setDraftCategories((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const addService = (categoryId: string) => {
    const nextService: Service = {
      id: createId(),
      name: '새 서비스',
      url: 'http://',
      description: '',
      icon: '',
      target: '_blank',
      requiresAuth: false,
      isFavorite: false
    };

    setDraftCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              services: [...(category.services ?? []), nextService]
            }
          : category
      )
    );
  };

  const removeService = (categoryId: string, serviceId: string) => {
    setDraftCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              services: (category.services ?? []).filter(
                (service) => service.id !== serviceId
              )
            }
          : category
      )
    );
  };

  const moveService = (
    categoryId: string,
    serviceIndex: number,
    direction: number
  ) => {
    setDraftCategories((prev) =>
      prev.map((category) => {
        if (category.id !== categoryId) return category;
        const services = [...(category.services ?? [])];
        const target = serviceIndex + direction;
        if (target < 0 || target >= services.length) return category;
        const [item] = services.splice(serviceIndex, 1);
        services.splice(target, 0, item);
        return { ...category, services };
      })
    );
  };

  const updateSystemSummaryOrder = (updater: (order: string[]) => string[]) => {
    setDraftConfig((prev) => {
      if (!prev) return prev;
      const current = Array.isArray(prev.systemSummaryOrder)
        ? prev.systemSummaryOrder
        : [...defaultConfig.systemSummaryOrder];
      return { ...prev, systemSummaryOrder: updater([...current]) };
    });
  };

  const updateWeatherMetaOrder = (updater: (order: string[]) => string[]) => {
    setDraftConfig((prev) => {
      if (!prev) return prev;
      const current = Array.isArray(prev.weatherMetaOrder)
        ? prev.weatherMetaOrder
        : [...defaultConfig.weatherMetaOrder];
      return { ...prev, weatherMetaOrder: updater([...current]) };
    });
  };

  const addSystemSummaryKey = (key: SystemSummaryKey) => {
    updateSystemSummaryOrder((order) => {
      if (order.includes(key) || order.length >= SYSTEM_SUMMARY_MAX) {
        return order;
      }
      return [...order, key];
    });
  };

  const removeSystemSummaryKey = (key: SystemSummaryKey) => {
    updateSystemSummaryOrder((order) => order.filter((item) => item !== key));
  };

  const moveSystemSummaryKey = (index: number, direction: number) => {
    updateSystemSummaryOrder((order) => {
      const target = index + direction;
      if (target < 0 || target >= order.length) return order;
      const next = [...order];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const addWeatherMetaKey = (key: WeatherMetaKey) => {
    updateWeatherMetaOrder((order) => {
      if (order.includes(key) || order.length >= WEATHER_META_MAX) {
        return order;
      }
      return [...order, key];
    });
  };

  const removeWeatherMetaKey = (key: WeatherMetaKey) => {
    updateWeatherMetaOrder((order) => order.filter((item) => item !== key));
  };

  const moveWeatherMetaKey = (index: number, direction: number) => {
    updateWeatherMetaOrder((order) => {
      const target = index + direction;
      if (target < 0 || target >= order.length) return order;
      const next = [...order];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const selectLocation = (option: LocationOption) => {
    setDraftConfig((prev) =>
      prev
        ? {
            ...prev,
            weatherMode: 'manual',
            weatherName: option.name,
            weatherRegion: option.region ?? null,
            weatherCountry: option.country ?? null,
            weatherLatitude: option.latitude,
            weatherLongitude: option.longitude
          }
        : prev
    );
    setLocationQuery(option.name);
    setLocationOptions([]);
  };

  const handleSave = async () => {
    if (!token || !draftConfig) return;
    setSaving(true);

    const normalizedCategories = draftCategories.map((category, index) => ({
      ...category,
      sortOrder: index,
      services: (category.services ?? []).map((service, serviceIndex) => ({
        ...service,
        sortOrder: serviceIndex
      }))
    }));

    try {
      const response = await fetch(`${API_BASE}/dashboard/admin`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          config: {
            brandName: draftConfig.brandName,
            title: draftConfig.title,
            description: draftConfig.description,
            weatherMode: draftConfig.weatherMode,
            weatherName: draftConfig.weatherName,
            weatherRegion: draftConfig.weatherRegion,
            weatherCountry: draftConfig.weatherCountry,
            weatherLatitude: draftConfig.weatherLatitude,
            weatherLongitude: draftConfig.weatherLongitude,
            systemSummaryOrder: draftConfig.systemSummaryOrder,
            weatherMetaOrder: draftConfig.weatherMetaOrder
          },
          categories: normalizedCategories
        })
      });

      if (!response.ok) {
        throw new Error('save failed');
      }

      const data = (await response.json()) as {
        config?: DashboardConfig;
        categories?: Category[];
      };

      setConfig(data.config ?? draftConfig);
      setCategories(data.categories ?? normalizedCategories);
      setSettingsOpen(false);
    } catch {
      setLoginError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const draftSystemSummaryOrder = Array.isArray(
    draftConfig?.systemSummaryOrder
  )
    ? (draftConfig?.systemSummaryOrder as string[])
    : [...defaultConfig.systemSummaryOrder];
  const draftWeatherMetaOrder = Array.isArray(draftConfig?.weatherMetaOrder)
    ? (draftConfig?.weatherMetaOrder as string[])
    : [...defaultConfig.weatherMetaOrder];

  const selectedSystemSummary = draftSystemSummaryOrder.filter((key) =>
    SYSTEM_SUMMARY_KEYS.includes(key as SystemSummaryKey)
  ) as SystemSummaryKey[];
  const availableSystemSummary = SYSTEM_SUMMARY_OPTIONS.filter(
    (option) => !selectedSystemSummary.includes(option.key)
  );

  const selectedWeatherMeta = draftWeatherMetaOrder.filter((key) =>
    WEATHER_META_KEYS.includes(key as WeatherMetaKey)
  ) as WeatherMetaKey[];
  const availableWeatherMeta = WEATHER_META_OPTIONS.filter(
    (option) => !selectedWeatherMeta.includes(option.key)
  );

  return (
    <div className="screen">
      <div
        ref={lockRef}
        className={`lock-screen ${unlocked ? 'unlocked' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="status-bar">
          <div className="status-left">
            {token ? '로그인 유지 중' : '비로그인'}
          </div>
          <div className="status-right" />
        </div>
        <div className="lock-content">
          <div className="lock-time">{timeLabel}</div>
          <div className="lock-date">{dateLabel}</div>
        </div>
        <div className="swipe-indicator">
          <span>↑</span> 위로 밀어 잠금 해제
        </div>
      </div>

      <main className={`home-screen ${unlocked ? 'visible' : ''}`}>
        <div className="container">
          <div className="status-bar">
            <div className="status-left">{timeLabel}</div>
            <div className="status-right">
              <span className="pill">{config.brandName}</span>
            </div>
          </div>

          <section className="hero">
            <h1>{config.title}</h1>
            <p>{config.description}</p>
          </section>

          <section className="overview-grid">
            <div className="glass-card">
              <h3>시스템 요약</h3>
              {systemSummaryOrder.map((key) => {
                const label =
                  SYSTEM_SUMMARY_OPTIONS.find((option) => option.key === key)
                    ?.label ?? key;
                const value =
                  systemSummaryValues[key as SystemSummaryKey] ?? '-';
                return (
                  <div key={key} className="metric-row">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                );
              })}
            </div>
            <div className="glass-card weather-card">
              <h3>오늘의 날씨</h3>
              <div className="weather-header">
                <div className="weather-icon">{weather.icon}</div>
                <div>
                  <div className="weather-temp">
                    {Math.round(weather.temperature)}°C
                  </div>
                  <div className="weather-summary">
                    {weather.summary} · {weather.location}
                  </div>
                  <div className="weather-range">
                    <span>최저 {Math.round(weather.minTemp)}°</span>
                    <span>최고 {Math.round(weather.maxTemp)}°</span>
                    <span className="weather-feels">
                      체감 {Math.round(weather.feelsLike)}°C
                    </span>
                  </div>
                  <div className="weather-sun">
                    <span>일출 {weather.sunrise}</span>
                    <span>일몰 {weather.sunset}</span>
                  </div>
                </div>
              </div>
              <div className="weather-meta">
                {weatherMetaOrder.map((key) => {
                  const label =
                    WEATHER_META_OPTIONS.find((option) => option.key === key)
                      ?.label ?? key;
                  const value =
                    weatherMetaValues[key as WeatherMetaKey] ?? '-';
                  return (
                    <span key={key}>
                      {label} {value}
                    </span>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="glass-card search-panel">
            <div>
              <h3>빠른 검색</h3>
            </div>
            <input
              className="search-input compact"
              placeholder="서비스 검색..."
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </section>

          <section className="category-grid">
            {visibleCategories.map((category) => (
              <div
                key={category.id}
                className="category-card"
                style={
                  {
                    '--category-accent': category.tone.accent
                  } as CSSProperties
                }
              >
                <div className="category-header">
                  <div className="category-title">
                    <span className="category-dot" />
                    <span>{category.name}</span>
                  </div>
                  <div className="category-meta">
                    {category.services.length}개 서비스
                  </div>
                </div>
                <div className="service-grid">
                  {category.services.map((service, index) => (
                    <a
                      key={service.id}
                      className="service-card"
                      href={service.url}
                      target={service.target === '_self' ? '_self' : '_blank'}
                      rel={service.target === '_self' ? undefined : 'noreferrer'}
                      style={{
                        animationDelay: `${index * 0.08}s`
                      }}
                    >
                      <div className="service-icon">
                        <ServiceIcon service={service} size={28} />
                      </div>
                      <div className="service-name">{service.name}</div>
                      <div className="service-url">{service.url}</div>
                      {service.description ? (
                        <div className="service-desc">{service.description}</div>
                      ) : null}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>

        <div className="dock">
          {favorites.map((service) => (
            <a
              key={service.id}
              className="dock-item"
              href={service.url}
              target={service.target === '_self' ? '_self' : '_blank'}
              rel={service.target === '_self' ? undefined : 'noreferrer'}
            >
              <ServiceIcon service={service} size={22} />
            </a>
          ))}
          <button type="button" className="dock-item" onClick={openSettings}>
            <AppIcon name="settings" size={22} />
          </button>
        </div>
      </main>

      {settingsOpen ? (
        <div className="settings-panel" role="dialog" aria-modal="true">
          <div className="settings-card">
            <div className="settings-header">
              <div>
                <div className="settings-kicker">Dashboard Settings</div>
                <h2>대시보드 구성 변경</h2>
                <p className="helper-text">
                  메인 페이지는 로그인 없이 공개되고, 구성 변경은 로그인 후
                  가능합니다.
                </p>
              </div>
              <button
                type="button"
                className="button secondary"
                onClick={() => setSettingsOpen(false)}
              >
                닫기
              </button>
            </div>

            {!token ? (
              <form className="settings-auth" onSubmit={handleLogin}>
                <div className="auth-field">
                  <label>관리자 이메일</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    placeholder="admin@homedock.local"
                    required
                  />
                </div>
                <div className="auth-field">
                  <label>관리자 비밀번호</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                {loginError ? (
                  <div className="settings-error">{loginError}</div>
                ) : null}
                <div className="auth-actions">
                  <button className="button" type="submit">
                    로그인 후 편집
                  </button>
                </div>
              </form>
            ) : draftConfig ? (
              <>
                <div className="settings-body">
                <section className="settings-section">
                  <h3>메인 정보</h3>
                  <div className="settings-grid">
                    <div className="auth-field">
                      <label>헤더 브랜드</label>
                      <input
                        type="text"
                        value={draftConfig.brandName}
                        onChange={(event) =>
                          setDraftConfig((prev) =>
                            prev
                              ? { ...prev, brandName: event.target.value }
                              : prev
                          )
                        }
                      />
                    </div>
                    <div className="auth-field">
                      <label>대시보드 타이틀</label>
                      <input
                        type="text"
                        value={draftConfig.title}
                        onChange={(event) =>
                          setDraftConfig((prev) =>
                            prev
                              ? { ...prev, title: event.target.value }
                              : prev
                          )
                        }
                      />
                    </div>
                    <div className="auth-field">
                      <label>한 줄 설명</label>
                      <input
                        type="text"
                        value={draftConfig.description}
                        onChange={(event) =>
                          setDraftConfig((prev) =>
                            prev
                              ? { ...prev, description: event.target.value }
                              : prev
                          )
                        }
                      />
                    </div>
                  </div>
                </section>

                <section className="settings-section">
                  <div className="section-header">
                    <h3>시스템 요약 카드</h3>
                    <span className="helper-text">
                      최대 {SYSTEM_SUMMARY_MAX}개 선택
                    </span>
                  </div>
                  <div className="option-list">
                    {selectedSystemSummary.length === 0 ? (
                      <div className="option-empty">
                        표시할 항목을 추가해 주세요.
                      </div>
                    ) : (
                      selectedSystemSummary.map((key, index) => {
                        const option = SYSTEM_SUMMARY_OPTIONS.find(
                          (item) => item.key === key
                        );
                        return (
                          <div key={key} className="option-row">
                            <span className="option-title">
                              {option?.label ?? key}
                            </span>
                            <div className="option-actions">
                              <button
                                type="button"
                                onClick={() => moveSystemSummaryKey(index, -1)}
                                disabled={index === 0}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() => moveSystemSummaryKey(index, 1)}
                                disabled={index === selectedSystemSummary.length - 1}
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                className="danger"
                                onClick={() => removeSystemSummaryKey(key)}
                              >
                                제거
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="option-add-grid">
                    {availableSystemSummary.map((option) => {
                      const disabled =
                        selectedSystemSummary.length >= SYSTEM_SUMMARY_MAX;
                      return (
                        <button
                          key={option.key}
                          type="button"
                          className={`option-add ${disabled ? 'disabled' : ''}`}
                          onClick={() => addSystemSummaryKey(option.key)}
                          disabled={disabled}
                        >
                          + {option.label}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="settings-section">
                  <h3>날씨 위치</h3>
                  <div className="settings-row">
                    <label className="radio-pill">
                      <input
                        type="radio"
                        checked={draftConfig.weatherMode === 'auto'}
                        onChange={() =>
                          setDraftConfig((prev) =>
                            prev ? { ...prev, weatherMode: 'auto' } : prev
                          )
                        }
                      />
                      IP 기반 자동
                    </label>
                    <label className="radio-pill">
                      <input
                        type="radio"
                        checked={draftConfig.weatherMode === 'manual'}
                        onChange={() =>
                          setDraftConfig((prev) =>
                            prev ? { ...prev, weatherMode: 'manual' } : prev
                          )
                        }
                      />
                      직접 위치 지정
                    </label>
                  </div>
                  {draftConfig.weatherMode === 'manual' ? (
                    <div className="location-picker">
                      <input
                        type="text"
                        value={locationQuery}
                        onChange={(event) =>
                          setLocationQuery(event.target.value)
                        }
                        placeholder="도시 이름 검색 (예: Seoul, 부산)"
                      />
                      {locationOptions.length > 0 ? (
                        <div className="location-list">
                          {locationOptions.map((option) => (
                            <button
                              key={`${option.name}-${option.latitude}-${option.longitude}`}
                              type="button"
                              onClick={() => selectLocation(option)}
                            >
                              <span>{option.name}</span>
                              <span className="helper-text">
                                {option.region ?? ''}
                                {option.country ? ` · ${option.country}` : ''}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="helper-text">
                      첫 로딩 시 IP 기준으로 자동 설정됩니다.
                    </p>
                  )}
                </section>

                <section className="settings-section">
                  <div className="section-header">
                    <h3>날씨 하단 정보</h3>
                    <span className="helper-text">
                      최대 {WEATHER_META_MAX}개 선택
                    </span>
                  </div>
                  <div className="option-list">
                    {selectedWeatherMeta.length === 0 ? (
                      <div className="option-empty">
                        표시할 항목을 추가해 주세요.
                      </div>
                    ) : (
                      selectedWeatherMeta.map((key, index) => {
                        const option = WEATHER_META_OPTIONS.find(
                          (item) => item.key === key
                        );
                        return (
                          <div key={key} className="option-row">
                            <span className="option-title">
                              {option?.label ?? key}
                            </span>
                            <div className="option-actions">
                              <button
                                type="button"
                                onClick={() => moveWeatherMetaKey(index, -1)}
                                disabled={index === 0}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() => moveWeatherMetaKey(index, 1)}
                                disabled={index === selectedWeatherMeta.length - 1}
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                className="danger"
                                onClick={() => removeWeatherMetaKey(key)}
                              >
                                제거
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="option-add-grid">
                    {availableWeatherMeta.map((option) => {
                      const disabled =
                        selectedWeatherMeta.length >= WEATHER_META_MAX;
                      return (
                        <button
                          key={option.key}
                          type="button"
                          className={`option-add ${disabled ? 'disabled' : ''}`}
                          onClick={() => addWeatherMetaKey(option.key)}
                          disabled={disabled}
                        >
                          + {option.label}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="settings-section">
                  <div className="section-header">
                    <h3>카테고리 & 아이템</h3>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={addCategory}
                    >
                      + 카테고리 추가
                    </button>
                  </div>

                  <div className="category-editor-list">
                    {draftCategories.map((category, categoryIndex) => (
                      <div key={category.id} className="category-editor">
                        <div className="category-editor-head">
                          <input
                            type="text"
                            value={category.name}
                            onChange={(event) =>
                              updateCategory(category.id, {
                                name: event.target.value
                              })
                            }
                          />
                          <input
                            type="color"
                            value={category.color ?? '#7ef5d2'}
                            onChange={(event) =>
                              updateCategory(category.id, {
                                color: event.target.value
                              })
                            }
                          />
                          <div className="editor-actions">
                            <button
                              type="button"
                              onClick={() => moveCategory(categoryIndex, -1)}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveCategory(categoryIndex, 1)}
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => removeCategory(category.id)}
                            >
                              삭제
                            </button>
                          </div>
                        </div>

                        <div className="service-editor-list">
                          {(category.services ?? []).map((service, serviceIndex) => {
                            const { protocol, rest } = splitUrl(service.url ?? '');

                            return (
                              <div key={service.id} className="service-editor">
                                <div className="service-editor-head">
                                  <div className="service-preview">
                                    <ServiceIcon service={service} size={22} />
                                  </div>
                                  <input
                                    type="text"
                                    value={service.name}
                                    onChange={(event) =>
                                      updateService(category.id, service.id, {
                                        name: event.target.value
                                      })
                                    }
                                  />
                                  <div className="editor-actions">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        moveService(category.id, serviceIndex, -1)
                                      }
                                    >
                                      ↑
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        moveService(category.id, serviceIndex, 1)
                                      }
                                    >
                                      ↓
                                    </button>
                                    <button
                                      type="button"
                                      className="danger"
                                      onClick={() =>
                                        removeService(category.id, service.id)
                                      }
                                    >
                                      삭제
                                    </button>
                                  </div>
                                </div>

                                <div className="service-editor-hint">
                                  아이콘 URL → 아이콘 이름 → 사이트 아이콘 순으로
                                  적용됩니다. 사이트 아이콘은 입력한 URL의
                                  `/favicon.ico`를 자동으로 불러오며, 제공되지 않으면
                                  기본 아이콘으로 대체됩니다.
                                </div>
                                <div className="service-editor-grid">
                                  <div className="field">
                                    <label>아이콘 이름</label>
                                    <IconPicker
                                      value={service.icon ?? ''}
                                      onChange={(value) =>
                                        updateService(category.id, service.id, {
                                          icon: value
                                        })
                                      }
                                      placeholder="예: tv, cloud, database"
                                    />
                                  </div>
                                  <div className="field">
                                    <label>아이콘 URL (선택)</label>
                                    <input
                                      type="text"
                                      value={service.iconUrl ?? ''}
                                      onChange={(event) =>
                                        updateService(category.id, service.id, {
                                          iconUrl: event.target.value
                                        })
                                      }
                                      placeholder="https://.../icon.png"
                                    />
                                  </div>
                                  <div className="field url-field">
                                    <label>서비스 URL</label>
                                    <div className="url-input">
                                      <select
                                        value={protocol}
                                        onChange={(event) =>
                                          updateService(category.id, service.id, {
                                            url: buildUrl(event.target.value, rest)
                                          })
                                        }
                                      >
                                        <option value="http">http://</option>
                                        <option value="https">https://</option>
                                      </select>
                                      <input
                                        type="text"
                                        value={rest}
                                        onChange={(event) =>
                                          updateService(category.id, service.id, {
                                            url: buildUrl(protocol, event.target.value)
                                          })
                                        }
                                        placeholder="host:port/path"
                                      />
                                    </div>
                                  </div>
                                  <div className="field">
                                    <label>설명</label>
                                    <input
                                      type="text"
                                      value={service.description ?? ''}
                                      onChange={(event) =>
                                        updateService(category.id, service.id, {
                                          description: event.target.value
                                        })
                                      }
                                      placeholder="서비스 요약"
                                    />
                                  </div>
                                </div>

                                <div className="service-editor-options">
                                  <label className="checkbox-pill">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(service.isFavorite)}
                                      onChange={(event) =>
                                        updateService(category.id, service.id, {
                                          isFavorite: event.target.checked
                                        })
                                      }
                                    />
                                    즐겨찾기 (Dock)
                                  </label>
                                  <label className="checkbox-pill">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(service.requiresAuth)}
                                      onChange={(event) =>
                                        updateService(category.id, service.id, {
                                          requiresAuth: event.target.checked
                                        })
                                      }
                                    />
                                    로그인 필요
                                  </label>
                                  <div className="field inline">
                                    <label>열기 방식</label>
                                    <select
                                      value={service.target ?? '_blank'}
                                      onChange={(event) =>
                                        updateService(category.id, service.id, {
                                          target: event.target.value
                                        })
                                      }
                                    >
                                      <option value="_self">현재 탭</option>
                                      <option value="_blank">새 탭</option>
                                      <option value="window">새 창</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <button
                            type="button"
                            className="button ghost"
                            onClick={() => addService(category.id)}
                          >
                            + 아이템 추가
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                </div>
                <div className="settings-footer">
                  {loginError ? (
                    <div className="settings-error">{loginError}</div>
                  ) : null}
                  <div className="settings-actions">
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => setToken(null)}
                    >
                      로그아웃
                    </button>
                    <button
                      type="button"
                      className="button"
                      disabled={saving}
                      onClick={handleSave}
                    >
                      {saving ? '저장 중...' : '변경사항 저장'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="settings-loading">설정을 불러오는 중...</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
