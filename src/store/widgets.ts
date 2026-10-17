import { create } from "zustand";
import { idbGetAll, idbDelete } from "@/lib/idb";
import {
  getNotes, addNote as apiAddNote, updateNote as apiUpdateNote,
  removeNote as apiRemoveNote, importLocalNotes,
} from "@/actions/widgets";
import { getMusicTracks, removeMusicTrack as apiRemoveMusicTrack } from "@/actions/music";
import type { NoteItem, MusicTrackItem } from "@/types";
import { userStorageKey } from "@/lib/utils";

interface NotesState {
  notes: NoteItem[];
  hydrated: boolean;
  load: () => Promise<void>;
  addNote: (text: string) => Promise<NoteItem | null>;
  updateNote: (id: string, text: string) => Promise<NoteItem | null>;
  removeNote: (id: string) => Promise<boolean>;
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  hydrated: false,
  load: async () => {
    const res = await getNotes();
    set({ notes: res.success && res.data ? res.data : [], hydrated: true });
    try {
      if (typeof window === "undefined") return;
      const key = userStorageKey("rainbow-box-notes");
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { state?: { notes?: Array<{ text: string }> } };
      const list = parsed.state?.notes ?? [];
      if (list.length) {
        const imported = await importLocalNotes(list);
        if (imported.success) {
          localStorage.removeItem(key);
          const fresh = await getNotes();
          if (fresh.success && fresh.data) set({ notes: fresh.data });
        }
      } else localStorage.removeItem(key);
    } catch {
      // Local migration is best-effort and must never block notes.
    }
  },
  addNote: async (text) => {
    const res = await apiAddNote({ text });
    if (!res.success || !res.data) return null;
    const note = res.data;
    set((state) => ({ notes: [note, ...state.notes] }));
    return note;
  },
  updateNote: async (id, text) => {
    const res = await apiUpdateNote(id, { text });
    if (!res.success || !res.data) return null;
    const note = res.data;
    set((state) => ({
      notes: [note, ...state.notes.filter((item) => item.id !== id)],
    }));
    return note;
  },
  removeNote: async (id) => {
    const res = await apiRemoveNote(id);
    if (res.success) set((state) => ({ notes: state.notes.filter((item) => item.id !== id) }));
    return res.success;
  },
}));

interface MusicState {
  tracks: MusicTrackItem[];
  currentId: string | null;
  hydrated: boolean;
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
  load: () => Promise<void>;
  add: (name: string, size: number, file: File) => Promise<{ ok: boolean; error?: string }>;
  remove: (id: string) => Promise<void>;
  migrateLocal: () => Promise<{ migrated: number }>;
  attachAudio: (audio: HTMLAudioElement | null) => void;
  playTrack: (id: string) => Promise<void>;
  togglePlay: () => Promise<void>;
  stop: () => void;
  next: (fromEnded?: boolean) => Promise<void>;
  prev: () => Promise<void>;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  syncPlayback: (playing: boolean) => void;
  syncTime: (time: number) => void;
  syncDuration: (duration: number) => void;
  handleEnded: () => Promise<void>;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  tracks: [],
  currentId: null,
  hydrated: false,
  audio: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  shuffle: false,
  repeat: false,
  load: async () => {
    try {
      const res = await getMusicTracks();
      set({ tracks: res.success && res.data ? res.data : [], hydrated: true });
    } catch (error) {
      console.error("[music] load failed", error);
      set({ hydrated: true });
    }
  },
  add: async (_name, _size, file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/music/upload", { method: "POST", body: formData });
      const json = (await res.json()) as { success: boolean; data?: MusicTrackItem; error?: string };
      if (json.success && json.data) {
        set((state) => ({ tracks: [json.data!, ...state.tracks] }));
        return { ok: true };
      }
      return { ok: false, error: json.error ?? "音乐上传失败" };
    } catch (error) {
      console.error("[music] upload failed", error);
      return { ok: false, error: "网络异常，音乐上传失败" };
    }
  },
  remove: async (id) => {
    const res = await apiRemoveMusicTrack(id);
    if (!res.success) return;
    const wasCurrent = get().currentId === id;
    if (wasCurrent) {
      const audio = get().audio;
      audio?.pause();
      if (audio) audio.removeAttribute("src");
      set({ currentId: null, isPlaying: false, currentTime: 0, duration: 0 });
    }
    set((state) => ({ tracks: state.tracks.filter((track) => track.id !== id) }));
  },
  migrateLocal: async () => {
    let migrated = 0;
    try {
      const local = await idbGetAll<{ id: string; name: string; size: number; dataUrl: string }>();
      for (const track of local) {
        try {
          const blob = await (await fetch(track.dataUrl)).blob();
          const file = new File([blob], track.name, { type: blob.type || "audio/mpeg" });
          const result = await get().add(track.name, file.size, file);
          if (result.ok) {
            migrated += 1;
            await idbDelete(track.id);
          }
        } catch {
          // Continue with the next local track.
        }
      }
    } catch (error) {
      console.error("[music] migration failed", error);
    }
    return { migrated };
  },
  attachAudio: (audio) => {
    if (!audio) {
      set({ audio: null, isPlaying: false });
      return;
    }
    audio.volume = get().volume;
    set({ audio });
  },
  playTrack: async (id) => {
    const track = get().tracks.find((item) => item.id === id);
    const audio = get().audio;
    if (!track || !audio) return;
    const same = get().currentId === id;
    if (!same) {
      audio.src = track.path;
      audio.load();
      set({ currentId: id, currentTime: 0, duration: 0 });
    }
    set({ isPlaying: true });
    try {
      await audio.play();
    } catch {
      set({ isPlaying: false });
    }
  },
  togglePlay: async () => {
    const state = get();
    const audio = state.audio;
    if (!audio) return;
    if (!state.currentId) {
      if (state.tracks[0]) await state.playTrack(state.tracks[0].id);
      return;
    }
    if (audio.paused) {
      try {
        await audio.play();
        set({ isPlaying: true });
      } catch {
        set({ isPlaying: false });
      }
    } else {
      audio.pause();
      set({ isPlaying: false });
    }
  },
  stop: () => {
    const audio = get().audio;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    set({ isPlaying: false, currentTime: 0 });
  },
  next: async (fromEnded = false) => {
    const state = get();
    if (!state.tracks.length) return;
    if (fromEnded && state.repeat && state.currentId) {
      state.seek(0);
      await state.playTrack(state.currentId);
      return;
    }
    if (state.shuffle && state.tracks.length > 1) {
      const candidates = state.tracks.filter((track) => track.id !== state.currentId);
      const random = candidates[Math.floor(Math.random() * candidates.length)];
      if (random) await state.playTrack(random.id);
      return;
    }
    const index = state.tracks.findIndex((track) => track.id === state.currentId);
    const next = state.tracks[(index + 1 + state.tracks.length) % state.tracks.length];
    if (next) await state.playTrack(next.id);
  },
  prev: async () => {
    const state = get();
    if (!state.tracks.length) return;
    if (state.shuffle && state.tracks.length > 1) {
      const candidates = state.tracks.filter((track) => track.id !== state.currentId);
      const random = candidates[Math.floor(Math.random() * candidates.length)];
      if (random) await state.playTrack(random.id);
      return;
    }
    const index = state.tracks.findIndex((track) => track.id === state.currentId);
    const prev = state.tracks[(index - 1 + state.tracks.length) % state.tracks.length];
    if (prev) await state.playTrack(prev.id);
  },
  seek: (time) => {
    const audio = get().audio;
    if (!audio || !Number.isFinite(time)) return;
    audio.currentTime = Math.max(0, Math.min(time, audio.duration || time));
    set({ currentTime: audio.currentTime });
  },
  setVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    const audio = get().audio;
    if (audio) audio.volume = clamped;
    set({ volume: clamped });
  },
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  toggleRepeat: () => set((state) => ({ repeat: !state.repeat })),
  syncPlayback: (playing) => set({ isPlaying: playing }),
  syncTime: (time) => set({ currentTime: time }),
  syncDuration: (duration) => set({ duration }),
  handleEnded: async () => {
    if (get().repeat && get().currentId) {
      const audio = get().audio;
      if (audio) {
        audio.currentTime = 0;
        await audio.play().catch(() => set({ isPlaying: false }));
      }
      return;
    }
    await get().next(true);
  },
}));
