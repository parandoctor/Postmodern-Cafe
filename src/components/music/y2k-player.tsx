"use client";

import * as React from "react";
import {
  Headphones,
  Minus,
  Pause,
  Play,
  Plus,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  X,
} from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import type { MusicTrackItem } from "@/types";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ---------- 频谱可视化（黑白灰，播放时随机跳动） ---------- */
function SpectrumBars({ playing }: { playing: boolean }) {
  const barCount = 26;
  const [levels, setLevels] = React.useState<number[]>(() =>
    Array.from({ length: barCount }, () => 0.08),
  );

  React.useEffect(() => {
    if (!playing) {
      setLevels(Array.from({ length: barCount }, () => 0.06));
      return;
    }
    const id = window.setInterval(() => {
      setLevels((prev) =>
        prev.map((v) => (Math.random() < 0.45 ? 0.1 + Math.random() * 0.9 : v)),
      );
    }, 80);
    return () => window.clearInterval(id);
  }, [playing]);

  return (
    <div className="flex h-full items-end gap-[2px] overflow-hidden">
      {levels.map((l, i) => (
        <span
          key={i}
          className="flex-1 origin-bottom rounded-[1px] bg-[#e6e6e6] transition-[height] duration-100 ease-out"
          style={{
            height: `${l * 100}%`,
            opacity: 0.35 + l * 0.65,
            boxShadow: "0 0 4px rgba(255,255,255,0.35)",
          }}
        />
      ))}
    </div>
  );
}

/* ---------- 可拖拽滑块（进度 / 音量共用） ---------- */
function useDrag(onChange: (clientX: number) => void) {
  const dragging = React.useRef(false);
  React.useEffect(() => {
    const move = (e: MouseEvent) => {
      if (dragging.current) onChange(e.clientX);
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [onChange]);
  return {
    start: (e: React.MouseEvent) => {
      dragging.current = true;
      onChange(e.clientX);
    },
  };
}

function Slider({
  value,
  onSeek,
  className,
}: {
  value: number; // 0-1
  onSeek: (ratio: number) => void;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const clamped = Math.min(1, Math.max(0, value));
  const ratioFromX = React.useCallback(
    (clientX: number) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      onSeek(Math.min(1, Math.max(0, (clientX - r.left) / r.width)));
    },
    [onSeek],
  );
  const drag = useDrag(ratioFromX);

  return (
    <div
      ref={ref}
      className={cn("group relative h-[18px] cursor-pointer select-none", className)}
      onMouseDown={drag.start}
    >
      <div className="absolute inset-x-0 top-1/2 h-[7px] -translate-y-1/2 rounded-[2px] border border-black/70 bg-[#0a0a0a] shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]" />
      <div
        className="absolute left-0 top-1/2 h-[7px] -translate-y-1/2 rounded-[2px] bg-[#e6e6e6] shadow-[0_0_6px_rgba(255,255,255,0.4)]"
        style={{ width: `${clamped * 100}%` }}
      />
      <div
        className="absolute top-1/2 h-[13px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-[2px] border border-black/60 bg-gradient-to-b from-white via-[#dcdcdc] to-[#9a9a9a] shadow-[0_1px_2px_rgba(0,0,0,0.5)] group-hover:brightness-110"
        style={{ left: `${clamped * 100}%` }}
      />
    </div>
  );
}

/* ---------- Winamp 风格小方按钮（黑白灰） ---------- */
function WButton({
  label,
  title,
  active,
  onClick,
  children,
  className,
}: {
  label: string;
  title?: string;
  active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title ?? label}
      className={cn(
        "y2k-btn flex h-[26px] min-w-[26px] items-center justify-center rounded-[3px] px-1 font-mono text-[10px] font-bold uppercase text-[#1f1f1f]",
        active &&
          "!bg-[#2b2b2b] !text-[#f5f5f5] !shadow-[inset_0_1px_3px_rgba(0,0,0,0.6),0_0_8px_rgba(255,255,255,0.18)]",
        className,
      )}
    >
      {children ?? label}
    </button>
  );
}

/* ---------- 旋转 CD 唱片（黑白灰） ---------- */
export function CdDisc({ playing, size = 84 }: { playing: boolean; size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full border border-black/30 shadow-[0_3px_10px_rgba(0,0,0,0.45)]"
        style={{
          background:
            "radial-gradient(circle, #f7f7f7 0%, #e2e2e2 20%, #d2d2d2 30%, #e6e6e6 46%, #c2c2c2 68%, #949494 100%)",
          animation: playing ? "bp-spin 4s linear infinite" : "none",
        }}
      >
        <div
          className="absolute inset-[4%] rounded-full opacity-35"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(255,255,255,0.5), rgba(200,200,200,0.35), rgba(255,255,255,0.5), rgba(180,180,180,0.35), rgba(230,230,230,0.4), rgba(255,255,255,0.5))",
          }}
        />
        <div className="absolute inset-[22%] rounded-full border border-black/10 bg-[radial-gradient(circle,rgba(255,255,255,0.95)_0%,rgba(220,220,220,0.7)_35%,rgba(150,150,150,0.45)_100%)]" />
        <div className="absolute inset-[40%] rounded-full border border-black/20 bg-[#c9c9c9] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" />
        <div className="absolute inset-[46%] rounded-full bg-[#8a8a8a] shadow-[inset_0_0_3px_rgba(0,0,0,0.6)]" />
      </div>
      <span className="absolute -right-2 -top-1 rounded-[2px] border border-black/40 bg-[#e8e8e8] px-1 font-mono text-[8px] font-bold uppercase tracking-wider text-[#333] shadow">
        CD
      </span>
    </div>
  );
}

/* ---------- 磁带（装饰配件，黑白灰） ---------- */
function CassetteTape() {
  return (
    <div className="relative h-[52px] w-[86px] shrink-0 overflow-hidden rounded-[5px] border border-black/50 bg-gradient-to-b from-[#343434] via-[#1e1e1e] to-[#111] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_3px_8px_rgba(0,0,0,0.4)]">
      <div className="absolute left-[7px] top-1/2 h-[26px] w-[26px] -translate-y-1/2 rounded-full border-[3px] border-[#3d3d3d] bg-[#191919] shadow-inner">
        <div
          className="absolute inset-[5px] rounded-full bg-[#c9c9c9]"
          style={{ animation: "bp-spin 3s linear infinite" }}
        />
      </div>
      <div className="absolute right-[7px] top-1/2 h-[26px] w-[26px] -translate-y-1/2 rounded-full border-[3px] border-[#3d3d3d] bg-[#191919] shadow-inner">
        <div
          className="absolute inset-[5px] rounded-full bg-[#c9c9c9]"
          style={{ animation: "bp-spin 3s linear infinite reverse" }}
        />
      </div>
      <div className="absolute inset-x-1 bottom-[3px] text-center font-mono text-[7px] uppercase tracking-wider text-[#9a9a9a]">
        MIXTAPE · 90MIN · TYPE I
      </div>
    </div>
  );
}

/* ---------- 主播放器（Winamp 机身，黑白灰） ---------- */
export interface Y2KPlayerProps {
  track: MusicTrackItem | null;
  trackNumber: number;
  total: number;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onVolume: (v: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onPickFile: () => void;
}

export function Y2KPlayer(props: Y2KPlayerProps) {
  const {
    track,
    trackNumber,
    total,
    playing,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    onTogglePlay,
    onStop,
    onNext,
    onPrev,
    onSeek,
    onVolume,
    onToggleShuffle,
    onToggleRepeat,
    onPickFile,
  } = props;

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="overflow-hidden rounded-[10px] border border-black/60 shadow-[0_14px_34px_rgba(0,0,0,0.38)]">
      {/* 标题栏（黑白灰，无红绿灯圆点） */}
      <div className="y2k-titlebar flex items-center gap-1.5 px-2 py-[5px]">
        {/* 极简单色 Logo 格 */}
        <span className="grid shrink-0 grid-cols-2 gap-[2px]">
          <span className="h-[6px] w-[6px] bg-white/90" />
          <span className="h-[6px] w-[6px] bg-white/40" />
          <span className="h-[6px] w-[6px] bg-white/40" />
          <span className="h-[6px] w-[6px] bg-white/90" />
        </span>
        <span className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#f0f0f0] drop-shadow-[0_0_4px_rgba(255,255,255,0.25)]">
          Rainbow Box Music
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-[#cfcfcf]">
          <span
            className={cn(
              "h-[6px] w-[6px] rounded-full",
              playing ? "bg-[#f0f0f0] shadow-[0_0_6px_rgba(255,255,255,0.9)]" : "bg-[#5a5a5a]",
            )}
          />
          {playing ? "PLAY" : "STOP"}
        </span>
        {/* Winamp 式单色窗口控件（右上方，非 iOS 红绿灯） */}
        <span className="ml-1.5 flex shrink-0 items-center gap-[3px] border-l border-white/15 pl-1.5">
          <button
            onClick={onStop}
            title="最小化到侧边栏播放（停止）"
            className="flex h-[13px] w-[13px] items-center justify-center rounded-[2px] border border-black/40 bg-[#3a3a3a] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-[#555]"
          >
            <Minus className="h-[8px] w-[8px] text-[#e8e8e8]" />
          </button>
          <button
            onClick={onStop}
            title="停止播放"
            className="flex h-[13px] w-[13px] items-center justify-center rounded-[2px] border border-black/40 bg-[#2a2a2a] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-[#444]"
          >
            <X className="h-[8px] w-[8px] text-[#e8e8e8]" />
          </button>
        </span>
      </div>

      {/* 黑白灰 LCD */}
      <div className="y2k-lcd relative px-2.5 pb-2.5 pt-2">
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-25">
          <div className="y2k-scanline h-[30px] w-full bg-gradient-to-b from-transparent via-white/30 to-transparent" />
        </div>

        <div className="relative">
          {/* 歌曲名跑马灯 */}
          <div className="h-[16px] overflow-hidden">
            {track ? (
              <div className="y2k-marquee-track flex w-max whitespace-nowrap font-mono text-[12px] font-bold uppercase tracking-[0.14em]">
                <span className="y2k-lcd-text pr-10">{track.name}</span>
                <span className="y2k-lcd-text pr-10">{track.name}</span>
              </div>
            ) : (
              <span className="y2k-flicker font-mono text-[12px] uppercase tracking-[0.14em] text-[#6f6f6f]">
                No Track Loaded — 点击下方 + 上传音乐
              </span>
            )}
          </div>

          {/* 时间 + 频谱 + CD */}
          <div className="mt-1.5 flex items-center gap-2.5">
            <div className="flex shrink-0 flex-col items-end font-mono leading-none">
              <span className="y2k-lcd-text text-[14px] tabular-nums">{formatTime(currentTime)}</span>
              <span className="mt-1 text-[9px] tabular-nums text-[#6f6f6f]">
                {track ? formatTime(duration) : "0:00"}
              </span>
            </div>
            <div className="h-[34px] flex-1 rounded-[3px] border border-[#2a2a2a] bg-[#0a0a0a] p-[3px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.85)]">
              <SpectrumBars playing={playing} />
            </div>
            <CdDisc playing={playing} size={66} />
          </div>

          {/* 进度条 */}
          <div className="mt-2">
            <Slider value={progress} onSeek={onSeek} />
          </div>
          <div className="mt-0.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-[#6f6f6f]">
            <span>TRACK {trackNumber}/{total}</span>
            <span>{track ? formatFileSize(track.size) : "—"}</span>
          </div>
        </div>
      </div>

      {/* 控制区（银色金属，黑白灰） */}
      <div className="y2k-metal border-t border-black/40 px-2.5 py-2.5">
        <div className="flex items-center gap-1.5">
          <WButton label="prev" title="上一曲" onClick={onPrev}>
            <SkipBack className="h-3.5 w-3.5" />
          </WButton>
          <WButton label="play" title={playing ? "暂停" : "播放"} onClick={onTogglePlay} active={playing}>
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </WButton>
          <WButton label="stop" title="停止" onClick={onStop}>
            <Square className="h-3 w-3" />
          </WButton>
          <WButton label="next" title="下一曲" onClick={onNext}>
            <SkipForward className="h-3.5 w-3.5" />
          </WButton>

          <span className="mx-1 h-5 w-px bg-black/25" />

          <WButton label="shuffle" title="随机播放" active={shuffle} onClick={onToggleShuffle}>
            <Shuffle className="h-3.5 w-3.5" />
          </WButton>
          <WButton label="repeat" title="单曲循环" active={repeat} onClick={onToggleRepeat}>
            <Repeat className="h-3.5 w-3.5" />
          </WButton>

          <span className="mx-1 h-5 w-px bg-black/25" />

          <Volume2 className="h-3.5 w-3.5 shrink-0 text-[#2a2a2a]" />
          <Slider className="w-24 flex-1" value={volume} onSeek={onVolume} />

          <WButton label="add" title="上传音乐" onClick={onPickFile} className="!min-w-[22px]">
            <Plus className="h-3.5 w-3.5" />
          </WButton>
        </div>

        {/* 装饰配件排：耳机 / 磁带 / STEREO 指示灯（黑白灰） */}
        <div className="mt-2.5 flex items-center gap-3 border-t border-black/20 pt-2">
          <div className="flex items-center gap-1.5 rounded-[4px] border border-black/40 bg-gradient-to-b from-[#3a3a3a] to-[#181818] px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
            <Headphones className="h-3.5 w-3.5 text-[#e8e8e8]" />
            <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-[#e8e8e8]">
              Stereo
            </span>
            <span className="h-[5px] w-[5px] rounded-full bg-[#f0f0f0] shadow-[0_0_5px_rgba(255,255,255,0.9)]" />
          </div>
          <CassetteTape />
          <div className="ml-auto text-right font-mono text-[8px] uppercase leading-tight tracking-wider text-[#3a3a3a]">
            Y2K <br /> Audio Deck
          </div>
        </div>
      </div>
    </div>
  );
}
