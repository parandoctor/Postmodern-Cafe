import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CountdownState {
  durationMs: number;
  endsAt: number | null;
  remainingMs: number;
  running: boolean;
  completed: boolean;
  notify: boolean;
  setDuration: (ms: number) => void;
  start: (ms?: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  complete: () => void;
  setNotify: (enabled: boolean) => void;
}

export const useCountdownStore = create<CountdownState>()(
  persist(
    (set, get) => ({
      durationMs: 25 * 60 * 1000,
      endsAt: null,
      remainingMs: 25 * 60 * 1000,
      running: false,
      completed: false,
      notify: false,
      setDuration: (ms) => {
        if (get().running) return;
        const value = Math.max(1000, Math.min(ms, 99 * 60 * 60 * 1000));
        set({ durationMs: value, remainingMs: value, completed: false });
      },
      start: (ms) => {
        const duration = Math.max(1000, Math.min(ms ?? get().durationMs, 99 * 60 * 60 * 1000));
        set({ durationMs: duration, remainingMs: duration, endsAt: Date.now() + duration, running: true, completed: false });
      },
      pause: () => {
        const { endsAt, remainingMs } = get();
        const next = endsAt ? Math.max(0, endsAt - Date.now()) : remainingMs;
        set({ endsAt: null, remainingMs: next, running: false });
      },
      resume: () => {
        const { remainingMs } = get();
        if (remainingMs <= 0) return;
        set({ endsAt: Date.now() + remainingMs, running: true, completed: false });
      },
      reset: () => set((state) => ({ endsAt: null, remainingMs: state.durationMs, running: false, completed: false })),
      complete: () => set({ endsAt: null, remainingMs: 0, running: false, completed: true }),
      setNotify: (enabled) => set({ notify: enabled }),
    }),
    {
      name: "rainbow-box-countdown",
      partialize: (state) => ({
        durationMs: state.durationMs,
        endsAt: state.endsAt,
        remainingMs: state.remainingMs,
        running: state.running,
        notify: state.notify,
      }),
    },
  ),
);

export function countdownRemaining(state: Pick<CountdownState, "running" | "endsAt" | "remainingMs">): number {
  return state.running && state.endsAt ? Math.max(0, state.endsAt - Date.now()) : Math.max(0, state.remainingMs);
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
