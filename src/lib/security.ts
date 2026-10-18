import { prisma } from "@/lib/prisma";

export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024,
  video: 500 * 1024 * 1024,
  audio: 100 * 1024 * 1024,
  document: 50 * 1024 * 1024,
  default: 100 * 1024 * 1024,
} as const;

export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/avif",
  "video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo",
  "audio/mpeg", "audio/wav", "audio/ogg", "audio/flac", "audio/aac", "audio/mp4",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain", "text/markdown", "text/csv",
  "application/zip", "application/x-zip-compressed", "application/x-rar-compressed",
  "application/x-7z-compressed", "application/gzip", "application/x-tar",
  "application/json", "application/javascript", "text/javascript",
  "text/html", "text/css", "application/xml", "text/xml",
  "application/octet-stream",
]);

export function isAllowedFileType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType);
}

export function sanitizeFilename(filename: string): string {
  let name = filename.replace(/^.*[/\\]/, "");
  name = name.replace(/\0/g, "");
  return name.slice(0, 255);
}

