"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { useMusicStore } from "@/store/widgets";
import { Y2KPlayer } from "@/components/music/y2k-player";
import { Y2KPlaylist } from "@/components/music/y2k-playlist";

export default function MusicPage() {
  const { tracks, currentId, hydrated, load, add, remove, setCurrent, migrateLocal } = useMusicStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(0.8);
  const [shuffle, setShuffle] = React.useState(false);
  const [repeat, setRepeat] = React.useState(false);
  const [migrating, setMigrating] = React.useState(false);
  const [migrateMsg, setMigrateMsg] = React.useState("");

  const currentTrack = tracks.find((t) => t.id === currentId) ?? null;
  const currentIndex = currentTrack ? tracks.findIndex((t) => t.id === currentId) : -1;

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

  const goTo = (id: string) => {
    setCurrent(id); // audio 组件重挂载后自动播放
  };

  const goNext = () => {
    if (tracks.length === 0) return;
    if (shuffle) {
      const random = tracks[Math.floor(Math.random() * tracks.length)]!;
      goTo(random.id);
      return;
    }
    const idx = tracks.findIndex((t) => t.id === currentId);
    const next = tracks[(idx + 1 + tracks.length) % tracks.length]!;
    goTo(next.id);
  };

  const goPrev = () => {
    if (tracks.length === 0) return;
    if (shuffle) {
      const random = tracks[Math.floor(Math.random() * tracks.length)]!;
      goTo(random.id);
      return;
    }
    const idx = tracks.findIndex((t) => t.id === currentId);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length]!;
    goTo(prev.id);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (time: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) return;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolume = (v: number) => {
    setVolume(v);
    const audio = audioRef.current;
    if (audio) audio.volume = v;
  };

  const handleEnded = () => {
    if (repeat) {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        void audio.play();
      }
      return;
    }
    goNext();
  };

  const handleDelete = async (trackId: string) => {
    if (currentId === trackId) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
    await remove(trackId);
  };

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight">音乐盒</h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            共 {tracks.length} 首音乐 · 千禧风 Y2K 复古播放器
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
            上传音乐
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

      {/* 隐藏的 audio 播放器 */}
      {currentTrack && (
        <audio
          key={currentTrack.id}
          ref={audioRef}
          src={currentTrack.path}
          autoPlay
          className="hidden"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onVolumeChange={(e) => setVolume(e.currentTarget.volume)}
        />
      )}

      {/* Y2K 操作台 */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid gap-4 xl:grid-cols-[minmax(340px,400px)_minmax(0,1fr)]"
      >
        <Y2KPlayer
          track={currentTrack}
          trackNumber={currentIndex >= 0 ? currentIndex + 1 : 0}
          total={tracks.length}
          playing={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          shuffle={shuffle}
          repeat={repeat}
          onTogglePlay={togglePlay}
          onStop={handleStop}
          onNext={goNext}
          onPrev={goPrev}
          onSeek={handleSeek}
          onVolume={handleVolume}
          onToggleShuffle={() => setShuffle((s) => !s)}
          onToggleRepeat={() => setRepeat((r) => !r)}
          onPickFile={() => fileInputRef.current?.click()}
        />
        <div className="flex">
          <Y2KPlaylist
            tracks={tracks}
            currentId={currentId}
            playing={isPlaying}
            onPlay={goTo}
            onDelete={handleDelete}
            onAdd={() => fileInputRef.current?.click()}
          />
        </div>
      </motion.div>
    </div>
  );
}

