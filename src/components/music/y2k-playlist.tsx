"use client";

import * as React from "react";
import { ListMusic, Music, Play, Pause, Plus, Trash2 } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import type { MusicTrackItem } from "@/types";

export interface Y2KPlaylistProps {
  tracks: MusicTrackItem[];
  currentId: string | null;
  playing: boolean;
  onPlay: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function Y2KPlaylist({ tracks, currentId, playing, onPlay, onDelete, onAdd }: Y2KPlaylistProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[10px] border border-black/50 bg-[#d7d7d7] shadow-[0_14px_34px_rgba(0,0,0,0.28)]">
      {/* 标题栏 */}
      <div className="y2k-metal-dark flex items-center gap-2 border-b border-black/50 px-2.5 py-[7px]">
        <ListMusic className="h-3.5 w-3.5 shrink-0 text-[#f0f0f0]" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#f0f0f0]">
          Playlist Editor
        </span>
        <span className="ml-auto rounded-[2px] border border-black/40 bg-black/30 px-1.5 py-[1px] font-mono text-[9px] tabular-nums text-[#cfcfcf]">
          {tracks.length} 首
        </span>
      </div>

      {/* 列表 */}
      <div className="min-h-[220px] flex-1 overflow-y-auto">
        {tracks.length === 0 ? (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2 px-6 text-center">
            <Music className="h-8 w-8 text-black/25" />
            <p className="text-[13px] font-medium text-black/60">播放列表空空如也</p>
            <p className="text-[12px] text-black/45">
              点击下方「ADD」或右上角「上传音乐」，把歌曲放进你的 Y2K 音乐盒
            </p>
          </div>
        ) : (
          <ul className="py-1 font-mono text-[12px]">
            {tracks.map((track, index) => {
              const active = track.id === currentId;
              return (
                <li
                  key={track.id}
                  className={cn(
                    "y2k-pl-row group flex cursor-pointer items-center gap-2 border-b border-black/10 px-2.5 py-[7px]",
                    active && "!bg-[#1a1a1a]",
                  )}
                  onClick={() => onPlay(track.id)}
                  title={active && playing ? "暂停" : "播放"}
                >
                  <span
                    className={cn(
                      "w-7 shrink-0 text-right tabular-nums",
                      active ? "font-bold text-[#f5f5f5] drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]" : "text-black/40",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border",
                      active ? "border-white/50 bg-white/15 text-[#f5f5f5]"
                        : "border-black/25 bg-black/5 text-black/40",
                    )}
                  >
                    {active && playing ? <Pause className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate",
                      active ? "font-bold text-[#f5f5f5]" : "text-black/80",
                    )}
                    title={track.name}
                  >
                    {track.name}
                  </span>
                  <span className="shrink-0 text-[10px] tabular-nums text-black/45">
                    {formatFileSize(track.size)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(track.id);
                    }}
                    className="shrink-0 rounded-[3px] p-1 text-black/40 opacity-0 transition-opacity hover:bg-black/10 hover:text-red-600 group-hover:opacity-100"
                    title="删除"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 底部按钮（ADD / DEL 风格） */}
      <div className="y2k-metal flex items-center gap-2 border-t border-black/40 px-2.5 py-2">
        <button
          onClick={onAdd}
          className="y2k-btn flex items-center gap-1 rounded-[3px] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#1f1f1f]"
        >
          <Plus className="h-3 w-3" /> Add
        </button>
        <button
          onClick={() => {
            if (currentId) onDelete(currentId);
          }}
          disabled={!currentId}
          className="y2k-btn flex items-center gap-1 rounded-[3px] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#1f1f1f] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-3 w-3" /> Del
        </button>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-black/45">
          {tracks.length === 0 ? "Waiting..." : "Ready"}
        </span>
      </div>
    </div>
  );
}
