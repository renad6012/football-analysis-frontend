import axios, { type AxiosProgressEvent } from "axios";
import { http } from "./client";
import { ApiError } from "./errors";
import { UPLOAD_LIMITS } from "../config/limits";
import { env } from "../config/env";
import type { AnalysisJob, FootballApi } from "../types/api";
import type { AllowedContentType, AnalysisResponse, CreateAnalysisRequest, CreateAnalysisResponse, CreateUploadUrlRequest, CreateUploadUrlResponse } from "../types/backend";

const API = "/api/v1";
const PLAYER_REPORT_LANG = "ar";

const segment = (value: string | number) => encodeURIComponent(String(value));

// DTO (backend shape) -> UI model — no fabricated data, pass result as-is
const toJob = (dto: AnalysisResponse): AnalysisJob => ({
  jobId: dto.analysisId,
  status:
    dto.status === "COMPLETED"
      ? "completed"
      : dto.status === "FAILED"
        ? "failed"
        : dto.status === "PROCESSING"
          ? "processing"
          : "queued",
  errorMessage: dto.error?.trim() ? dto.error : undefined,
  resultId: dto.status === "COMPLETED" ? dto.analysisId : undefined,
  result: dto.result ?? undefined,
});

export const realApi: FootballApi = {
  async getUploadLimits() {
    return UPLOAD_LIMITS;
  },

  async requestUploadPermission(file) {
    const body: CreateUploadUrlRequest = {
      filename: file.name,
      contentType: file.type as AllowedContentType,
      size: file.size,
    };
    const { data } = await http.post<CreateUploadUrlResponse>(
      `${API}/videos/upload-url`,
      body
    );
    return {
      uploadId: data.videoId,
      uploadUrl: data.uploadUrl,
      method: "PUT",
      headers: { "Content-Type": file.type },
    };
  },

  async uploadVideo(file, permission, onProgress) {
    try {
      await axios.put(permission.uploadUrl, file, {
        headers: permission.headers,
        timeout: 0,
        onUploadProgress: (e: AxiosProgressEvent) => {
          if (e.total) onProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
    } catch {
      throw new ApiError("upload", "Video upload failed. Please try again.");
    }
  },

  async confirmUpload(uploadId) {
    await http.post(`${API}/videos/${segment(uploadId)}/confirm`);
  },

  async createAnalysis(uploadId) {
    const body: CreateAnalysisRequest = { videoId: uploadId };
    const { data } = await http.post<CreateAnalysisResponse>(
      `${API}/analyses`,
      body
    );
    return { jobId: data.analysisId };
  },

  async getJobStatus(jobId) {
    const { data } = await http.get<AnalysisResponse>(
      `${API}/analyses/${segment(jobId)}`
    );
    return toJob(data);
  },

  getPlayerHeatmapUrl(analysisId, team, playerNumber) {
    return `${env.apiBaseUrl.replace(/\/+$/, "")}${API}/analyses/${segment(analysisId)}/player/${segment(team)}/${segment(playerNumber)}/heatmap`;
  },

  async getPlayerReport(analysisId, team, playerNumber) {
    const question = `أداء ومستوى اللاعب رقم ${playerNumber} البدني والتكتيكي`;
    // TODO: confirm with the backend whether "en" is supported and how the player is identified.
    const { data } = await http.post<unknown>(
      `${API}/analyses/${segment(analysisId)}/player`,
      { team, question, lang: PLAYER_REPORT_LANG },
      { timeout: 60000 }
    );
    return data;
  },

};
