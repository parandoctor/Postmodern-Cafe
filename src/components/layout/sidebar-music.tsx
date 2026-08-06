"use client";

import * as React from "react";
import { ChevronDown, Music, Plus, Play, Pause, Trash2, Disc3, UploadCloud } from "lucide-react";
import { useMusicStore } from "@/store/widgets";
import { formatFileSize, cn } from "@/lib/utils";

export function SidebarMusic() {
  const { tracks, currentId, hydrated, load, add, remove, setCurrent, migrateLocal } = useMusicStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [migrating, setMigrating] = React.useState(false);
  const [migrateMsg, setMigrateMsg] = React.useState("");

  const currentTrack = tracks.find((t) => t.id === currentId) ?? null;

  React.useEffect(() => {
    load();
  }, [load]);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      if (!file.type.startsWith("audio/")) continue;
      const ok = await add(file.name, file.size, file);
      if (!ok) console.error("[music] 上传音乐失败:", file.name);
    }
    e.target.value = "";
  };

  const handleMigrate = async () => {
    setMigrating(true);
    setMigrateMsg("");
    const { migrated } = await migrateLocal();
    setMigrating(false);
    setMigrateMsg(migrated > 0 ? `已迁移 ${migrated} 首本地音乐` : "没有可迁移的本地音乐");
    if (migrated > 0) await load();
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
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left hover:bg-black/5 transition-colors"
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
            className="flex w-full items-center gap-1.5 rounded-md border border-dashed border-black/20 px-2 py-1.5 text-[12px] text-muted-foreground hover:border-black/40 hover:text-foreground transition-colors"
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

          {migrateMsg && (
            <p className="px-1 text-[11px] text-muted-foreground/70">{migrateMsg}</p>
          )}

          {!hydrated && (
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="flex w-full items-center gap-1.5 rounded-md border border-dashed border-black/20 px-2 py-1.5 text-[12px] text-muted-foreground hover:border-black/40 hover:text-foreground transition-colors disabled:opacity-50"
              title="将旧版本地音乐迁移到云端存储"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              {migrating ? "迁移中..." : "迁移本地音乐"}
            </button>
          )}

          {tracks.length === 0 ? (
            <p className="px-1 py-1 text-xs text-muted-foreground/60">上传音乐开始播放</p>
          ) : (
            <ul className="max-h-36 space-y-0.5 overflow-y-auto pr-0.5">
              {tracks.map((track) => {
                const active = track.id === currentId;
                return (
                  <li
                    key={track.id}
                    className="group flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-black/5 transition-colors"
                  >
                    <button
                      onClick={() => togglePlay(track.id)}
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
                        active
                          ? "bg-foreground text-background"
                          : "bg-black/5 text-muted-foreground hover:text-foreground",
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
            <div className="rounded-md border border-black/10 bg-white/60 p-1.5">
              <div className="mb-1 flex items-center gap-1.5 px-0.5">
                <Music className="h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="truncate text-[11px] text-muted-foreground">
                  {currentTrack.name}
                </span>
              </div>
              <audio
                key={currentTrack.id}
                ref={audioRef}
                src={currentTrack.path}
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
