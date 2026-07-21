import { prisma } from "@/lib/prisma";
import type { OperationType } from "@/types";

/**
 * Log an operation to the database
 */
export async function logOperation(params: {
  userId: string;
  operation: OperationType;
  targetType: string;
  targetId: string;
  detail?: string;
}): Promise<void> {
  try {
    await prisma.operationLog.create({
      data: {
        userId: params.userId,
        operation: params.operation,
        targetType: params.targetType,
        targetId: params.targetId,
        detail: params.detail ?? null,
      },
    });
  } catch (error) {
    console.error("[OperationLog] Failed to log operation:", error);
  }
}

/**
 * File size limit constants
 */
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024,    // 10MB
  video: 500 * 1024 * 1024,   // 500MB
  audio: 100 * 1024 * 1024,   // 100MB
  document: 50 * 1024 * 1024, // 50MB
  default: 100 * 1024 * 1024, // 100MB
} as const;

/**
 * Allowed MIME types
 */
export const ALLOWED_MIME_TYPES = new Set([
  // Images
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/avif",
  // Videos
  "video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo",
  // Audio
  "audio/mpeg", "audio/wav", "audio/ogg", "audio/flac", "audio/aac", "audio/mp4",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain", "text/markdown", "text/csv",
  // Archives
  "application/zip", "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/gzip", "application/x-tar",
  // Code
  "application/json", "application/javascript", "text/javascript",
  "text/html", "text/css", "application/xml", "text/xml",
]);

/**
 * Check if a file type is allowed
 */
export function isAllowedFileType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType);
}

/**
 * Sanitize filename - remove path traversal and dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  // Remove any path components
  let name = filename.replace(/^.*[/\\]/, "");
  // Remove null bytes
  name = name.replace(/\0/g, "");
  // Limit length
  return name.slice(0, 255);
}
