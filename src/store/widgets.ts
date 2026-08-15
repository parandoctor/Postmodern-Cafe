// ============================================================
// 侧边栏小部件数据层：随手记 / 音乐盒
// 1.2.0：数据源由 localStorage / IndexedDB 迁移至后端数据库，
// store 仅作前端缓存，所有写操作经 Server Actions 落库。
// 1.2.1：每日待办合并入任务管理，移除 Todo store。
// 首次加载时自动将旧版本地数据导入后端（按账号隔离）。
// ============================================================

import { create } from "zustand";
import { idbGetAll, idbDelete } from "@/lib/idb";
import { userStorageKey } from "@/lib/utils";
import {
  getNotes,
  addNote as apiAddNote,
  updateNote as apiUpdateNote,
  removeNote as apiRemoveNote,
  importLocalNotes,
} from "@/actions/widgets";
import {
  getMusicTracks,
  uploadMusicTrack,
  removeMusicTrack as apiRemoveMusicTrack,
} from "@/actions/music";
import type { NoteItem, MusicTrackItem } from "@/types";

// ---- 随手记 ----
interface NotesState {
  notes: NoteItem[];
  hydrated: boolean;
  load: () => Promise<void>;
  addNote: (text: string) => Promise<boolean>;
  updateNote: (id: string, text: string) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>()((set) => ({
  notes: [],
  hydrated: false,

  load: async () => {
    const res = await getNotes();
    if (res.success && res.data) {
      set({ notes: res.data, hydrated: true });
    } else {
      set({ hydrated: true });
    }
    // 旧版 localStorage 数据迁移（一次性）
    try {
      if (typeof window === "undefined") return;
      const legacyKey = userStorageKey("rainbow-box-notes");
      const raw = localStorage.getItem(legacyKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { state?: { notes?: Array<{ text: string }> } };
      const list = parsed.state?.notes ?? [];
      if (list.length > 0) {
        const importRes = await importLocalNotes(list);
        if (importRes.success) {
          localStorage.removeItem(legacyKey);
          const fresh = await getNotes();
          if (fresh.success && fresh.data) set({ notes: fresh.data });
        }
      } else {
        localStorage.removeItem(legacyKey);
      }
    } catch {
      // 迁移失败不阻塞使用
    }
  },

  addNote: async (text) => {
    const res = await apiAddNote({ text });
    if (res.success && res.data) {
      set((state) => ({ notes: [res.data!, ...state.notes] }));
      return true;
    }
    return false;
  },

  updateNote: async (id, text) => {
    const res = await apiUpdateNote(id, { text });
    if (res.success && res.data) {
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? res.data! : n)),
      }));
    }
  },

  removeNote: async (id) => {
    const res = await apiRemoveNote(id);
    if (res.success) {
      set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    }
  },
}));

// ---- 音乐盒（后端数据库 + 文件系统，IndexedDB 仅用于旧数据迁移） ----
interface MusicState {
  tracks: MusicTrackItem[];
  currentId: string | null;
  hydrated: boolean;
  load: () => Promise<void>;
  add: (name: string, size: number, file: File) => Promise<boolean>;
  remove: (id: string) => Promise<void>;
  migrateLocal: () => Promise<{ migrated: number }>;
  setCurrent: (id: string | null) => void;
}

export const useMusicStore = create<MusicState>()((set, get) => ({
  tracks: [],
  currentId: null,
  hydrated: false,

  load: async () => {
    try {
      const res = await getMusicTracks();
      if (res.success && res.data) {
        set({ tracks: res.data, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch (err) {
      console.error("[music] 读取音乐列表失败:", err);
      set({ hydrated: true });
    }
  },

  add: async (name, size, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await uploadMusicTrack(formData);
    if (res.success && res.data) {
      set((state) => ({ tracks: [res.data!, ...state.tracks] }));
      return true;
    }
    return false;
  },

  remove: async (id) => {
    const res = await apiRemoveMusicTrack(id);
    if (res.success) {
      set((state) => ({
        tracks: state.tracks.filter((t) => t.id !== id),
        currentId: state.currentId === id ? null : state.currentId,
      }));
    }
  },

  // 迁移 IndexedDB 中旧版音频（dataUrl）到后端，成功后清除本地记录
  migrateLocal: async () => {
    let migrated = 0;
    try {
      const local = await idbGetAll<{
        id: string;
        name: string;
        size: number;
        dataUrl: string;
      }>();
      for (const track of local) {
        try {
          const blob = await (await fetch(track.dataUrl)).blob();
          const file = new File([blob], track.name, { type: blob.type || "audio/mpeg" });
          const ok = await get().add(track.name, file.size, file);
          if (ok) {
            migrated += 1;
            await idbDelete(track.id);
          }
        } catch {
          // 单条失败继续
        }
      }
    } catch (err) {
      console.error("[music] 迁移本地音乐失败:", err);
    }
    return { migrated };
  },

  setCurrent: (id) => set({ currentId: id }),
}));
