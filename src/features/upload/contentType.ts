const BY_EXTENSION: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  mkv: "video/x-matroska",
};

export function resolveContentType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return BY_EXTENSION[ext] ?? "";
}