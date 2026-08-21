"use client";

import * as React from "react";
import { useBgmStore } from "@/store/bgm";

/**
 * 全局默认背景音乐（电机背景音乐）
 * 挂在根布局，主页 / 登录注册页 / 后台系统统一生效；
 * 受浏览器自动播放策略限制时，首次交互后自动续播。
 * 终端风样式：方形描边 + 字符图标 + BGM 状态标签。
 */
export function DefaultBgm() {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const playing = useBgmStore((s) => s.playing);
  const setPlaying = useBgmStore((s) => s.setPlaying);
  const [muted, setMuted] = React.useState(false);

  // 播放状态与 audio 元素双向同步
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing, setPlaying]);

  // 进入页面尝试自动播放；被浏览器拦截时在首次交互后补播
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const tryPlay = () => {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    };
    tryPlay();
    const onInteract = () => tryPlay();
    window.addEventListener("pointerdown", onInteract, { once: true });
    window.addEventListener("keydown", onInteract, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
  }, [setPlaying]);

  const toggle = () => {
    if (playing) setPlaying(false);
    else setPlaying(true);
  };

  const btnBase =
    "flex h-8 w-8 items-center justify-center border border-[#555] bg-transparent font-mono text-[13px] text-white transition-colors hover:border-white hover:bg-white hover:text-black";

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 border border-[#2a2a28] bg-[#050505]/90 px-3 py-2 font-mono backdrop-blur-md">
      <audio
        ref={audioRef}
        src="/audio/bgm-default.m4a"
        loop
        muted={muted}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
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
