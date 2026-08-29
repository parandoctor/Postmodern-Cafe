"use client";

import * as React from "react";
import { useBgmStore } from "@/store/bgm";

/**
 * 全局默认背景音乐（电机背景音乐）
 *
 * v1.2.8 重构：
 * - 音频为「模块级单例 Audio」，跨路由切换 / React 重挂载不中断；
 * - 播放状态与进度持久化到 sessionStorage，整页刷新后续播；
 * - 进入页面即尝试自动播放（受浏览器策略限制时首次交互补播，补播监听持续到播放成功）；
 * - 音频预加载 + 等到可播放再 seek/播放，避免首次点击卡顿。
 */

const STORAGE_KEY = "rb-bgm-state";

/** 模块级单例音频（SSR 安全） */
let sharedAudio: HTMLAudioElement | null = null;

function getSharedAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudio) {
    const audio = new Audio("/audio/bgm-default.m4a");
    audio.loop = true;
    audio.preload = "auto";
    audio.load(); // 立即开始加载，避免首次点击卡顿

    // 状态变化 → 持久化 + 同步 store
    const persist = () => {
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ playing: !audio.paused, currentTime: audio.currentTime, muted: audio.muted }),
        );
      } catch {
        /* 忽略 */
      }
    };
    audio.addEventListener("play", () => {
      persist();
      useBgmStore.getState().setPlaying(true);
    });
    audio.addEventListener("pause", () => {
      persist();
      useBgmStore.getState().setPlaying(false);
    });
    audio.addEventListener("timeupdate", persist);

    sharedAudio = audio;
  }
  return sharedAudio;
}

export function DefaultBgm() {
  const playing = useBgmStore((s) => s.playing);
  const setPlaying = useBgmStore((s) => s.setPlaying);
  const [muted, setMuted] = React.useState(false);
  const isFirstSync = React.useRef(true);

  // 挂载：恢复状态 + 自动播放尝试 + 首次交互补播（持续到播放成功）
  React.useEffect(() => {
    const audio = getSharedAudio();
    if (!audio) return;

    let saved: { playing?: boolean; currentTime?: number; muted?: boolean } | null = null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {
      /* 忽略 */
    }
    if (saved?.muted !== undefined) setMuted(saved.muted);

    // 恢复进度并（按需）播放；等音频可播放后再 seek，避免卡顿
    const resume = () => {
      try {
        if (typeof saved?.currentTime === "number" && Number.isFinite(saved.currentTime)) {
          audio.currentTime = saved.currentTime;
        }
      } catch {
        /* 忽略 seek 异常 */
      }
      const shouldPlay = saved ? !!saved.playing : true; // 无记录时视为首次，尝试自动播放
      if (shouldPlay) {
        audio.play().catch(() => {
          /* 被自动播放策略拦截，等首次交互补播 */
        });
      }
    };
    if (audio.readyState >= 1) {
      resume();
    } else {
      audio.addEventListener("loadedmetadata", resume, { once: true });
    }
    setPlaying(!audio.paused);

    // 自动播放被拦截时：任意交互补播，直到播放成功为止
    const tryPlay = () => {
      if (audio.paused) audio.play().catch(() => {});
    };
    const onInteract = () => tryPlay();
    const onPlayed = () => {
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      audio.removeEventListener("playing", onPlayed);
    };
    window.addEventListener("pointerdown", onInteract);
    window.addEventListener("keydown", onInteract);
    audio.addEventListener("playing", onPlayed);

    return () => {
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      audio.removeEventListener("playing", onPlayed);
    };
  }, [setPlaying]);

  // store → audio 同步（跳过首次，避免覆盖恢复逻辑）
  React.useEffect(() => {
    const audio = getSharedAudio();
    if (!audio) return;
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    if (playing) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing, setPlaying]);

  // 静音同步
  React.useEffect(() => {
    const audio = getSharedAudio();
    if (!audio) return;
    audio.muted = muted;
  }, [muted]);

  const toggle = () => {
    const audio = getSharedAudio();
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const btnBase =
    "flex h-8 w-8 items-center justify-center border border-[#555] bg-transparent font-mono text-[13px] text-white transition-colors hover:border-white hover:bg-white hover:text-black";

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 border border-[#2a2a28] bg-[#050505]/90 px-3 py-2 font-mono backdrop-blur-md">
      <span className="text-[10px] tracking-[0.16em] text-[#8a8a86]">
        BGM:<span className="text-white">{playing ? "ON" : "OFF"}</span>
      </span>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "暂停背景音乐" : "播放背景音乐"}
        title={playing ? "暂停背景音乐" : "播放背景音乐"}
        className={btnBase}
      >
        {playing ? "❚❚" : "▶"}
      </button>
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "取消静音" : "静音"}
        title={muted ? "取消静音" : "静音"}
        className={btnBase}
      >
        {muted ? "✕" : "♪"}
      </button>
    </div>
  );
}


