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

// ---- Category (自定义类名 + 重要性) ----
export type CategoryImportance = 0 | 1 | 2 | 3;

export const CATEGORY_IMPORTANCE: Record<
  CategoryImportance,
  { label: string; short: string; level: number }
> = {
  3: { label: "核心", short: "CORE", level: 4 },
  2: { label: "重要", short: "P1", level: 3 },
  1: { label: "常规", short: "P2", level: 2 },
  0: { label: "归档", short: "P3", level: 1 },
};

export const CATEGORY_IMPORTANCE_ORDER: CategoryImportance[] = [3, 2, 1, 0];

export interface Category {
  id: string;
  name: string;
  importance: CategoryImportance;
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

// ---- Note (随时记写 / 知识) ----
export interface NoteItem {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---- MusicTrack (音乐盒) ----
export interface MusicTrackItem {
  id: string;
  name: string;
  size: number;
  path: string;
  addedAt: Date;
}

// ---- Task (任务管理) ----
export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  HIGH: "重要",
  MEDIUM: "一般",
  LOW: "次要",
};

export interface TaskLinkItem {
  id: string;
  taskId: string;
  fileId: string | null;
  noteId: string | null;
  file?: FileItem | null;
  note?: NoteItem | null;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  done: boolean;
  dueDate: Date | null;
  sortOrder: number;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  children: TaskItem[];
  links: TaskLinkItem[];
}
