// ============================================================
// Rainbow-box - Core Type Definitions
// ============================================================

// ---- User ----
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Category (黑白灰阶配色) ----
export type RainbowColor = "red" | "orange" | "yellow" | "green" | "blue" | "darkblue" | "purple";

export const RAINBOW_COLORS: Record<RainbowColor, { hex: string; label: string; gradient: string }> = {
  red:      { hex: "#f5f5f5", label: "白",     gradient: "from-neutral-100/40 to-neutral-200/20" },
  orange:   { hex: "#e0e0e0", label: "浅灰",   gradient: "from-neutral-200/40 to-neutral-300/20" },
  yellow:   { hex: "#c7c7c7", label: "中灰",   gradient: "from-neutral-300/40 to-neutral-400/20" },
  green:    { hex: "#9e9e9e", label: "灰",     gradient: "from-neutral-400/40 to-neutral-500/20" },
  blue:     { hex: "#6b6b6b", label: "深灰",   gradient: "from-neutral-500/40 to-neutral-600/20" },
  darkblue: { hex: "#3b3b3b", label: "墨",     gradient: "from-neutral-700/40 to-neutral-800/20" },
  purple:   { hex: "#141414", label: "黑",     gradient: "from-neutral-900/50 to-black/30" },
};

export interface Category {
  id: string;
  name: string;
  color: RainbowColor;
  icon: string;
  description: string | null;
  sortOrder: number;
  fileCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ---- File ----
export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  extension: string;
  mimeType: string;
  size: number;
  path: string;
  thumbnailPath: string | null;
  categoryId: string | null;
  category?: Category | null;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Tag ----
export interface Tag {
  id: string;
  name: string;
  color: string | null;
  createdAt: Date;
}

// ---- API Response wrapper ----
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ---- Pagination ----
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---- Upload ----
export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  error?: string;
}

// ---- Auth ----
export interface AuthSession {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  expiresAt: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

// ---- Activity Log ----
export type OperationType =
  | "UPLOAD"
  | "DOWNLOAD"
  | "DELETE"
  | "RESTORE"
  | "PERMANENT_DELETE"
  | "RENAME"
  | "MOVE"
  | "COPY"
  | "FAVORITE"
  | "UNFAVORITE"
  | "UPDATE_PROFILE"
  | "CREATE_CATEGORY"
  | "UPDATE_CATEGORY"
  | "DELETE_CATEGORY";

export interface OperationLog {
  id: string;
  userId: string;
  operation: OperationType;
  targetType: string;
  targetId: string;
  detail: string | null;
  createdAt: Date;
}
