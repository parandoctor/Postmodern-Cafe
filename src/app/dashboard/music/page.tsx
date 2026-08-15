"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Music, Play, Pause, Trash2, Disc3, Plus, UploadCloud } from "lucide-react";
import { useMusicStore } from "@/store/widgets";
import { formatFileSize, cn } from "@/lib/utils";

export default function MusicPage() {
  const { tracks, currentId, hydrated, load, add, remove, setCurrent, migrateLocal } = useMusicStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight">音乐盒</h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            共 {tracks.length} 首音乐 · 支持本地上传与在线播放
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!hydrated && (
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="flex items-center gap-1.5 rounded-lg border border-whisper bg-white/60 px-3 py-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              title="将旧版本地音乐迁移到云端存储"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              {migrating ? "迁移中..." : "迁移本地音乐"}
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-[12px] font-medium text-background hover:bg-foreground/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> 上传音乐
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFiles}
            className="hidden"
          />
        </div>
      </div>

      {migrateMsg && (
        <div className="rounded-lg border border-whisper bg-white/60 px-3 py-2 text-[12px] text-muted-foreground">
          {migrateMsg}
        </div>
      )}

      {/* 当前播放 */}
      {currentTrack && (
        <div className="rounded-xl border border-whisper bg-white/60 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2">
            <Disc3 className={cn("h-4 w-4 shrink-0 text-muted-foreground", isPlaying && "animate-spin")} style={{ animationDuration: "6s" }} />
            <span className="min-w-0 truncate text-[13px] font-medium text-foreground/90">
              {currentTrack.name}
            </span>
            <span className="ml-auto shrink-0 text-[11px] text-muted-foreground/60">
              {isPlaying ? "播放中" : "已暂停"}
            </span>
          </div>
          <audio
            key={currentTrack.id}
            ref={audioRef}
            src={currentTrack.path}
            autoPlay
            controls
            className="w-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      )}

      {/* 音乐列表 */}
      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-whisper bg-white/40 py-20 text-center">
          <Disc3 className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-[14px] text-muted-foreground/70">暂无音乐</p>
          <p className="mt-1 text-[12px] text-muted-foreground/50">点击右上角「上传音乐」开始创建你的音乐盒</p>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => {
            const active = track.id === currentId;
            return (
              <motion.div
                key={track.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "group flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-shadow hover:shadow-card",
                  active ? "border-foreground/30 bg-white/70" : "border-whisper bg-white/60",
                )}
              >
                <button
                  onClick={() => togglePlay(track.id)}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                    active
                      ? "bg-foreground text-background"
                      : "bg-black/5 text-muted-foreground hover:text-foreground",
                  )}
                  title={active && isPlaying ? "暂停" : "播放"}
                >
                  {active && isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-[13px] leading-tight",
                      active ? "font-medium text-foreground" : "text-foreground/80",
                    )}
                    title={track.name}
                  >
                    {track.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground/70">
                    <Music className="h-3 w-3" />
                    {formatFileSize(track.size)}
                    {active && <span className="text-foreground/60">· 正在播放</span>}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(track.id)}
                  className="shrink-0 rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                  title="删除"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
