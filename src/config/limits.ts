import type { UploadLimits } from "../types/api";

// From the backend contract (POST /api/v1/videos/upload-url).
// Update here if the backend changes them.
export const UPLOAD_LIMITS: UploadLimits = {
  maxFileSizeBytes: 524_288_000, // 500 MB
  allowedMimeTypes: [
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "video/x-matroska",
  ],
};