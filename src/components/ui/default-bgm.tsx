"use client";

import * as React from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useBgmStore } from "@/store/bgm";
import { cn } from "@/lib/utils";

/**
 * 全局默认背景音乐（电机背景音乐）
 * 挂在根布局，主页 / 登录注册页 / 后台系统统一生效；
 * 受浏览器自动播放策略限制时，首次交互后自动续播。
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

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-1.5">
      <audio
        ref={audioRef}
        src="/audio/bgm-default.m4a"
        loop
        muted={muted}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "暂停背景音乐" : "播放背景音乐"}
        title={playing ? "暂停背景音乐" : "播放背景音乐"}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border shadow-notion backdrop-blur-md transition-all",
          playing
            ? "border-foreground/20 bg-foreground text-background"
            : "border-black/10 bg-white/80 text-foreground hover:bg-white",
        )}
      >
        {playing ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 translate-x-[1px]" />
        )}
      </button>
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "取消静音" : "静音"}
        title={muted ? "取消静音" : "静音"}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/80 text-foreground shadow-notion backdrop-blur-md transition-all hover:bg-white"
      >
        {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
