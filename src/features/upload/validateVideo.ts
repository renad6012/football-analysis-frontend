import type { UploadLimits } from "../../types/api";
import { resolveContentType } from "./contentType";
export function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(i === 0 || value >= 10 ? 0 : 1)} ${units[i]}`;
}

export function validateVideoFile(file: File, limits: UploadLimits): string | null {
  if (file.size === 0) return "The selected file is empty.";
  if (file.name.length > 255) return "The file name is too long (max 255 characters).";

  if (!limits.allowedMimeTypes.includes(resolveContentType(file))) {
    const allowed = limits.allowedMimeTypes
      .map((t) => t.replace("video/", "").toUpperCase())
      .join(", ");
    return `Unsupported file type. Allowed formats: ${allowed}.`;
  }

  if (file.size > limits.maxFileSizeBytes) {
    return `File is too large. Maximum size is ${formatBytes(limits.maxFileSizeBytes)}.`;
  }

  return null;
}