import { UPLOAD_LIMITS } from "../config/limits";
import { ApiError } from "./errors";
import type { FootballApi } from "../types/api";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const demoResult = {
  title: "Demo match analysis", score: "2–1",
  stats: [{ label: "Possession", home: "54%", away: "46%" }, { label: "Shots", home: 12, away: 9 }],
  events: [{ minute: 12, event: "Opening goal" }, { minute: 67, event: "Equalizer" }, { minute: 81, event: "Winning goal" }],
  tables: { jersey_map: [0, 1].flatMap((team) => Array.from({ length: 6 }, (_, index) => ({
    team, number: index + 1, name: index === 2 ? "Unknown" : `Player ${index + 1}`,
    role: index === 0 ? "goalkeeper" : "player", tracked_moments: 28 + index * 7, confidence: 0.72 + index * 0.04,
  }))) },
  note: "Demo data generated for interface preview only.",
};

interface MockJob { start: number; shouldFail: boolean; pollFailuresLeft: number }
const jobs = new Map<string, MockJob>();
const failedOnce = new Set<string>();
function failOnce(key: string, error: ApiError) { if (failedOnce.has(key)) return; failedOnce.add(key); throw error; }

export const mockApi: FootballApi = {
  async getUploadLimits() { await sleep(120); return UPLOAD_LIMITS; },
  async requestUploadPermission(file) {
    await sleep(150);
    if (file.name.includes("timeout")) failOnce(`timeout:${file.name}`, new ApiError("timeout", "The request took too long. Please try again."));
    return { uploadId: `mock-${Date.now()}-${file.name}`, uploadUrl: "mock://upload", method: "PUT" };
  },
  async uploadVideo(file, _permission, onProgress) {
    for (let percent = 0; percent <= 100; percent += 10) {
      onProgress(percent);
      if (percent === 50 && file.name.includes("upload-error")) failOnce(`upload:${file.name}`, new ApiError("upload", "Video upload failed. Please try again."));
      await sleep(80);
    }
  },
  async confirmUpload(uploadId) {
    await sleep(100);
    if (uploadId.includes("confirm-error")) failOnce(`confirm:${uploadId}`, new ApiError("server", "Something went wrong on our side. Please try again later."));
  },
  async createAnalysis(uploadId) {
    await sleep(100);
    const jobId = `mock-job-${Date.now()}`;
    jobs.set(jobId, { start: Date.now(), shouldFail: uploadId.includes("fail"), pollFailuresLeft: uploadId.includes("poll-down") ? 3 : uploadId.includes("poll-flaky") ? 2 : 0 });
    return { jobId };
  },
  async getJobStatus(jobId) {
    await sleep(100);
    const job = jobs.get(jobId);
    if (!job) throw new ApiError("not_found", "We couldn't find this analysis.");
    const elapsed = Date.now() - job.start;
    if (elapsed >= 1000 && job.pollFailuresLeft > 0) { job.pollFailuresLeft -= 1; throw new ApiError("network", "Can't reach the server. Check your connection and try again."); }
    if (elapsed < 1000) return { jobId, status: "queued" };
    if (job.shouldFail && elapsed >= 2000) return { jobId, status: "failed", errorMessage: "Analysis failed (demo)." };
    if (elapsed < 2200) return { jobId, status: "processing", progress: Math.round(((elapsed - 1000) / 1200) * 100) };
    return { jobId, status: "completed", progress: 100, resultId: jobId, result: demoResult };
  },
  getPlayerHeatmapUrl(_analysisId, team, number) {
    const cells = Array.from({ length: 8 }, (_, index) => `<circle cx="${30 + index * 12}" cy="${30 + ((index * 19 + number * 11 + team * 17) % 60)}" r="${8 + (index % 3) * 4}" fill="rgba(255,90,45,.45)"/>`).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220"><rect width="400" height="220" fill="#174b3a"/><path d="M20 20h360v180H20zM200 20v180M200 110a35 35 0 1 0 70 0a35 35 0 1 0-70 0" fill="none" stroke="#b8e8cf" stroke-width="2"/>${cells}<text x="20" y="215" fill="white" font-size="12">DEMO HEATMAP</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  },
  async getPlayerReport(_analysisId, team, number) {
    await sleep(350);
    return { demo: true, team: `Team ${team}`, player: number, report: "Demo report: active movement and useful positional coverage throughout the match." };
  },
};
