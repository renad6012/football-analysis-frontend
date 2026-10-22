import axios, { type AxiosProgressEvent } from "axios";
import { http } from "./client";
import { ApiError } from "./errors";
import { UPLOAD_LIMITS } from "../config/limits";
import type { AnalysisJob, FootballApi, JobStatus } from "../types/api";
import type {
  AllowedContentType,
  AnalysisResponse,
  AnalysisStatus,
  CreateAnalysisRequest,
  CreateAnalysisResponse,
  CreateUploadUrlRequest,
  CreateUploadUrlResponse,
} from "../types/backend";

const API = "/api/v1";

const STATUS_MAP: Record<AnalysisStatus, JobStatus> = {
  PENDING: "queued",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

// DTO (backend shape) -> UI model
const toJob = (dto: AnalysisResponse): AnalysisJob => ({
  jobId: dto.analysisId,
  status: STATUS_MAP[dto.status] ?? "processing",
  errorMessage: dto.error ?? undefined,
  resultId: dto.status === "COMPLETED" ? dto.analysisId : undefined,
   result: dto.result ?? undefined,
});

export const realApi: FootballApi = {
  async getUploadLimits() {
    return UPLOAD_LIMITS; // fixed by the backend contract
  },

  async requestUploadPermission(file) {
    const body: CreateUploadUrlRequest = {
      filename: file.name,
      contentType: file.type as AllowedContentType,
      size: file.size,
    };
    const { data } = await http.post<CreateUploadUrlResponse>(`${API}/videos/upload-url`, body);

    return {
      uploadId: data.videoId,
      uploadUrl: data.uploadUrl,
      method: "PUT",
      // must match the contentType sent above, or the storage rejects the upload
      headers: { "Content-Type": file.type },
    };
  },

  async uploadVideo(file, permission, onProgress) {
    try {
      await axios.put(permission.uploadUrl, file, {
        headers: permission.headers,
        timeout: 0, // large file: don't cut the upload by time
        onUploadProgress: (e: AxiosProgressEvent) => {
          if (e.total) onProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
    } catch {
      throw new ApiError("upload", "Video upload failed. Please try again.");
    }
  },

  async confirmUpload(uploadId) {
    await http.post(`${API}/videos/${uploadId}/confirm`);
  },

  async createAnalysis(uploadId) {
    const body: CreateAnalysisRequest = { videoId: uploadId };
    const { data } = await http.post<CreateAnalysisResponse>(`${API}/analyses`, body);
    return { jobId: data.analysisId };
  },

  async getJobStatus(jobId) {
    const { data } = await http.get<AnalysisResponse>(`${API}/analyses/${jobId}`);
    return toJob(data);
  },
};