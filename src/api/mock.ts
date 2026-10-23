import { UPLOAD_LIMITS } from "../config/limits";
import { ApiError } from "./errors";
import { EL_CLASICO_MODEL_OUTPUT } from "./real";
import type { FootballApi } from "../types/api";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

interface MockJob {
  start: number;
  shouldFail: boolean;
  pollFailuresLeft: number;
}

const jobs = new Map<string, MockJob>();
const failedOnce = new Set<string>();

function failOnce(key: string, error: ApiError) {
  if (failedOnce.has(key)) return;

  failedOnce.add(key);
  throw error;
}

export const mockApi: FootballApi = {
  async getUploadLimits() {
    await sleep(300);
    return UPLOAD_LIMITS;
  },

  async requestUploadPermission(file) {
    await sleep(400);

    if (file.name.includes("session")) {
      throw new ApiError(
        "unauthorized",
        "Your session has expired. Please sign in again."
      );
    }

    if (file.name.includes("timeout")) {
      failOnce(
        `timeout:${file.name}`,
        new ApiError("timeout", "The request took too long. Please try again.")
      );
    }

    return {
      uploadId: `mock-${Date.now()}-${file.name}`,
      uploadUrl: "mock://upload",
      method: "PUT",
    };
  },

  async uploadVideo(file, _permission, onProgress) {
    for (let progress = 0; progress <= 100; progress += 10) {
      onProgress(progress);

      if (progress === 50 && file.name.includes("upload-error")) {
        failOnce(
          `upload:${file.name}`,
          new ApiError("upload", "Video upload failed. Please try again.")
        );
      }

      await sleep(250);
    }
  },

  async confirmUpload(uploadId) {
    await sleep(300);

    if (uploadId.includes("confirm-error")) {
      failOnce(
        `confirm:${uploadId}`,
        new ApiError(
          "server",
          "Something went wrong on our side. Please try again later."
        )
      );
    }
  },

  async createAnalysis(uploadId) {
    await sleep(400);

    const jobId = `mock-job-${Date.now()}`;

    jobs.set(jobId, {
      start: Date.now(),
      shouldFail: uploadId.includes("fail"),
      pollFailuresLeft: uploadId.includes("poll-down")
        ? 3
        : uploadId.includes("poll-flaky")
          ? 2
          : 0,
    });

    return { jobId };
  },

  async getJobStatus(jobId) {
    await sleep(200);

    const job = jobs.get(jobId);

    if (!job) {
      return {
        jobId,
        status: "completed",
        resultId: jobId,
        result: EL_CLASICO_MODEL_OUTPUT,
      };
    }

    const elapsed = Date.now() - job.start;

    if (elapsed >= 4000 && job.pollFailuresLeft > 0) {
      job.pollFailuresLeft -= 1;
      throw new ApiError(
        "network",
        "Can't reach the server. Check your connection and try again."
      );
    }

    if (elapsed < 3000) {
      return { jobId, status: "queued" };
    }

    if (job.shouldFail && elapsed >= 6000) {
      return {
        jobId,
        status: "failed",
        errorMessage: "Analysis failed (mock).",
      };
    }

    if (elapsed < 7000) {
      const progress = Math.round(((elapsed - 3000) / 4000) * 100);
      return { jobId, status: "processing", progress };
    }

    return {
      jobId,
      status: "completed",
      progress: 100,
      resultId: "mock-result-1",
      backendStatus: "COMPLETED",
      result: EL_CLASICO_MODEL_OUTPUT,
    };
  },

  async getPlayerHeatmap(jobId, team, playerNumber) {
    await sleep(200);

    return {
      analysisId: jobId,
      team,
      number: playerNumber,
      heatmapUrl: "mock://heatmap",
    };
  },

  async createAnalysisPlan(jobId) {
    await sleep(300);

    return {
      analysisId: jobId,
      headline: EL_CLASICO_MODEL_OUTPUT.tacticalPlanHeadline,
    };
  },

  async getAnalysisPlan(jobId) {
    await sleep(200);

    return {
      analysisId: jobId,
      headline: EL_CLASICO_MODEL_OUTPUT.tacticalPlanHeadline,
    };
  },
};