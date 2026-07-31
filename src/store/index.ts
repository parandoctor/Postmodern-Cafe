import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FileItem, Category, UploadProgress, UserProfile } from "@/types";

// ---- UI Store ----
interface UIState {
  sidebarOpen: boolean;
  rightOpen: boolean;
  theme: "light" | "dark" | "system";
  wallpaper: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setRightOpen: (open: boolean) => void;
  toggleRight: () => void;
  setWallpaper: (wallpaper: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      rightOpen: true,
      theme: "system",
      wallpaper: null,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setRightOpen: (open) => set({ rightOpen: open }),
      toggleRight: () => set((state) => ({ rightOpen: !state.rightOpen })),
      setWallpaper: (wallpaper) => set({ wallpaper }),
    }),
    {
      name: "rainbow-box-ui",
      partialize: (state) => ({ wallpaper: state.wallpaper, sidebarOpen: state.sidebarOpen, rightOpen: state.rightOpen }),
    },
  ),
);

// ---- Upload Store ----
interface UploadState {
  uploads: UploadProgress[];
  addUpload: (upload: UploadProgress) => void;
  updateProgress: (fileId: string, progress: number) => void;
  updateStatus: (fileId: string, status: UploadProgress["status"], error?: string) => void;
  removeUpload: (fileId: string) => void;
  clearCompleted: () => void;
}

export const useUploadStore = create<UploadState>()((set) => ({
  uploads: [],
  addUpload: (upload) =>
    set((state) => ({ uploads: [...state.uploads, upload] })),
  updateProgress: (fileId, progress) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.fileId === fileId ? { ...u, progress } : u,
      ),
    })),
  updateStatus: (fileId, status, error) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.fileId === fileId ? { ...u, status, error } : u,
      ),
    })),
  removeUpload: (fileId) =>
    set((state) => ({
      uploads: state.uploads.filter((u) => u.fileId !== fileId),
    })),
  clearCompleted: () =>
    set((state) => ({
      uploads: state.uploads.filter((u) => u.status !== "completed"),
    })),
}));

// ---- File Store ----
interface FileState {
  files: FileItem[];
  selectedFiles: Set<string>;
  currentFolder: string | null;
  viewMode: "grid" | "list";
  setFiles: (files: FileItem[]) => void;
  toggleSelect: (fileId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setCurrentFolder: (folderId: string | null) => void;
  setViewMode: (mode: "grid" | "list") => void;
}

export const useFileStore = create<FileState>()((set) => ({
  files: [],
  selectedFiles: new Set(),
  currentFolder: null,
  viewMode: "grid",
  setFiles: (files) => set({ files }),
  toggleSelect: (fileId) =>
    set((state) => {
      const newSelection = new Set(state.selectedFiles);
      if (newSelection.has(fileId)) {
        newSelection.delete(fileId);
      } else {
        newSelection.add(fileId);
      }
      return { selectedFiles: newSelection };
    }),
  selectAll: () =>
    set((state) => ({
      selectedFiles: new Set(state.files.map((f) => f.id)),
    })),
  clearSelection: () => set({ selectedFiles: new Set() }),
  setCurrentFolder: (folderId) => set({ currentFolder: folderId }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));

// ---- Category Store ----
interface CategoryState {
  categories: Category[];
  activeCategoryId: string | null;
  setCategories: (categories: Category[]) => void;
  setActiveCategory: (id: string | null) => void;
}

export const useCategoryStore = create<CategoryState>()((set) => ({
  categories: [],
  activeCategoryId: null,
  setCategories: (categories) => set({ categories }),
  setActiveCategory: (id) => set({ activeCategoryId: id }),
}));

// ---- User Store ----
interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
