'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, PointerEvent } from 'react';
import { CategoryGrid } from './components/CategoryGrid';
import { Dock } from './components/Dock';
import { LockScreen } from './components/LockScreen';
import { OverviewGrid } from './components/OverviewGrid';
import { SettingsModal } from './components/SettingsModal';
import { createId, formatDate, formatTime } from './lib/dashboard-utils';
import { CATEGORY_TONES, withTones } from './lib/category-utils';
import type { Category, DashboardConfig, Service } from '@homedock/types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api';


const defaultConfig = {
  id: 'default',
  brandName: 'HomeDock',
  language: 'ko',
  serviceGridColumnsLg: 4,
  showBrand: true,
  showTitle: true,
  showDescription: true,
  dockSeparatorEnabled: true,
  themeKey: 'homedock',
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
} satisfies DashboardConfig;

const SYSTEM_SUMMARY_MAX = 4;
const WEATHER_META_MAX = 5;

const GRID_COLUMN_OPTIONS = [4, 5, 6] as const;
const LANGUAGE_OPTIONS = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' }
] as const;

type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['code'];

const LOCALE_BY_LANGUAGE: Record<LanguageCode, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN'
};

const THEME_OPTIONS = [
  {
    key: 'homedock',
    name: 'HomeDock',
    colors: {
      bgDeep: '#0b1020',
      bgMid: '#111a33',
      bgSoft: '#182746',
      accent: '#7ef5d2',
      accent2: '#ffb86b',
      textPrimary: '#f6f7fb',
      textMuted: 'rgba(255, 255, 255, 0.62)',
      glass: 'rgba(255, 255, 255, 0.08)',
      glassStrong: 'rgba(255, 255, 255, 0.14)',
      stroke: 'rgba(255, 255, 255, 0.15)',
      shadow: '0 20px 60px rgba(4, 8, 24, 0.45)'
    }
  },
  {
    key: 'nord',
    name: 'Nord',
    colors: {
      bgDeep: '#2e3440',
      bgMid: '#3b4252',
      bgSoft: '#434c5e',
      accent: '#88c0d0',
      accent2: '#a3be8c',
      textPrimary: '#eceff4',
      textMuted: 'rgba(236, 239, 244, 0.7)',
      glass: 'rgba(236, 239, 244, 0.08)',
      glassStrong: 'rgba(236, 239, 244, 0.16)',
      stroke: 'rgba(236, 239, 244, 0.12)',
      shadow: '0 20px 60px rgba(14, 18, 32, 0.45)'
    }
  },
  {
    key: 'solarized',
    name: 'Solarized',
    colors: {
      bgDeep: '#002b36',
      bgMid: '#073642',
      bgSoft: '#0f3d4a',
      accent: '#2aa198',
      accent2: '#b58900',
      textPrimary: '#fdf6e3',
      textMuted: 'rgba(253, 246, 227, 0.68)',
      glass: 'rgba(253, 246, 227, 0.08)',
      glassStrong: 'rgba(253, 246, 227, 0.16)',
      stroke: 'rgba(253, 246, 227, 0.12)',
      shadow: '0 20px 60px rgba(0, 14, 18, 0.45)'
    }
  },
  {
    key: 'gruvbox',
    name: 'Gruvbox',
    colors: {
      bgDeep: '#1d2021',
      bgMid: '#282828',
      bgSoft: '#32302f',
      accent: '#fabd2f',
      accent2: '#b8bb26',
      textPrimary: '#fbf1c7',
      textMuted: 'rgba(251, 241, 199, 0.65)',
      glass: 'rgba(251, 241, 199, 0.08)',
      glassStrong: 'rgba(251, 241, 199, 0.16)',
      stroke: 'rgba(251, 241, 199, 0.12)',
      shadow: '0 20px 60px rgba(8, 8, 8, 0.45)'
    }
  },
  {
    key: 'tokyo-night',
    name: 'Tokyo Night',
    colors: {
      bgDeep: '#1a1b26',
      bgMid: '#24283b',
      bgSoft: '#2a2e4a',
      accent: '#7aa2f7',
      accent2: '#e0af68',
      textPrimary: '#c0caf5',
      textMuted: 'rgba(192, 202, 245, 0.65)',
      glass: 'rgba(192, 202, 245, 0.08)',
      glassStrong: 'rgba(192, 202, 245, 0.16)',
      stroke: 'rgba(192, 202, 245, 0.12)',
      shadow: '0 20px 60px rgba(7, 9, 24, 0.45)'
    }
  },
  {
    key: 'everforest',
    name: 'Everforest',
    colors: {
      bgDeep: '#2b3339',
      bgMid: '#323c41',
      bgSoft: '#3a454a',
      accent: '#a7c080',
      accent2: '#e69875',
      textPrimary: '#d3c6aa',
      textMuted: 'rgba(211, 198, 170, 0.65)',
      glass: 'rgba(211, 198, 170, 0.08)',
      glassStrong: 'rgba(211, 198, 170, 0.16)',
      stroke: 'rgba(211, 198, 170, 0.12)',
      shadow: '0 20px 60px rgba(12, 16, 18, 0.45)'
    }
  },
  {
    key: 'oceanic',
    name: 'Oceanic',
    colors: {
      bgDeep: '#0b1f2a',
      bgMid: '#11283a',
      bgSoft: '#15344a',
      accent: '#5fb3b3',
      accent2: '#f99157',
      textPrimary: '#d8dee9',
      textMuted: 'rgba(216, 222, 233, 0.65)',
      glass: 'rgba(216, 222, 233, 0.08)',
      glassStrong: 'rgba(216, 222, 233, 0.16)',
      stroke: 'rgba(216, 222, 233, 0.12)',
      shadow: '0 20px 60px rgba(5, 10, 20, 0.45)'
    }
  },
  {
    key: 'sunset',
    name: 'Sunset',
    colors: {
      bgDeep: '#1a1424',
      bgMid: '#251a36',
      bgSoft: '#2e2046',
      accent: '#ff9f7f',
      accent2: '#ffd166',
      textPrimary: '#f7e9d7',
      textMuted: 'rgba(247, 233, 215, 0.65)',
      glass: 'rgba(247, 233, 215, 0.08)',
      glassStrong: 'rgba(247, 233, 215, 0.16)',
      stroke: 'rgba(247, 233, 215, 0.12)',
      shadow: '0 20px 60px rgba(10, 6, 18, 0.45)'
    }
  },
  {
    key: 'graphite',
    name: 'Graphite',
    colors: {
      bgDeep: '#121212',
      bgMid: '#1a1a1a',
      bgSoft: '#242424',
      accent: '#8fbcbb',
      accent2: '#b0b0b0',
      textPrimary: '#e6e6e6',
      textMuted: 'rgba(230, 230, 230, 0.6)',
      glass: 'rgba(230, 230, 230, 0.08)',
      glassStrong: 'rgba(230, 230, 230, 0.16)',
      stroke: 'rgba(230, 230, 230, 0.12)',
      shadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    }
  }
] as const;

const THEME_KEYS: string[] = THEME_OPTIONS.map((theme) => theme.key);

const TRANSLATIONS = {
  ko: {
    lockSwipe: '위로 밀어 잠금 해제',
    loginActive: '로그인 유지 중',
    loginInactive: '비로그인',
    settingsKicker: 'Dashboard Settings',
    settingsTitle: '대시보드 구성 변경',
    settingsSubtitle:
      '메인 페이지는 로그인 없이 공개되고, 구성 변경은 로그인 후 가능합니다.',
    loginEmail: '관리자 이메일',
    loginPassword: '관리자 비밀번호',
    loginButton: '로그인 후 편집',
    close: '닫기',
    loadingSettings: '설정을 불러오는 중...',
    errorSessionExpired: '세션이 만료되었습니다. 다시 로그인하세요.',
    errorInvalidCredentials: '이메일 또는 비밀번호를 확인해 주세요.',
    errorTokenMissing: '로그인 토큰을 받지 못했습니다.',
    errorLoginFailed: '로그인 중 오류가 발생했습니다.',
    errorSaveFailed: '저장 중 오류가 발생했습니다.',
    logout: '로그아웃',
    saveChanges: '변경사항 저장',
    saving: '저장 중...',
    mainInfo: '메인 정보',
    brandLabel: '헤더 브랜드',
    dashboardTitleLabel: '대시보드 타이틀',
    dashboardDescLabel: '한 줄 설명',
    mainInfoVisibility: '메인 정보 표시',
    showBrandLabel: '헤더 브랜드 표시',
    showTitleLabel: '대시보드 타이틀 표시',
    showDescriptionLabel: '한 줄 설명 표시',
    layoutTitle: '레이아웃',
    languageLabel: '언어',
    languageHelp: '화면 표시 언어',
    layoutColumnsLabel: '큰 화면(데스크톱) 열 수',
    layoutColumnsHelp: '카테고리 카드의 서비스 그리드 기준',
    dockSeparatorLabel: 'Dock 구분선 표시',
    dockSeparatorHelp: '카테고리 사이에 구분선을 표시합니다.',
    themeTitle: '테마',
    themeHelp: '브라우저에 저장되어 자동 적용됩니다.',
    systemSummaryTitle: '시스템 요약 카드',
    systemSummaryHelp: '최대 {count}개 선택',
    systemSummaryEmpty: '표시할 항목을 추가해 주세요.',
    weatherLocationTitle: '날씨 위치',
    weatherAuto: 'IP 기반 자동',
    weatherManual: '직접 위치 지정',
    weatherSearchPlaceholder: '도시 이름 검색 (예: Seoul, 부산)',
    weatherAutoHint: '첫 로딩 시 IP 기준으로 자동 설정됩니다.',
    weatherMetaTitle: '날씨 하단 정보',
    weatherMetaHelp: '최대 {count}개 선택',
    weatherMetaEmpty: '표시할 항목을 추가해 주세요.',
    categoryTitle: '카테고리 & 아이템',
    categoryAdd: '+ 카테고리 추가',
    serviceAdd: '+ 아이템 추가',
    remove: '제거',
    delete: '삭제',
    searchTitle: '빠른 검색',
    searchPlaceholder: '서비스 검색...',
    serviceCount: '{count}개 서비스',
    dockMore: '더보기',
    systemSummaryCard: '시스템 요약',
    weatherCard: '오늘의 날씨',
    iconName: '아이콘 이름',
    iconUrl: '아이콘 URL (선택)',
    urlLabel: '서비스 URL',
    descriptionLabel: '설명',
    iconNamePlaceholder: '예: tv, cloud, database',
    serviceDescPlaceholder: '서비스 요약',
    favoriteLabel: '즐겨찾기 (Dock)',
    authRequiredLabel: '로그인 필요',
    targetLabel: '열기 방식',
    targetSelf: '현재 탭',
    targetBlank: '새 탭',
    targetWindow: '새 창',
    iconPriorityHint:
      '아이콘 URL → 아이콘 이름 → 사이트 아이콘 순으로 적용됩니다. 사이트 아이콘은 입력한 URL의 /favicon.ico를 자동으로 불러오며, 제공되지 않으면 기본 아이콘으로 대체됩니다.',
    newCategory: '새 카테고리',
    newService: '새 서비스',
    labelActiveServices: '활성 서비스',
    labelAuthStatus: '인증 상태',
    labelLastSync: '마지막 동기화',
    labelCategoryCount: '카테고리 수',
    labelFavoriteCount: '즐겨찾기',
    labelHumidity: '습도',
    labelPrecipProbability: '강수확률',
    labelPrecipitation: '예상강수량',
    labelUvIndex: '자외선',
    labelWindSpeed: '풍속',
    labelMinTemp: '최저',
    labelMaxTemp: '최고',
    labelFeelsLike: '체감',
    labelSunrise: '일출',
    labelSunset: '일몰',
    labelCloudCover: '구름량',
    labelPressure: '기압',
    labelVisibility: '가시거리',
    labelWindGust: '돌풍',
    labelWindDirection: '풍향',
    labelDewPoint: '이슬점',
    labelRain: '시간당 비',
    labelSnowfall: '시간당 눈',
    weatherClear: '맑음',
    weatherPartlyCloudy: '구름 조금',
    weatherCloudy: '흐림',
    weatherFog: '안개',
    weatherDrizzle: '이슬비',
    weatherSleet: '진눈깨비',
    weatherRain: '비',
    weatherFreezingRain: '어는 비',
    weatherSnow: '눈',
    weatherSnowGrains: '눈알갱이',
    weatherShowers: '소나기',
    weatherSnowShowers: '소낙눈',
    weatherThunderstorm: '천둥번개',
    weatherThunderstormHail: '우박 동반 폭풍',
    weatherUnknown: '변덕스러움'
  },
  en: {
    lockSwipe: 'Swipe up to unlock',
    loginActive: 'Signed in',
    loginInactive: 'Signed out',
    settingsKicker: 'Dashboard Settings',
    settingsTitle: 'Edit Dashboard',
    settingsSubtitle:
      'The main page is public. Editing requires an admin login.',
    loginEmail: 'Admin email',
    loginPassword: 'Admin password',
    loginButton: 'Sign in to edit',
    close: 'Close',
    loadingSettings: 'Loading settings...',
    errorSessionExpired: 'Session expired. Please sign in again.',
    errorInvalidCredentials: 'Check email or password.',
    errorTokenMissing: 'No login token received.',
    errorLoginFailed: 'Login failed.',
    errorSaveFailed: 'Failed to save changes.',
    logout: 'Sign out',
    saveChanges: 'Save changes',
    saving: 'Saving...',
    mainInfo: 'Main info',
    brandLabel: 'Header brand',
    dashboardTitleLabel: 'Dashboard title',
    dashboardDescLabel: 'Tagline',
    mainInfoVisibility: 'Main info visibility',
    showBrandLabel: 'Show header brand',
    showTitleLabel: 'Show dashboard title',
    showDescriptionLabel: 'Show tagline',
    layoutTitle: 'Layout',
    languageLabel: 'Language',
    languageHelp: 'UI language',
    layoutColumnsLabel: 'Columns on large screens',
    layoutColumnsHelp: 'Service grid in category cards',
    dockSeparatorLabel: 'Show dock separators',
    dockSeparatorHelp: 'Show dividers between categories.',
    themeTitle: 'Theme',
    themeHelp: 'Saved in your browser and applied automatically.',
    systemSummaryTitle: 'System summary',
    systemSummaryHelp: 'Select up to {count}',
    systemSummaryEmpty: 'Add items to display.',
    weatherLocationTitle: 'Weather location',
    weatherAuto: 'Auto by IP',
    weatherManual: 'Set manually',
    weatherSearchPlaceholder: 'Search city (e.g., Seoul, Tokyo)',
    weatherAutoHint: 'Defaults to IP-based location.',
    weatherMetaTitle: 'Weather footer',
    weatherMetaHelp: 'Select up to {count}',
    weatherMetaEmpty: 'Add items to display.',
    categoryTitle: 'Categories & items',
    categoryAdd: '+ Add category',
    serviceAdd: '+ Add item',
    remove: 'Remove',
    delete: 'Delete',
    searchTitle: 'Quick search',
    searchPlaceholder: 'Search services...',
    serviceCount: '{count} services',
    dockMore: 'More',
    systemSummaryCard: 'System summary',
    weatherCard: 'Today’s weather',
    iconName: 'Icon name',
    iconUrl: 'Icon URL (optional)',
    urlLabel: 'Service URL',
    descriptionLabel: 'Description',
    iconNamePlaceholder: 'e.g., tv, cloud, database',
    serviceDescPlaceholder: 'Service summary',
    favoriteLabel: 'Favorite (Dock)',
    authRequiredLabel: 'Require login',
    targetLabel: 'Open in',
    targetSelf: 'Current tab',
    targetBlank: 'New tab',
    targetWindow: 'New window',
    iconPriorityHint:
      'Priority: icon URL → icon name → site icon. The site icon loads from /favicon.ico; if unavailable, the default icon is used.',
    newCategory: 'New category',
    newService: 'New service',
    labelActiveServices: 'Active services',
    labelAuthStatus: 'Auth status',
    labelLastSync: 'Last sync',
    labelCategoryCount: 'Categories',
    labelFavoriteCount: 'Favorites',
    labelHumidity: 'Humidity',
    labelPrecipProbability: 'Precip chance',
    labelPrecipitation: 'Precip amount',
    labelUvIndex: 'UV index',
    labelWindSpeed: 'Wind speed',
    labelMinTemp: 'Min',
    labelMaxTemp: 'Max',
    labelFeelsLike: 'Feels',
    labelSunrise: 'Sunrise',
    labelSunset: 'Sunset',
    labelCloudCover: 'Cloud cover',
    labelPressure: 'Pressure',
    labelVisibility: 'Visibility',
    labelWindGust: 'Wind gust',
    labelWindDirection: 'Wind dir',
    labelDewPoint: 'Dew point',
    labelRain: 'Rain/hr',
    labelSnowfall: 'Snow/hr',
    weatherClear: 'Clear',
    weatherPartlyCloudy: 'Partly cloudy',
    weatherCloudy: 'Cloudy',
    weatherFog: 'Fog',
    weatherDrizzle: 'Drizzle',
    weatherSleet: 'Sleet',
    weatherRain: 'Rain',
    weatherFreezingRain: 'Freezing rain',
    weatherSnow: 'Snow',
    weatherSnowGrains: 'Snow grains',
    weatherShowers: 'Showers',
    weatherSnowShowers: 'Snow showers',
    weatherThunderstorm: 'Thunderstorm',
    weatherThunderstormHail: 'Thunderstorm with hail',
    weatherUnknown: 'Unsettled'
  },
  ja: {
    lockSwipe: '上にスワイプして解除',
    loginActive: 'ログイン中',
    loginInactive: '未ログイン',
    settingsKicker: 'Dashboard Settings',
    settingsTitle: 'ダッシュボード設定',
    settingsSubtitle:
      'メインページは公開。編集はログインが必要です。',
    loginEmail: '管理者メール',
    loginPassword: '管理者パスワード',
    loginButton: 'ログインして編集',
    close: '閉じる',
    loadingSettings: '設定を読み込み中...',
    errorSessionExpired: 'セッションが切れました。再度ログインしてください。',
    errorInvalidCredentials: 'メールまたはパスワードを確認してください。',
    errorTokenMissing: 'ログイントークンを取得できませんでした。',
    errorLoginFailed: 'ログイン中にエラーが発生しました。',
    errorSaveFailed: '保存中にエラーが発生しました。',
    logout: 'ログアウト',
    saveChanges: '変更を保存',
    saving: '保存中...',
    mainInfo: 'メイン情報',
    brandLabel: 'ヘッダーブランド',
    dashboardTitleLabel: 'ダッシュボードタイトル',
    dashboardDescLabel: '説明文',
    mainInfoVisibility: 'メイン情報の表示',
    showBrandLabel: 'ヘッダーブランドを表示',
    showTitleLabel: 'ダッシュボードタイトルを表示',
    showDescriptionLabel: '説明文を表示',
    layoutTitle: 'レイアウト',
    languageLabel: '言語',
    languageHelp: '表示言語',
    layoutColumnsLabel: '大画面の列数',
    layoutColumnsHelp: 'カテゴリカード内のサービス数',
    dockSeparatorLabel: 'Dockの区切りを表示',
    dockSeparatorHelp: 'カテゴリ間に区切り線を表示します。',
    themeTitle: 'テーマ',
    themeHelp: 'ブラウザに保存され自動適用されます。',
    systemSummaryTitle: 'システム要約',
    systemSummaryHelp: '最大{count}件',
    systemSummaryEmpty: '表示項目を追加してください。',
    weatherLocationTitle: '天気の場所',
    weatherAuto: 'IPで自動',
    weatherManual: '手動設定',
    weatherSearchPlaceholder: '都市名検索 (例: Seoul, 東京)',
    weatherAutoHint: '初回はIPベースで自動設定されます。',
    weatherMetaTitle: '天気の下部情報',
    weatherMetaHelp: '最大{count}件',
    weatherMetaEmpty: '表示項目を追加してください。',
    categoryTitle: 'カテゴリ & アイテム',
    categoryAdd: '+ カテゴリ追加',
    serviceAdd: '+ アイテム追加',
    remove: '削除',
    delete: '削除',
    searchTitle: 'クイック検索',
    searchPlaceholder: 'サービス検索...',
    serviceCount: '{count}件のサービス',
    dockMore: 'さらに表示',
    systemSummaryCard: 'システム要約',
    weatherCard: '今日の天気',
    iconName: 'アイコン名',
    iconUrl: 'アイコンURL(任意)',
    urlLabel: 'サービスURL',
    descriptionLabel: '説明',
    iconNamePlaceholder: '例: tv, cloud, database',
    serviceDescPlaceholder: 'サービス概要',
    favoriteLabel: 'お気に入り (Dock)',
    authRequiredLabel: 'ログイン必須',
    targetLabel: '開く方法',
    targetSelf: '現在のタブ',
    targetBlank: '新しいタブ',
    targetWindow: '新しいウィンドウ',
    iconPriorityHint:
      '優先順位: アイコンURL → アイコン名 → サイトアイコン。サイトアイコンは /favicon.ico から取得し、無ければデフォルトになります。',
    newCategory: '新しいカテゴリ',
    newService: '新しいサービス',
    labelActiveServices: '稼働中サービス',
    labelAuthStatus: '認証状態',
    labelLastSync: '最終同期',
    labelCategoryCount: 'カテゴリ数',
    labelFavoriteCount: 'お気に入り',
    labelHumidity: '湿度',
    labelPrecipProbability: '降水確率',
    labelPrecipitation: '降水量',
    labelUvIndex: 'UV指数',
    labelWindSpeed: '風速',
    labelMinTemp: '最低',
    labelMaxTemp: '最高',
    labelFeelsLike: '体感',
    labelSunrise: '日の出',
    labelSunset: '日没',
    labelCloudCover: '雲量',
    labelPressure: '気圧',
    labelVisibility: '視程',
    labelWindGust: '突風',
    labelWindDirection: '風向',
    labelDewPoint: '露点',
    labelRain: '時間雨量',
    labelSnowfall: '時間降雪',
    weatherClear: '晴れ',
    weatherPartlyCloudy: '晴れ時々曇り',
    weatherCloudy: '曇り',
    weatherFog: '霧',
    weatherDrizzle: '霧雨',
    weatherSleet: 'みぞれ',
    weatherRain: '雨',
    weatherFreezingRain: '凍雨',
    weatherSnow: '雪',
    weatherSnowGrains: '雪粒',
    weatherShowers: 'にわか雨',
    weatherSnowShowers: 'にわか雪',
    weatherThunderstorm: '雷雨',
    weatherThunderstormHail: '雹を伴う雷雨',
    weatherUnknown: '不安定'
  },
  zh: {
    lockSwipe: '上滑解锁',
    loginActive: '已登录',
    loginInactive: '未登录',
    settingsKicker: 'Dashboard Settings',
    settingsTitle: '编辑仪表盘',
    settingsSubtitle: '主页公开，编辑需要管理员登录。',
    loginEmail: '管理员邮箱',
    loginPassword: '管理员密码',
    loginButton: '登录后编辑',
    close: '关闭',
    loadingSettings: '正在加载设置...',
    errorSessionExpired: '会话已过期，请重新登录。',
    errorInvalidCredentials: '请检查邮箱或密码。',
    errorTokenMissing: '未获取到登录令牌。',
    errorLoginFailed: '登录过程中发生错误。',
    errorSaveFailed: '保存失败。',
    logout: '退出登录',
    saveChanges: '保存更改',
    saving: '保存中...',
    mainInfo: '基本信息',
    brandLabel: '页眉品牌',
    dashboardTitleLabel: '仪表盘标题',
    dashboardDescLabel: '一句话说明',
    mainInfoVisibility: '主信息显示',
    showBrandLabel: '显示页眉品牌',
    showTitleLabel: '显示仪表盘标题',
    showDescriptionLabel: '显示一句话说明',
    layoutTitle: '布局',
    languageLabel: '语言',
    languageHelp: '界面语言',
    layoutColumnsLabel: '大屏列数',
    layoutColumnsHelp: '分类卡片内服务列数',
    dockSeparatorLabel: '显示 Dock 分隔线',
    dockSeparatorHelp: '在分类之间显示分隔线。',
    themeTitle: '主题',
    themeHelp: '保存在浏览器并自动应用。',
    systemSummaryTitle: '系统摘要',
    systemSummaryHelp: '最多选择{count}项',
    systemSummaryEmpty: '请添加要显示的项。',
    weatherLocationTitle: '天气位置',
    weatherAuto: 'IP 自动',
    weatherManual: '手动设置',
    weatherSearchPlaceholder: '搜索城市 (例: Seoul, 北京)',
    weatherAutoHint: '首次加载将基于IP自动设置。',
    weatherMetaTitle: '天气底部信息',
    weatherMetaHelp: '最多选择{count}项',
    weatherMetaEmpty: '请添加要显示的项。',
    categoryTitle: '分类与项目',
    categoryAdd: '+ 添加分类',
    serviceAdd: '+ 添加项目',
    remove: '移除',
    delete: '删除',
    searchTitle: '快速搜索',
    searchPlaceholder: '搜索服务...',
    serviceCount: '{count} 个服务',
    dockMore: '更多',
    systemSummaryCard: '系统摘要',
    weatherCard: '今日天气',
    iconName: '图标名称',
    iconUrl: '图标URL（可选）',
    urlLabel: '服务URL',
    descriptionLabel: '描述',
    iconNamePlaceholder: '例如：tv, cloud, database',
    serviceDescPlaceholder: '服务简介',
    favoriteLabel: '收藏（Dock）',
    authRequiredLabel: '需要登录',
    targetLabel: '打开方式',
    targetSelf: '当前标签',
    targetBlank: '新标签页',
    targetWindow: '新窗口',
    iconPriorityHint:
      '优先级：图标URL → 图标名称 → 网站图标。网站图标从 /favicon.ico 获取，若无则使用默认图标。',
    newCategory: '新分类',
    newService: '新服务',
    labelActiveServices: '活跃服务',
    labelAuthStatus: '认证状态',
    labelLastSync: '最后同步',
    labelCategoryCount: '分类数',
    labelFavoriteCount: '收藏',
    labelHumidity: '湿度',
    labelPrecipProbability: '降水概率',
    labelPrecipitation: '降水量',
    labelUvIndex: '紫外线',
    labelWindSpeed: '风速',
    labelMinTemp: '最低',
    labelMaxTemp: '最高',
    labelFeelsLike: '体感',
    labelSunrise: '日出',
    labelSunset: '日落',
    labelCloudCover: '云量',
    labelPressure: '气压',
    labelVisibility: '能见度',
    labelWindGust: '阵风',
    labelWindDirection: '风向',
    labelDewPoint: '露点',
    labelRain: '每小时降雨',
    labelSnowfall: '每小时降雪',
    weatherClear: '晴',
    weatherPartlyCloudy: '少云',
    weatherCloudy: '多云',
    weatherFog: '雾',
    weatherDrizzle: '毛毛雨',
    weatherSleet: '雨夹雪',
    weatherRain: '雨',
    weatherFreezingRain: '冻雨',
    weatherSnow: '雪',
    weatherSnowGrains: '雪粒',
    weatherShowers: '阵雨',
    weatherSnowShowers: '阵雪',
    weatherThunderstorm: '雷阵雨',
    weatherThunderstormHail: '雷阵雨伴冰雹',
    weatherUnknown: '多变'
  }
} as const;

type TranslationKey = keyof typeof TRANSLATIONS.ko;

const SYSTEM_SUMMARY_OPTIONS = [
  { key: 'activeServices', labelKey: 'labelActiveServices' },
  { key: 'authStatus', labelKey: 'labelAuthStatus' },
  { key: 'lastSync', labelKey: 'labelLastSync' },
  { key: 'categoryCount', labelKey: 'labelCategoryCount' },
  { key: 'favoriteCount', labelKey: 'labelFavoriteCount' }
] as const;

const WEATHER_META_OPTIONS = [
  { key: 'humidity', labelKey: 'labelHumidity' },
  { key: 'precipitationProbability', labelKey: 'labelPrecipProbability' },
  { key: 'precipitation', labelKey: 'labelPrecipitation' },
  { key: 'uvIndex', labelKey: 'labelUvIndex' },
  { key: 'windSpeed', labelKey: 'labelWindSpeed' },
  { key: 'cloudCover', labelKey: 'labelCloudCover' },
  { key: 'pressure', labelKey: 'labelPressure' },
  { key: 'visibility', labelKey: 'labelVisibility' },
  { key: 'windGust', labelKey: 'labelWindGust' },
  { key: 'windDirection', labelKey: 'labelWindDirection' },
  { key: 'dewPoint', labelKey: 'labelDewPoint' },
  { key: 'rain', labelKey: 'labelRain' },
  { key: 'snowfall', labelKey: 'labelSnowfall' }
] as const;

type SystemSummaryKey = (typeof SYSTEM_SUMMARY_OPTIONS)[number]['key'];
type WeatherMetaKey = (typeof WEATHER_META_OPTIONS)[number]['key'];

const SYSTEM_SUMMARY_KEYS = SYSTEM_SUMMARY_OPTIONS.map(
  (option) => option.key
) as SystemSummaryKey[];
const WEATHER_META_KEYS = WEATHER_META_OPTIONS.map(
  (option) => option.key
) as WeatherMetaKey[];

const IDLE_LOCK_TIMEOUT_MS = 600000;

type DockService = Service & {
  dockCategoryId: string;
  dockCategoryName: string;
};

type WeatherState = {
  icon: string;
  code: number;
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
    color: CATEGORY_TONES[0].accent,
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
    color: CATEGORY_TONES[1].accent,
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
    color: CATEGORY_TONES[2].accent,
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
    color: CATEGORY_TONES[3].accent,
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

function weatherSummaryKeyFromCode(code?: number): TranslationKey {
  if (code === 0) {
    return 'weatherClear';
  }
  if (code === 1 || code === 2) {
    return 'weatherPartlyCloudy';
  }
  if (code === 3) {
    return 'weatherCloudy';
  }
  if (code === 45 || code === 48) {
    return 'weatherFog';
  }
  if (code === 51 || code === 53 || code === 55) {
    return 'weatherDrizzle';
  }
  if (code === 56 || code === 57) {
    return 'weatherSleet';
  }
  if (code === 61 || code === 63 || code === 65) {
    return 'weatherRain';
  }
  if (code === 66 || code === 67) {
    return 'weatherFreezingRain';
  }
  if (code === 71 || code === 73 || code === 75) {
    return 'weatherSnow';
  }
  if (code === 77) {
    return 'weatherSnowGrains';
  }
  if (code === 80 || code === 81 || code === 82) {
    return 'weatherShowers';
  }
  if (code === 85 || code === 86) {
    return 'weatherSnowShowers';
  }
  if (code === 95) {
    return 'weatherThunderstorm';
  }
  if (code === 96 || code === 99) {
    return 'weatherThunderstormHail';
  }
  return 'weatherUnknown';
}

function translate(
  language: LanguageCode,
  key: TranslationKey,
  vars?: Record<string, string | number>
) {
  const entry = String(
    TRANSLATIONS[language]?.[key] ??
      TRANSLATIONS.en[key] ??
      TRANSLATIONS.ko[key] ??
      key
  );
  if (!vars) {
    return entry;
  }
  let result = entry;
  for (const [varKey, value] of Object.entries(vars)) {
    result = result.replace(`{${varKey}}`, String(value));
  }
  return result;
}

function resolveTheme(key?: string) {
  const fallback = THEME_OPTIONS[0];
  if (!key) return fallback;
  return THEME_OPTIONS.find((theme) => theme.key === key) ?? fallback;
}

function applyTheme(theme: (typeof THEME_OPTIONS)[number]) {
  const root = document.documentElement;
  root.style.setProperty('--bg-deep', theme.colors.bgDeep);
  root.style.setProperty('--bg-mid', theme.colors.bgMid);
  root.style.setProperty('--bg-soft', theme.colors.bgSoft);
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--accent-2', theme.colors.accent2);
  root.style.setProperty('--text-primary', theme.colors.textPrimary);
  root.style.setProperty('--text-muted', theme.colors.textMuted);
  root.style.setProperty('--glass', theme.colors.glass);
  root.style.setProperty('--glass-strong', theme.colors.glassStrong);
  root.style.setProperty('--stroke', theme.colors.stroke);
  root.style.setProperty('--shadow', theme.colors.shadow);
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
  if (!LANGUAGE_OPTIONS.some((option) => option.code === next.language)) {
    next.language = defaultConfig.language;
  }
  if (!GRID_COLUMN_OPTIONS.includes(next.serviceGridColumnsLg as 4 | 5 | 6)) {
    next.serviceGridColumnsLg = defaultConfig.serviceGridColumnsLg;
  }
  if (!THEME_KEYS.includes(next.themeKey ?? '')) {
    next.themeKey = defaultConfig.themeKey;
  }
  if (typeof next.showBrand !== 'boolean') {
    next.showBrand = defaultConfig.showBrand;
  }
  if (typeof next.showTitle !== 'boolean') {
    next.showTitle = defaultConfig.showTitle;
  }
  if (typeof next.showDescription !== 'boolean') {
    next.showDescription = defaultConfig.showDescription;
  }
  if (typeof next.dockSeparatorEnabled !== 'boolean') {
    next.dockSeparatorEnabled = defaultConfig.dockSeparatorEnabled;
  }
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

export default function HomePage() {
  const [unlocked, setUnlocked] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [config, setConfig] = useState<DashboardConfig>(defaultConfig);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<WeatherState>({
    icon: '⛅',
    code: 0,
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
  const [dockVisibleCount, setDockVisibleCount] = useState(3);
  const [dockMenuOpen, setDockMenuOpen] = useState(false);
  const lockRef = useRef<HTMLDivElement | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const dockMenuRef = useRef<HTMLDivElement | null>(null);
  const dockMoreRef = useRef<HTMLButtonElement | null>(null);
  const dragState = useRef({ active: false, startY: 0, delta: 0 });
  const idleTimer = useRef<number | null>(null);

  const activeLanguage =
    settingsOpen && draftConfig ? draftConfig.language : config.language;
  const language = activeLanguage ?? defaultConfig.language;
  const activeThemeKey =
    settingsOpen && draftConfig ? draftConfig.themeKey : config.themeKey;
  const themeKey = activeThemeKey ?? defaultConfig.themeKey;
  const theme = resolveTheme(themeKey);
  const locale = LOCALE_BY_LANGUAGE[language] ?? LOCALE_BY_LANGUAGE.ko;
  const timeLabel = useMemo(
    () => (now ? formatTime(now, locale) : '--:--'),
    [now, locale]
  );
  const dateLabel = useMemo(
    () => (now ? formatDate(now, locale) : '--'),
    [now, locale]
  );
  const t = useMemo(
    () => (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(language, key, vars),
    [language]
  );

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

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
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          credentials: 'include'
        });
        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };

    void checkSession();
  }, []);


  useEffect(() => {
    if (!dockMenuOpen) return;
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        dockMenuRef.current?.contains(target) ||
        dockMoreRef.current?.contains(target)
      ) {
        return;
      }
      setDockMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [dockMenuOpen]);

  useEffect(() => {
    if (!authChecked) return;
    void loadDashboard(isAuthenticated);
  }, [authChecked, isAuthenticated]);

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
            code?: number;
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
          code: Number(data.current.code ?? 0),
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

  const loadDashboard = async (useAdmin: boolean) => {
    try {
      const url = useAdmin
        ? `${API_BASE}/dashboard/admin`
        : `${API_BASE}/dashboard`;

      const response = await fetch(url, { credentials: 'include' });
      if (response.status === 401 && useAdmin) {
        setIsAuthenticated(false);
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

  const loadAdminDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/admin`, {
        credentials: 'include'
      });
      if (response.status === 401) {
        setIsAuthenticated(false);
        setLoginError(t('errorSessionExpired'));
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

  const unlockNow = (withKick = false) => {
    if (withKick && lockRef.current) {
      lockRef.current.style.transition = 'transform 0.15s ease';
      lockRef.current.style.transform = 'translateY(-48px)';
      window.setTimeout(() => {
        if (!lockRef.current) {
          setUnlocked(true);
          return;
        }
        lockRef.current.style.transition = '';
        setUnlocked(true);
        window.requestAnimationFrame(() => {
          if (!lockRef.current) return;
          lockRef.current.style.transform = '';
        });
      }, 120);
      return;
    }
    setUnlocked(true);
    if (lockRef.current) {
      lockRef.current.style.transition = 'transform 0.5s ease';
      lockRef.current.style.transform = '';
    }
  };

  const startDrag = (clientY: number) => {
    dragState.current.active = true;
    dragState.current.startY = clientY;
    dragState.current.delta = 0;
    if (lockRef.current) {
      lockRef.current.style.transition = 'none';
    }
  };

  const moveDrag = (clientY: number) => {
    if (!dragState.current.active || !lockRef.current) return;
    const delta = dragState.current.startY - clientY;
    if (delta < 0) return;
    dragState.current.delta = delta;
    lockRef.current.style.transform = `translateY(-${delta}px)`;
  };

  const endDrag = () => {
    if (!dragState.current.active || !lockRef.current) return;
    dragState.current.active = false;
    const { delta } = dragState.current;
    lockRef.current.style.transition = 'transform 0.5s ease';

    const threshold = Math.min(120, window.innerHeight * 0.12);
    if (delta > threshold) {
      unlockNow();
      return;
    }

    lockRef.current.style.transform = 'translateY(0)';
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement | null)?.closest('.swipe-indicator')) {
      unlockNow(true);
      return;
    }
    event.preventDefault();
    lockRef.current?.setPointerCapture(event.pointerId);
    startDrag(event.clientY);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    moveDrag(event.clientY);
  };

  const handlePointerUp = () => {
    endDrag();
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement | null)?.closest('.swipe-indicator')) {
      unlockNow(true);
      return;
    }
    const touch = event.touches[0];
    if (!touch) return;
    startDrag(touch.clientY);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    moveDrag(touch.clientY);
  };

  const handleTouchEnd = () => {
    endDrag();
  };

  const tonedCategories = useMemo(() => withTones(categories), [categories]);

  const visibleCategories = useMemo(() => {
    const list = isAuthenticated
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
  }, [query, tonedCategories, isAuthenticated]);

  const showBrand = config.showBrand ?? defaultConfig.showBrand;
  const showTitle = config.showTitle ?? defaultConfig.showTitle;
  const showDescription = config.showDescription ?? defaultConfig.showDescription;
  const dockSeparatorEnabled =
    config.dockSeparatorEnabled ?? defaultConfig.dockSeparatorEnabled;

  const allFavorites = useMemo<DockService[]>(() => {
    return [...categories]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .flatMap((category) =>
        (category.services ?? [])
          .filter((service) => service.isFavorite)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((service) => ({
            ...service,
            dockCategoryId: category.id,
            dockCategoryName: category.name
          }))
      );
  }, [categories]);

  const dockVisibleFavorites = useMemo(
    () => allFavorites.slice(0, dockVisibleCount),
    [allFavorites, dockVisibleCount]
  );

  const dockHiddenFavorites = useMemo(
    () => allFavorites.slice(dockVisibleCount),
    [allFavorites, dockVisibleCount]
  );

  const dockEntries = useMemo(() => {
    if (!dockSeparatorEnabled) {
      return dockVisibleFavorites.map((service) => ({
        type: 'item' as const,
        service
      }));
    }

    const entries: Array<
      | { type: 'item'; service: DockService }
      | { type: 'separator'; id: string }
    > = [];
    let prevCategory: string | null = null;
    dockVisibleFavorites.forEach((service, index) => {
      if (
        prevCategory &&
        prevCategory !== service.dockCategoryId
      ) {
        entries.push({
          type: 'separator',
          id: `${service.dockCategoryId}-${index}`
        });
      }
      entries.push({ type: 'item', service });
      prevCategory = service.dockCategoryId;
    });
    return entries;
  }, [dockVisibleFavorites, dockSeparatorEnabled]);

  useEffect(() => {
    const updateDockCapacity = () => {
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      const dockStyle = dockRef.current
        ? window.getComputedStyle(dockRef.current)
        : null;
      const gap = dockStyle
        ? parseFloat(dockStyle.columnGap || dockStyle.gap || '20')
        : 20;
      const paddingX = dockStyle
        ? parseFloat(dockStyle.paddingLeft) + parseFloat(dockStyle.paddingRight)
        : 40;
      const safeMargin = 48;
      const availableWidth = Math.max(0, viewportWidth - safeMargin - paddingX);
      const totalFavorites = allFavorites.length;
      const itemSize = 46;
      const separatorSize = 10;
      const reservedWidths = (includeMore: boolean) => [
        ...(includeMore ? [itemSize] : []),
        itemSize
      ];

      const computeVisibleCount = (includeMore: boolean) => {
        const reserved = reservedWidths(includeMore);
        const reservedWidth = reserved.reduce((sum, width) => sum + width, 0);
        const reservedCount = reserved.length;
        let widthSum = 0;
        let elementCount = 0;
        let visibleCount = 0;
        let prevCategory: string | null = null;

        for (const favorite of allFavorites) {
          const needsSeparator =
            dockSeparatorEnabled &&
            prevCategory &&
            prevCategory !== favorite.dockCategoryId;
          const candidateCount = needsSeparator ? 2 : 1;
          const candidateWidth = itemSize + (needsSeparator ? separatorSize : 0);
          const totalElements = elementCount + candidateCount + reservedCount;
          const totalWidth =
            widthSum + candidateWidth + reservedWidth + gap * (totalElements - 1);

          if (totalWidth > availableWidth) {
            break;
          }

          widthSum += candidateWidth;
          elementCount += candidateCount;
          visibleCount += 1;
          prevCategory = favorite.dockCategoryId;
        }

        return visibleCount;
      };

      const visibleWithMore = computeVisibleCount(true);
      const needsMore = visibleWithMore < totalFavorites;
      const nextVisible = needsMore
        ? visibleWithMore
        : computeVisibleCount(false);

      setDockVisibleCount(nextVisible);
      if (!needsMore) {
        setDockMenuOpen(false);
      }
    };

    updateDockCapacity();
    window.addEventListener('resize', updateDockCapacity);
    return () => window.removeEventListener('resize', updateDockCapacity);
  }, [allFavorites, dockSeparatorEnabled]);

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
  const authStatusLabel = isAuthenticated
    ? t('loginActive')
    : t('loginInactive');

  const systemSummaryValues = useMemo<Record<SystemSummaryKey, string>>(
    () => ({
      activeServices: `${categories.reduce(
        (sum, cat) => sum + (cat.services?.length ?? 0),
        0
      )}`,
      authStatus: authStatusLabel,
      lastSync: timeLabel,
      categoryCount: `${categories.length}`,
      favoriteCount: `${allFavorites.length}`
    }),
    [authStatusLabel, categories, allFavorites.length, timeLabel]
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
  const weatherSummary = useMemo(
    () => translate(language, weatherSummaryKeyFromCode(weather.code)),
    [language, weather.code]
  );

  const openSettings = () => {
    setSettingsOpen(true);
    if (isAuthenticated) {
      void loadAdminDashboard();
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
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      if (!response.ok) {
        setLoginError(t('errorInvalidCredentials'));
        return;
      }

      setIsAuthenticated(true);
      await loadAdminDashboard();
    } catch {
      setLoginError(t('errorLoginFailed'));
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch {
      // Ignore logout failures; clear local state either way.
    }
    setIsAuthenticated(false);
    setLoginError(null);
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
      name: t('newCategory'),
      color: CATEGORY_TONES[0].accent,
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
      name: t('newService'),
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
    if (!isAuthenticated || !draftConfig) return;
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
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          config: {
            brandName: draftConfig.brandName,
            language: draftConfig.language,
            serviceGridColumnsLg: draftConfig.serviceGridColumnsLg,
            title: draftConfig.title,
            description: draftConfig.description,
            showBrand: draftConfig.showBrand,
            showTitle: draftConfig.showTitle,
            showDescription: draftConfig.showDescription,
            dockSeparatorEnabled: draftConfig.dockSeparatorEnabled,
            themeKey: draftConfig.themeKey,
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

      const nextConfig = data.config ?? draftConfig;
      const nextCategories = data.categories ?? normalizedCategories;
      setConfig(nextConfig);
      setCategories(nextCategories);
      setDraftConfig(nextConfig);
      setDraftCategories(nextCategories);
    } catch {
      setLoginError(t('errorSaveFailed'));
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
      <LockScreen
        unlocked={unlocked}
        isAuthenticated={isAuthenticated}
        timeLabel={timeLabel}
        dateLabel={dateLabel}
        t={(key, vars) => t(key as TranslationKey, vars)}
        lockRef={lockRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onUnlock={unlockNow}
      />

      <main
        className={`home-screen ${unlocked ? 'visible' : ''}`}
        data-columns={config.serviceGridColumnsLg}
        style={
          {
            '--service-columns': config.serviceGridColumnsLg
          } as CSSProperties
        }
      >
        <div className="container">
          <div className="status-bar">
            <div className="status-left">{timeLabel}</div>
            <div className="status-right">
              {showBrand ? (
                <span className="pill">{config.brandName}</span>
              ) : null}
            </div>
          </div>

          {showTitle || showDescription ? (
            <section className="hero">
              {showTitle ? <h1>{config.title}</h1> : null}
              {showDescription ? <p>{config.description}</p> : null}
            </section>
          ) : null}

          <OverviewGrid
            t={(key, vars) => t(key as TranslationKey, vars)}
            systemSummaryOrder={systemSummaryOrder}
            systemSummaryOptions={SYSTEM_SUMMARY_OPTIONS}
            systemSummaryValues={systemSummaryValues}
            weather={weather}
            weatherSummary={weatherSummary}
            weatherMetaOrder={weatherMetaOrder}
            weatherMetaOptions={WEATHER_META_OPTIONS}
            weatherMetaValues={weatherMetaValues}
          />

          <section className="glass-card search-panel">
            <div>
              <h3>{t('searchTitle')}</h3>
            </div>
            <input
              className="search-input compact"
              placeholder={t('searchPlaceholder')}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </section>

          <CategoryGrid
            categories={visibleCategories}
            t={(key, vars) => t(key as TranslationKey, vars)}
          />

        </div>

        <Dock
          dockEntries={dockEntries}
          dockHiddenFavorites={dockHiddenFavorites}
          dockMenuOpen={dockMenuOpen}
          dockRef={dockRef}
          dockMenuRef={dockMenuRef}
          dockMoreRef={dockMoreRef}
          onToggleMenu={() => setDockMenuOpen((prev) => !prev)}
          onOpenSettings={openSettings}
          t={(key, vars) => t(key as TranslationKey, vars)}
        />
      </main>

      {settingsOpen ? (
        <SettingsModal
          t={(key, vars) => t(key as TranslationKey, vars)}
          isAuthenticated={isAuthenticated}
          loginEmail={loginEmail}
          loginPassword={loginPassword}
          loginError={loginError}
          saving={saving}
          draftConfig={draftConfig}
          draftCategories={draftCategories}
          defaultConfig={defaultConfig}
          languageOptions={LANGUAGE_OPTIONS}
          gridColumnOptions={GRID_COLUMN_OPTIONS}
          themeOptions={THEME_OPTIONS}
          systemSummaryOptions={SYSTEM_SUMMARY_OPTIONS}
          weatherMetaOptions={WEATHER_META_OPTIONS}
          selectedSystemSummary={selectedSystemSummary}
          availableSystemSummary={availableSystemSummary}
          selectedWeatherMeta={selectedWeatherMeta}
          availableWeatherMeta={availableWeatherMeta}
          systemSummaryMax={SYSTEM_SUMMARY_MAX}
          weatherMetaMax={WEATHER_META_MAX}
          locationQuery={locationQuery}
          locationOptions={locationOptions}
          onClose={() => setSettingsOpen(false)}
          onLoginSubmit={handleLogin}
          onLoginEmailChange={setLoginEmail}
          onLoginPasswordChange={setLoginPassword}
          onLogout={handleLogout}
          onSave={handleSave}
          setDraftConfig={setDraftConfig}
          onLocationQueryChange={setLocationQuery}
          onLocationSelect={selectLocation}
          addSystemSummaryKey={(key) =>
            addSystemSummaryKey(key as SystemSummaryKey)
          }
          moveSystemSummaryKey={moveSystemSummaryKey}
          removeSystemSummaryKey={(key) =>
            removeSystemSummaryKey(key as SystemSummaryKey)
          }
          addWeatherMetaKey={(key) =>
            addWeatherMetaKey(key as WeatherMetaKey)
          }
          moveWeatherMetaKey={moveWeatherMetaKey}
          removeWeatherMetaKey={(key) =>
            removeWeatherMetaKey(key as WeatherMetaKey)
          }
          addCategory={addCategory}
          updateCategory={updateCategory}
          moveCategory={moveCategory}
          removeCategory={removeCategory}
          addService={addService}
          updateService={updateService}
          moveService={moveService}
          removeService={removeService}
        />
      ) : null}
    </div>
  );
}
