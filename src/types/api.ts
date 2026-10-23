export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface MatchMetadata {
  homeTeam: string;
  awayTeam: string;
  matchDate: string; // YYYY-MM-DD
  competition?: string;
}

export interface UploadLimits {
  maxFileSizeBytes: number;
  allowedMimeTypes: string[];
}

export interface UploadPermission {
  uploadId: string; // = videoId from the backend
  uploadUrl: string;
  method: "PUT";
  headers?: Record<string, string>;
}

export interface AnalysisJob {
  jobId: string;
  status: JobStatus;
  progress?: number;
  errorMessage?: string;
  resultId?: string;
  result?: unknown;
   backendStatus?: string;
}

export interface PlayerHeatmapData {
  team: number | string;
  number: number | string;
  heatmapUrl?: string;
  intensity?: number;
}

export interface AnalysisPlanData {
  headline?: string;
  summary?: string;
  tactics?: string[];
}

export interface FootballApi {
  getUploadLimits(): Promise<UploadLimits>;
  requestUploadPermission(file: {
    name: string;
    type: string;
    size: number;
  }): Promise<UploadPermission>;
  uploadVideo(
    file: File,
    permission: UploadPermission,
    onProgress: (percent: number) => void
  ): Promise<void>;
  confirmUpload(uploadId: string): Promise<void>;
  createAnalysis(
    uploadId: string,
    metadata: MatchMetadata
  ): Promise<{ jobId: string }>;
  getJobStatus(jobId: string): Promise<AnalysisJob>;
  getPlayerHeatmap?(
    analysisId: string,
    team: number | string,
    playerNumber: number | string
  ): Promise<unknown>;
  createAnalysisPlan?(analysisId: string): Promise<unknown>;
  getAnalysisPlan?(analysisId: string): Promise<unknown>;
}
