import {
  Activity,
  ArrowsClockwise,
  Camera,
  ChartLineUp,
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Compass,
  Cube,
  Database,
  FileText,
  FilmSlate,
  FlowArrow,
  Folder,
  Gear,
  GitBranch,
  Heartbeat,
  HouseSimple,
  Monitor,
  MusicNotesSimple,
  PlayCircle,
  Question,
  ShieldCheck,
  Sun,
  TelevisionSimple,
  Wind
} from 'phosphor-react';

const iconMap = {
  activity: Activity,
  camera: Camera,
  chart: ChartLineUp,
  cloud: Cloud,
  'cloud-sun': CloudSun,
  compass: Compass,
  containers: Cube,
  database: Database,
  docs: FileText,
  film: FilmSlate,
  folder: Folder,
  git: GitBranch,
  heartbeat: Heartbeat,
  home: HouseSimple,
  monitor: Monitor,
  music: MusicNotesSimple,
  play: PlayCircle,
  settings: Gear,
  shield: ShieldCheck,
  sync: ArrowsClockwise,
  tv: TelevisionSimple,
  workflow: FlowArrow,
  sun: Sun,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
  wind: Wind,
  default: Question
} as const;

export type AppIconName = keyof typeof iconMap;
export const appIconOptions = Object.keys(iconMap) as AppIconName[];

export function AppIcon({
  name,
  size = 24
}: {
  name: string;
  size?: number;
}) {
  const IconComponent = iconMap[name as AppIconName] ?? iconMap.default;
  return <IconComponent size={size} weight="duotone" />;
}
