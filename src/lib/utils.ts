import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]!}`;
}

/**
 * Format date to relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 30) return `${diffDay} 天前`;
  if (diffMonth < 12) return `${diffMonth} 个月前`;
  return `${diffYear} 年前`;
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string, locales = "zh-CN"): string {
  const target = typeof date === "string" ? new Date(date) : date;
  return target.toLocaleDateString(locales, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Compute a readable text color for a given background hex color.
 * Returns white text on dark backgrounds, near-black on light backgrounds.
 */
export function getContrastColor(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "rgba(0,0,0,0.7)";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  // Relative luminance (WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "rgba(0,0,0,0.75)" : "#ffffff";
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length <= 1) return "";
  return parts.pop()?.toLowerCase() ?? "";
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ---- Per-account localStorage scoping ----

const USER_ID_KEY = "rainbow-box-active-user-id";

/** Get the currently active user ID from local storage (set on login) */
export function getActiveUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY);
}

/** Set the active user ID (call on login) — also triggers re-hydration of scoped stores */
export function setActiveUserId(userId: string | null): void {
  if (typeof window === "undefined") return;
  if (userId) {
    localStorage.setItem(USER_ID_KEY, userId);
  } else {
    localStorage.removeItem(USER_ID_KEY);
  }
}

/**
 * Build a user-scoped localStorage key.
 * Returns the base key if no active user, otherwise appends `-<userId>`.
 */
export function userStorageKey(base: string): string {
  const uid = getActiveUserId();
  return uid ? `${base}-${uid}` : base;
}

/**
 * Get file icon name based on extension
 */
export function getFileTypeIcon(extension: string): string {
  const ext = extension.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext)) return "image";
  if (["mp4", "avi", "mov", "wmv", "flv", "mkv", "webm"].includes(ext)) return "video";
  if (["mp3", "wav", "flac", "aac", "ogg", "wma"].includes(ext)) return "audio";
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["xls", "xlsx"].includes(ext)) return "excel";
  if (["ppt", "pptx"].includes(ext)) return "powerpoint";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  if (["md", "markdown"].includes(ext)) return "markdown";
  if (["txt"].includes(ext)) return "text";
  if (["js", "ts", "jsx", "tsx", "py", "java", "cpp", "c", "go", "rs"].includes(ext)) return "code";
  return "file";
}

/**
 * Check if file type is previewable in browser
 */
export function isPreviewable(mimeType: string): boolean {
  return (
    mimeType.startsWith("image/") ||
    mimeType.startsWith("video/") ||
    mimeType.startsWith("audio/") ||
    mimeType === "application/pdf" ||
    mimeType === "text/plain" ||
    mimeType === "text/markdown"
  );
}
