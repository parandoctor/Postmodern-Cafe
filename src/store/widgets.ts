// ============================================================
// 侧边栏小部件数据层：每日待办 / 随手记 / 音乐盒
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { idbGetAll, idbPut, idbDelete } from "@/lib/idb";

// ---- 每日待办 ----
export interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

interface TodoState {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  clearDone: () => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (text) =>
        set((state) => ({
          todos: [
            ...state.todos,
            { id: crypto.randomUUID(), text, done: false, createdAt: Date.now() },
          ],
        })),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t,
          ),
        })),
      removeTodo: (id) =>
        set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),
      clearDone: () =>
        set((state) => ({ todos: state.todos.filter((t) => !t.done) })),
    }),
    { name: "rainbow-box-todos" },
  ),
);

// ---- 随手记 ----
export interface Note {
  id: string;
  text: string;
  createdAt: number;
  updatedAt: number;
}

interface NotesState {
  notes: Note[];
  addNote: (text: string) => void;
  updateNote: (id: string, text: string) => void;
  removeNote: (id: string) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (text) =>
        set((state) => ({
          notes: [
            { id: crypto.randomUUID(), text, createdAt: Date.now(), updatedAt: Date.now() },
            ...state.notes,
          ],
        })),
      updateNote: (id, text) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, text, updatedAt: Date.now() } : n,
          ),
        })),
      removeNote: (id) =>
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
    }),
    { name: "rainbow-box-notes" },
  ),
);

// ---- 音乐盒（IndexedDB 持久化） ----
export interface Track {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
  addedAt: number;
}

interface MusicState {
  tracks: Track[];
  currentId: string | null;
  hydrated: boolean;
  load: () => Promise<void>;
  add: (name: string, size: number, dataUrl: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setCurrent: (id: string | null) => void;
}

export const useMusicStore = create<MusicState>()((set, get) => ({
  tracks: [],
  currentId: null,
  hydrated: false,

  load: async () => {
    try {
      const tracks = await idbGetAll<Track>();
      tracks.sort((a, b) => b.addedAt - a.addedAt);
      set({ tracks, hydrated: true });
    } catch (err) {
      console.error("[music] 读取本地音乐失败:", err);
      set({ hydrated: true });
    }
  },

  add: async (name, size, dataUrl) => {
    const track: Track = {
      id: crypto.randomUUID(),
      name,
      size,
      dataUrl,
      addedAt: Date.now(),
    };
    await idbPut(track);
    set((state) => ({ tracks: [track, ...state.tracks] }));
  },

  remove: async (id) => {
    await idbDelete(id);
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== id),
      currentId: state.currentId === id ? null : state.currentId,
    }));
  },

  setCurrent: (id) => set({ currentId: id }),
}));
