// Rainbow-box Core Types - v1.3.1

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  extension: string;
  mimeType: string;
  size: number;
  path: string;
  thumbnailPath: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteItem {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MusicTrackItem {
  id: string;
  name: string;
  size: number;
  path: string;
  addedAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  error?: string;
}

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
