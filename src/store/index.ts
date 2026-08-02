import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FileItem, Category, UploadProgress, UserProfile } from "@/types";
import { userStorageKey, setActiveUserId } from "@/lib/utils";

// ---- 用户作用域的 localStorage 适配器 ----
const scopedStorage = () =>
  createJSONStorage(() => {
    const storage = typeof window !== "undefined" ? window.localStorage : null;
    if (!storage) return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
    return {
      getItem: (name: string) => storage.getItem(userStorageKey(name)),
      setItem: (name: string, value: string) => storage.setItem(userStorageKey(name), value),
      removeItem: (name: string) => storage.removeItem(userStorageKey(name)),
    };
  });

// ---- UI Store ----
interface UIState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  rightOpen: boolean;
  theme: "light" | "dark" | "system";
  wallpaper: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setRightOpen: (open: boolean) => void;
  toggleRight: () => void;
  setWallpaper: (wallpaper: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarWidth: 280,
      rightOpen: true,
      theme: "system",
      wallpaper: null,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      setRightOpen: (open) => set({ rightOpen: open }),
      toggleRight: () => set((state) => ({ rightOpen: !state.rightOpen })),
      setWallpaper: (wallpaper) => {
        // 仅接受 null（默认）或 data: URL（自定义壁纸），过滤旧 preset 字符串
        if (wallpaper !== null && !wallpaper.startsWith("data:")) {
          set({ wallpaper: null });
          return;
        }
        set({ wallpaper });
      },
    }),
    {
      name: "rainbow-box-ui",
      version: 2,
      partialize: (state) => ({ wallpaper: state.wallpaper, sidebarOpen: state.sidebarOpen, rightOpen: state.rightOpen, sidebarWidth: state.sidebarWidth }),
      storage: scopedStorage(),
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<UIState>;
        // 清理旧版非 data: URL 的 wallpaper 预设值
        if (version < 2 && typeof state.wallpaper === "string" && !state.wallpaper.startsWith("data:")) {
          state.wallpaper = null;
        }
        if (typeof state.wallpaper === "string" && !state.wallpaper.startsWith("data:")) {
          state.wallpaper = null;
        }
        return state as UIState;
      },
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
  setUser: (user) => {
    set({ user });
    // 同步活跃用户 ID，用于 localStorage 按账号隔离
    setActiveUserId(user?.id ?? null);
  },
  setLoading: (loading) => set({ isLoading: loading }),
}));
