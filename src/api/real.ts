import axios, { type AxiosProgressEvent } from "axios";
import { http } from "./client";
import { ApiError } from "./errors";
import { UPLOAD_LIMITS } from "../config/limits";
import type { AnalysisJob, FootballApi } from "../types/api";
import type {
  AllowedContentType,
  AnalysisResponse,
  CreateAnalysisRequest,
  CreateAnalysisResponse,
  CreateUploadUrlRequest,
  CreateUploadUrlResponse,
  HeatmapResponse,
  TacticalPlanResponse,
} from "../types/backend";

const API = "/api/v1";

// 1. أضف بيانات الكلاسيكو التجريبية هنا وقم بتصديرها (export)
export const EL_CLASICO_MODEL_OUTPUT = {
  homeTeam: "Real Madrid",
  awayTeam: "Barcelona",
  score: "2 - 3",
  title: "تحليل كلاسيكو 2017: ريال مدريد 2 - 3 برشلونة",
  stats: [
    { label: "الاستحواذ", home: "43%", away: "57%" },
    { label: "التسديدات", home: "14", away: "16" },
    { label: "التمريرات", home: "510", away: "640" },
  ],
  events: [
    { id: "1", minute: 28, title: "هدف كاسيميرو", seconds: 1680, team: "home" },
    { id: "2", minute: 33, title: "هدف ميسي", seconds: 1980, team: "away" },
    { id: "3", minute: 73, title: "هدف إيفان راكيتيتش", seconds: 4380, team: "away" },
    { id: "4", minute: 85, title: "هدف خاميس رودريغيز", seconds: 5100, team: "home" },
    { id: "5", minute: 91, title: "هدف ليونيل ميسي القاتل", seconds: 5460, team: "away" },
  ],
  tacticalPlanHeadline: "التحول الهجومي السريع واستغلال المساحات في Zone 14",
  videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // رابط فيديو تجريبي
};

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
  errorMessage: dto.error ?? undefined,
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
    await http.post(`${API}/videos/${uploadId}/confirm`);
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
      `${API}/analyses/${jobId}`
    );
    return toJob(data);
  },

  async getPlayerHeatmap(jobId, team, playerNumber) {
    try {
      const { data } = await http.get<HeatmapResponse>(
        `${API}/analyses/${jobId}/player/${team}/${playerNumber}/heatmap`
      );
      return data;
    } catch {
      return null;
    }
  },

  async createAnalysisPlan(jobId) {
    try {
      const { data } = await http.post<TacticalPlanResponse>(
        `${API}/analyses/${jobId}/plan`
      );
      return data;
    } catch {
      return null;
    }
  },

  async getAnalysisPlan(jobId) {
    try {
      const { data } = await http.get<TacticalPlanResponse>(
        `${API}/analyses/${jobId}/plan`
      );
      return data;
    } catch {
      return null;
    }
  },
};