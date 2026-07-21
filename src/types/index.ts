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

// ---- Category (七彩配色) ----
export type RainbowColor = "red" | "orange" | "yellow" | "green" | "cyan" | "blue" | "purple";

export const RAINBOW_COLORS: Record<RainbowColor, { hex: string; label: string; gradient: string }> = {
  red:    { hex: "#EF4444", label: "红", gradient: "from-red-500/20 to-red-600/10" },
  orange: { hex: "#F97316", label: "橙", gradient: "from-orange-500/20 to-orange-600/10" },
  yellow: { hex: "#EAB308", label: "黄", gradient: "from-yellow-500/20 to-yellow-600/10" },
  green:  { hex: "#22C55E", label: "绿", gradient: "from-green-500/20 to-green-600/10" },
  cyan:   { hex: "#06B6D4", label: "青", gradient: "from-cyan-500/20 to-cyan-600/10" },
  blue:   { hex: "#3B82F6", label: "蓝", gradient: "from-blue-500/20 to-blue-600/10" },
  purple: { hex: "#A855F7", label: "紫", gradient: "from-purple-500/20 to-purple-600/10" },
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
