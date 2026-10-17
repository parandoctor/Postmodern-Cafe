"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { countdownRemaining, formatCountdown, useCountdownStore } from "@/store/countdown";

function beep() {
  try {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const context = new AudioCtx();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(0.12, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.8);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.8);
  } catch {
    // Silent fallback when audio is blocked.
  }
}

export function CountdownIndicator() {
  const state = useCountdownStore();
  const [now, setNow] = React.useState(Date.now());
  const notifiedRef = React.useRef<number | null>(null);
  const remaining = countdownRemaining(state);

  React.useEffect(() => {
    if (!state.running) return;
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [state.running]);

  React.useEffect(() => {
    if (!state.running || !state.endsAt || state.endsAt > now) return;
    if (notifiedRef.current === state.endsAt) return;
    notifiedRef.current = state.endsAt;
    state.complete();
    beep();
    if (state.notify && typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("倒计时结束", { body: "这一段时间已经走完了。" });
    }
  }, [now, state]);

  if (!state.running && !state.completed) return null;

  return (
    <div className="hidden items-center gap-1.5 border border-[#dedede] px-2.5 py-1 text-[12px] tabular-nums text-[#555] sm:flex" title={state.completed ? "倒计时结束" : "正在倒计时"}>
      <Bell className="h-3.5 w-3.5" strokeWidth={1.5} />
      <span>{state.completed ? "时间到了" : formatCountdown(remaining)}</span>
    </div>
  );
}
