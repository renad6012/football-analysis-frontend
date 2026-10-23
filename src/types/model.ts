// ===== Types for real AI model output structure =====

export interface ModelPlayerStats {
  trackId?: number | string;
  name?: string;
  jerseyNumber?: number | string;
  team?: number | string;
  distanceCovered?: number;
  avgSpeed?: number;
  maxSpeed?: number;
  touches?: number;
  passes?: number;
  shots?: number;
  goals?: number;
  positions?: Array<{ x: number; y: number; frame?: number }>;
}

export interface ModelMatchEvent {
  type: string;
  timestamp?: number | string;
  playerId?: number | string;
  playerName?: string;
  team?: number | string;
  description?: string;
}

export interface ModelMatchOverview {
  score?: string;
  homeTeam?: string;
  awayTeam?: string;
  possession?: { home?: number; away?: number };
  totalPasses?: number;
  totalShots?: number;
  shotsOnTarget?: number;
  detectedPlayers?: number;
}

export interface ModelResult {
  overview?: ModelMatchOverview;
  matchOverview?: ModelMatchOverview;
  players?: ModelPlayerStats[];
  playerStats?: ModelPlayerStats[];
  events?: ModelMatchEvent[];
  matchEvents?: ModelMatchEvent[];
  tracking?: unknown[];
  [key: string]: unknown;
}
