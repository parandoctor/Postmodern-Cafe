"use client";

import * as React from "react";
import { ChevronDown, Music, Plus, Play, Pause, Trash2, Disc3 } from "lucide-react";
import { useMusicStore } from "@/store/widgets";
import { formatFileSize, cn } from "@/lib/utils";

export function SidebarMusic() {
  const { tracks, currentId, load, add, remove, setCurrent } = useMusicStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  const currentTrack = tracks.find((t) => t.id === currentId) ?? null;

  React.useEffect(() => {
    load();
  }, [load]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      if (!file.type.startsWith("audio/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        add(file.name, file.size, reader.result as string).catch((err) =>
          console.error("[music] 保存音乐失败:", err),
        );
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const togglePlay = (trackId: string) => {
    if (currentId !== trackId) {
      setCurrent(trackId);
      return; // audio 组件重挂载后自动播放
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play();
  };

  const handleDelete = async (trackId: string) => {
    if (currentId === trackId) {
      setIsPlaying(false);
    }
    await remove(trackId);
  };

  return (
    <div className="px-2">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform",
            collapsed && "-rotate-90",
          )}
        />
        <Disc3 className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          音乐盒
        </span>
        <span className="ml-auto text-[10px] tabular-nums text-muted-foreground/70">
          {tracks.length}
        </span>
      </button>

      {!collapsed && (
        <div className="mt-1 space-y-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-1.5 rounded-md border border-dashed border-black/20 px-2 py-1.5 text-[12px] text-muted-foreground hover:border-black/40 hover:text-foreground dark:border-white/20 dark:hover:border-white/40 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            上传本地音乐
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFiles}
            className="hidden"
          />

          {tracks.length === 0 ? (
            <p className="px-1 py-1 text-xs text-muted-foreground/60">上传音乐开始播放</p>
          ) : (
            <ul className="max-h-36 space-y-0.5 overflow-y-auto pr-0.5">
              {tracks.map((track) => {
                const active = track.id === currentId;
                return (
                  <li
                    key={track.id}
                    className="group flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <button
                      onClick={() => togglePlay(track.id)}
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
                        active
                          ? "bg-foreground text-background"
                          : "bg-black/5 text-muted-foreground hover:text-foreground dark:bg-white/10",
                      )}
                      title={active && isPlaying ? "暂停" : "播放"}
                    >
                      {active && isPlaying ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-[12px] leading-tight",
                          active ? "font-medium text-foreground" : "text-foreground/80",
                        )}
                        title={track.name}
                      >
                        {track.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70">
                        {formatFileSize(track.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(track.id)}
                      className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                      title="删除"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {currentTrack && (
            <div className="rounded-md border border-black/10 bg-background p-1.5 dark:border-white/10">
              <div className="mb-1 flex items-center gap-1.5 px-0.5">
                <Music className="h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="truncate text-[11px] text-muted-foreground">
                  {currentTrack.name}
                </span>
              </div>
              <audio
                key={currentTrack.id}
                ref={audioRef}
                src={currentTrack.dataUrl}
                autoPlay
                controls
                className="h-7 w-full"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
