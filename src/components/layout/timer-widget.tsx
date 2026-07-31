"use client";

import * as React from "react";
import { Timer as TimerIcon, Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "stopwatch" | "countdown";

function fmt(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

const PRESETS = [5, 10, 25, 45];

export function TimerWidget() {
  const [mode, setMode] = React.useState<Mode>("stopwatch");
  const [elapsed, setElapsed] = React.useState(0);
  const [total, setTotal] = React.useState(25 * 60 * 1000);
  const [remaining, setRemaining] = React.useState(25 * 60 * 1000);
  const [running, setRunning] = React.useState(false);
  const [finished, setFinished] = React.useState(false);

  React.useEffect(() => {
    if (!running) return;
    const startAt = Date.now() - (mode === "stopwatch" ? elapsed : total - remaining);
    const id = window.setInterval(() => {
      const now = Date.now() - startAt;
      if (mode === "stopwatch") {
        setElapsed(now);
      } else {
        const rem = total - now;
        if (rem <= 0) {
          setRemaining(0);
          setRunning(false);
          setFinished(true);
        } else {
          setRemaining(rem);
        }
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [running, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setRunning(false);
    setFinished(false);
    if (next === "stopwatch") setElapsed(0);
    else setRemaining(total);
  };

  const setPreset = (minutes: number) => {
    setTotal(minutes * 60 * 1000);
    setRemaining(minutes * 60 * 1000);
    setRunning(false);
    setFinished(false);
  };

  const reset = () => {
    setRunning(false);
    setFinished(false);
    if (mode === "stopwatch") setElapsed(0);
    else setRemaining(total);
  };

  const display = mode === "stopwatch" ? elapsed : remaining;
  const displayStr = finished && mode === "countdown" ? "00:00" : fmt(display);

  return (
    <section className="rounded-xl border border-black/10 bg-background p-3 shadow-notion dark:border-white/10">
      <div className="mb-2 flex items-center gap-1.5">
        <TimerIcon className="h-4 w-4 text-foreground" />
        <h3 className="text-sm font-semibold tracking-tight">计时器</h3>
        <div className="ml-auto flex rounded-md bg-black/5 p-0.5 dark:bg-white/10">
          {(
            [
              { key: "stopwatch", label: "秒表" },
              { key: "countdown", label: "倒计时" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => switchMode(tab.key)}
              className={cn(
                "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
                mode === tab.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <p
        className={cn(
          "py-2 text-center font-mono text-3xl font-semibold tabular-nums tracking-tight",
          finished && "animate-pulse text-foreground",
        )}
      >
        {displayStr}
      </p>

      {mode === "countdown" && (
        <div className="mb-2 flex justify-center gap-1.5">
          {PRESETS.map((m) => (
            <button
              key={m}
              onClick={() => setPreset(m)}
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
                total === m * 60 * 1000
                  ? "bg-black/10 dark:bg-white/15"
                  : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10",
              )}
            >
              {m} 分
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => {
            if (finished && mode === "countdown") setFinished(false);
            setRunning((r) => !r);
          }}
          className="flex h-8 w-16 items-center justify-center gap-1 rounded-md bg-foreground text-[12px] font-medium text-background transition-transform hover:opacity-90 active:scale-95"
        >
          {running ? (
            <>
              <Pause className="h-3.5 w-3.5" /> 暂停
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" /> 开始
            </>
          )}
        </button>
        <button
          onClick={reset}
          className="flex h-8 w-14 items-center justify-center gap-1 rounded-md bg-black/5 text-[12px] font-medium text-foreground/80 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" /> 重置
        </button>
      </div>

      {finished && mode === "countdown" && (
        <p className="mt-2 text-center text-[11px] font-medium text-foreground">
          时间到
        </p>
      )}
    </section>
  );
}
