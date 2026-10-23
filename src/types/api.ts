export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface UploadLimits {
  maxFileSizeBytes: number;
  allowedMimeTypes: string[];
}

export interface UploadPermission {
  uploadId: string;
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
  createAnalysis(uploadId: string): Promise<{ jobId: string }>;
  getJobStatus(jobId: string): Promise<AnalysisJob>;
  getPlayerHeatmapUrl(analysisId: string, team: number, playerNumber: number): string;
  getPlayerReport(analysisId: string, team: number, playerNumber: number): Promise<unknown>;
}
