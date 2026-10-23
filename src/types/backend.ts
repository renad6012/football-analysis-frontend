// ===== Shared =====

export type AllowedContentType =
  | "video/mp4"
  | "video/quicktime"
  | "video/webm"
  | "video/x-matroska";

export type AnalysisStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

// ===== 1) POST /api/v1/videos/upload-url =====

export interface CreateUploadUrlRequest {
  filename: string;                 // 1..255 characters
  contentType: AllowedContentType;  // must be one of the allowed types
  size: number;                     // bytes, positive integer, max 524288000 (500 MB)
}

export interface CreateUploadUrlResponse { // HTTP 201
  videoId: string;     // UUID
  uploadUrl: string;   // presigned PUT URL, valid for 10 minutes
  storageKey: string;  // "uploads/<videoId>.<ext>" (informational only, never send it back)
  expiresIn: number;   // 600 (seconds)
}

// ===== 2) POST /api/v1/videos/:videoId/confirm =====
// No request body.

export interface ConfirmUploadResponse { // HTTP 200
  videoId: string;
  storageKey: string;
  size: number;
  contentType: AllowedContentType;
  status: "UPLOADED";
}

// ===== 3) POST /api/v1/analyses =====

export interface CreateAnalysisRequest {
  videoId: string; // UUID
}

export interface CreateAnalysisResponse { // HTTP 201
  analysisId: string; // UUID
  status: "PENDING";
}

// ===== 4) GET /api/v1/analyses/:analysisId =====

export interface AnalysisResponse { // HTTP 200
  analysisId: string;
  videoId: string;
  storageKey: string;
  status: AnalysisStatus;
  result: unknown | null; // shape defined by the AI team; null until COMPLETED
  error: string | null;   // failure reason when status = FAILED
  createdAt: string;      // ISO 8601
  updatedAt: string;      // ISO 8601
}

// ===== 5) GET /api/v1/analyses/:analysisId/player/:team/:number/heatmap =====
export interface HeatmapResponse {
  analysisId: string;
  team: string | number;
  number: string | number;
  heatmapUrl?: string;
  intensityMap?: number[][];
}

// ===== 6) POST & GET /api/v1/analyses/:analysisId/plan =====
export interface TacticalPlanResponse {
  analysisId: string;
  headline: string;
  recommendations?: string[];
  zones?: string[];
}

// ===== Errors =====

export interface ApiErrorBody {
  error:
    | "VALIDATION_ERROR"       // 400
    | "INVALID_VIDEO_ID"       // 400
    | "INVALID_ANALYSIS_ID"    // 400
    | "VIDEO_NOT_FOUND"        // 404
    | "ANALYSIS_NOT_FOUND"     // 404
    | "INVALID_VIDEO"          // 422
    | "INTERNAL_SERVER_ERROR"; // 500
  message?: string;                                // present on INVALID_VIDEO
  details?: { field: string; message: string }[];  // present on VALIDATION_ERROR from upload-url only
}
