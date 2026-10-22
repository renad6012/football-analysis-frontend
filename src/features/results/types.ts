export interface MatchStatRow {
  label: string;
  homeValue: string | number;
  awayValue: string | number;
}

export interface MatchEvent {
  id: string;
  time: string; // e.g., "00:15"
  seconds: number;
  title: string;
  subtitle: string;
}

export interface KeyMetricItem {
  id: string;
  title: string;
  icon: string;
  mainValue: string | number;
  unit?: string;
  subLeft: string;
  subRight: string;
  accentBadge?: string;
}

export interface TechnicalMetricBar {
  id: string;
  label: string;
  englishLabel?: string;
  value: string;
  subValue?: string;
  percentage: number;
  barColor?: string;
}

export interface TrajectoryPoint {
  round: string;
  rating: number;
  passing: number;
  xg: number;
  isPeak?: boolean;
}

export interface DetailedPlayerStats {
  participationStatus: string;
  physicalReadiness: string;
  transparencyNotice: string;
  kpis: KeyMetricItem[];
  specialistMetrics: {
    title: string;
    subtitle: string;
    badge: string;
    metrics: TechnicalMetricBar[];
    tacticalTags: string[];
  };
  trajectory: {
    title: string;
    subtitle: string;
    benchmarkLabel: string;
    benchmarkValue: number;
    points: TrajectoryPoint[];
    insightTitle: string;
    insightDescription: string;
  };
}

export interface MatchAnalysisData {
  id?: string;
  isDemo?: boolean;
  category?: string;
  title?: string;
  subtitle?: string;
  demoNotice?: string;
  homeTeam: {
    name: string;
    badgeNumber?: number | string;
  };
  awayTeam: {
    name: string;
    badgeNumber?: number | string;
  };
  scoreDisplay?: string;
  statusLabel?: string;
  statsTitle?: string;
  stats: MatchStatRow[];
  eventsTitle?: string;
  events: MatchEvent[];
  eventsNotice?: string;
  videoTitle?: string;
  videoSubtitle?: string;
  videoUrl?: string | null;
  noVideoMessage?: string;
  askTitle?: string;
  askSubtitle?: string;
  askPlaceholder?: string;
  askButtonText?: string;
  detailedStats?: DetailedPlayerStats;
}
