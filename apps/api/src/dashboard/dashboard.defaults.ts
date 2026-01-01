export const DEFAULT_DASHBOARD_CONFIG = {
  brandName: 'HomeDock',
  title: 'HomeDock 메인 대시보드',
  description:
    '홈서버에 숨겨진 모든 서비스를 하나의 런처로 정리하세요. 카테고리별 정렬, 포트/도메인 빠른 확인, 바로 실행까지 한 번에.',
  weatherMode: 'auto' as const,
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

type DefaultService = {
  name: string;
  url: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  status?: string;
  target?: string;
  requiresAuth?: boolean;
  isFavorite?: boolean;
  sortOrder: number;
};

type DefaultCategory = {
  name: string;
  color: string;
  sortOrder: number;
  description?: string;
  icon?: string;
  services: DefaultService[];
};

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    name: '미디어 존',
    color: '#7ef5d2',
    sortOrder: 0,
    services: [
      {
        name: 'Plex',
        url: 'http://192.168.1.2:32400',
        description: '라이브러리 스트리밍 허브',
        icon: 'tv',
        target: '_blank',
        isFavorite: true,
        sortOrder: 0
      },
      {
        name: 'Jellyfin',
        url: 'http://192.168.1.2:8096',
        description: '자가 호스팅 미디어 센터',
        icon: 'play',
        target: '_blank',
        sortOrder: 1
      },
      {
        name: 'Emby',
        url: 'http://192.168.1.2:8097',
        description: '멀티미디어 관리 허브',
        icon: 'film',
        target: '_blank',
        sortOrder: 2
      },
      {
        name: 'Navidrome',
        url: 'http://192.168.1.2:4533',
        description: '음악 스트리밍',
        icon: 'music',
        target: '_blank',
        sortOrder: 3
      },
      {
        name: 'PhotoPrism',
        url: 'https://photos.homedock.local',
        description: '사진 아카이브',
        icon: 'camera',
        target: '_blank',
        sortOrder: 4
      }
    ]
  },
  {
    name: '인프라 컨트롤',
    color: '#ffb86b',
    sortOrder: 1,
    services: [
      {
        name: 'Portainer',
        url: 'https://portainer.homedock.local',
        description: '도커 스택 관리',
        icon: 'containers',
        target: '_blank',
        isFavorite: true,
        sortOrder: 0
      },
      {
        name: 'Grafana',
        url: 'https://grafana.homedock.local',
        description: '메트릭과 대시보드',
        icon: 'chart',
        target: '_blank',
        sortOrder: 1
      },
      {
        name: 'Prometheus',
        url: 'http://192.168.1.2:9090',
        description: '메트릭 수집',
        icon: 'activity',
        target: '_blank',
        sortOrder: 2
      },
      {
        name: 'Traefik',
        url: 'https://traefik.homedock.local',
        description: '리버스 프록시 라우팅',
        icon: 'compass',
        target: '_blank',
        sortOrder: 3
      },
      {
        name: 'Netdata',
        url: 'http://192.168.1.2:19999',
        description: '실시간 시스템 모니터링',
        icon: 'monitor',
        target: '_blank',
        sortOrder: 4
      }
    ]
  },
  {
    name: '스토리지 볼트',
    color: '#8ab6ff',
    sortOrder: 2,
    services: [
      {
        name: 'Syncthing',
        url: 'http://192.168.1.2:8384',
        description: '파일 동기화 허브',
        icon: 'sync',
        target: '_blank',
        sortOrder: 0
      },
      {
        name: 'MinIO',
        url: 'https://minio.homedock.local',
        description: 'S3 호환 오브젝트 스토리지',
        icon: 'database',
        target: '_blank',
        sortOrder: 1
      },
      {
        name: 'Nextcloud',
        url: 'https://cloud.homedock.local',
        description: '개인 클라우드',
        icon: 'cloud',
        target: '_blank',
        sortOrder: 2
      },
      {
        name: 'File Browser',
        url: 'http://192.168.1.2:8088',
        description: '웹 파일 관리자',
        icon: 'folder',
        target: '_blank',
        isFavorite: true,
        sortOrder: 3
      },
      {
        name: 'Paperless',
        url: 'https://docs.homedock.local',
        description: '문서 아카이빙',
        icon: 'docs',
        target: '_blank',
        sortOrder: 4
      }
    ]
  },
  {
    name: '툴박스',
    color: '#ff8bcf',
    sortOrder: 3,
    services: [
      {
        name: 'n8n',
        url: 'https://automate.homedock.local',
        description: '워크플로 자동화',
        icon: 'workflow',
        target: '_blank',
        sortOrder: 0
      },
      {
        name: 'Uptime Kuma',
        url: 'http://192.168.1.2:3001',
        description: '서비스 상태 모니터',
        icon: 'heartbeat',
        target: '_blank',
        sortOrder: 1
      },
      {
        name: 'Gitea',
        url: 'https://git.homedock.local',
        description: '경량 Git 서버',
        icon: 'git',
        target: '_blank',
        sortOrder: 2
      },
      {
        name: 'Vaultwarden',
        url: 'https://vault.homedock.local',
        description: '패스워드 금고',
        icon: 'shield',
        target: '_blank',
        sortOrder: 3
      },
      {
        name: 'Homepage',
        url: 'http://192.168.1.2:3000',
        description: '홈서버 런처 대안',
        icon: 'home',
        target: '_blank',
        sortOrder: 4
      }
    ]
  }
];
