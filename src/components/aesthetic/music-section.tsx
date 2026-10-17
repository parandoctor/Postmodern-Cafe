"use client";

import * as React from "react";
import { ListMusic, Music, Pause, Play, Plus, Repeat, Shuffle, SkipBack, SkipForward, Square, Trash2, Volume2 } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { useMusicStore } from "@/store/widgets";

function time(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
}

export function MusicSection() {
  const store = useMusicStore();
  const load = useMusicStore((state) => state.load);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [message, setMessage] = React.useState("");
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => { void load(); }, [load]);

  const current = store.tracks.find((track) => track.id === store.currentId) ?? null;
  const index = current ? store.tracks.findIndex((track) => track.id === current.id) : -1;

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setMessage("");
    let done = 0;
    for (const file of files) {
      const result = await store.add(file.name, file.size, file);
      if (result.ok) done += 1;
      else setMessage(result.error ?? "上传失败");
    }
    if (done) setMessage(`已添加 ${done} 首音乐`);
    setUploading(false);
  };

  const remove = async (id: string) => {
    if (!window.confirm("确定删除这首音乐？")) return;
    await store.remove(id);
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(320px,1fr)_minmax(320px,0.9fr)]">
      <section className="border border-[#dedede] p-6">
        <div className="flex items-start justify-between gap-4 border-b border-[#ededed] pb-5">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-[#999]">NOW PLAYING</p>
            <h2 className="mt-2 truncate text-[20px] font-medium" title={current?.name ?? "暂无音乐"}>{current?.name ?? "暂无音乐"}</h2>
            <p className="mt-1 text-[11px] text-[#999]">{store.tracks.length ? `${index + 1} / ${store.tracks.length}` : "添加一首歌开始播放"}</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#dedede]">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full border border-[#dedede]", store.isPlaying && "animate-pulse")}><Music className="h-4 w-4 text-[#555]" strokeWidth={1.5} /></div>
          </div>
        </div>

        <div className="mt-6">
          <input type="range" min={0} max={store.duration || 0} step={0.1} value={Math.min(store.currentTime, store.duration || 0)} onChange={(event) => store.seek(Number(event.target.value))} className="w-full accent-black" disabled={!current} />
          <div className="mt-1 flex justify-between text-[10px] tabular-nums text-[#999]"><span>{time(store.currentTime)}</span><span>{time(store.duration)}</span></div>
        </div>

        <div className="mt-7 flex items-center justify-center gap-2">
          <button onClick={() => void store.prev()} className="p-2 text-[#666] hover:text-black" aria-label="上一首"><SkipBack className="h-4 w-4" /></button>
          <button onClick={() => void store.togglePlay()} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111] text-white" aria-label={store.isPlaying ? "暂停" : "播放"}>{store.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}</button>
          <button onClick={store.stop} className="p-2 text-[#666] hover:text-black" aria-label="停止"><Square className="h-4 w-4" /></button>
          <button onClick={() => void store.next()} className="p-2 text-[#666] hover:text-black" aria-label="下一首"><SkipForward className="h-4 w-4" /></button>
          <button onClick={store.toggleShuffle} className={cn("p-2 hover:text-black", store.shuffle ? "text-black" : "text-[#999]")} aria-label="随机播放"><Shuffle className="h-4 w-4" /></button>
          <button onClick={store.toggleRepeat} className={cn("p-2 hover:text-black", store.repeat ? "text-black" : "text-[#999]")} aria-label="单曲循环"><Repeat className="h-4 w-4" /></button>
        </div>

        <div className="mt-7 flex items-center gap-3 border-t border-[#ededed] pt-4">
          <Volume2 className="h-3.5 w-3.5 text-[#777]" />
          <input type="range" min={0} max={1} step={0.01} value={store.volume} onChange={(event) => store.setVolume(Number(event.target.value))} className="flex-1 accent-black" />
          <button onClick={() => inputRef.current?.click()} disabled={uploading} className="flex items-center gap-1.5 border border-[#dedede] px-3 py-1.5 text-[11px] hover:border-black disabled:opacity-50"><Plus className="h-3 w-3" />{uploading ? "上传中" : "添加音乐"}</button>
          <input ref={inputRef} type="file" accept="audio/*" multiple onChange={upload} className="hidden" />
        </div>
        {message && <p className="mt-3 text-[11px] text-[#888]">{message}</p>}
      </section>

      <section className="border border-[#dedede]">
        <div className="flex h-14 items-center gap-2 border-b border-[#dedede] px-4">
          <ListMusic className="h-4 w-4 text-[#666]" strokeWidth={1.5} />
          <span className="text-[13px] font-medium">播放列表</span>
          <span className="ml-auto text-[11px] tabular-nums text-[#999]">{store.tracks.length} 首</span>
        </div>
        {store.tracks.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <Music className="h-7 w-7 text-[#ccc]" strokeWidth={1.2} />
            <p className="mt-3 text-[13px] text-[#777]">播放列表还是空的。</p>
            <p className="mt-1 text-[11px] text-[#aaa]">上传自己的音乐，它会一直留在这里。</p>
          </div>
        ) : (
          <div className="max-h-[430px] overflow-y-auto">
            {store.tracks.map((track, trackIndex) => {
              const active = track.id === store.currentId;
              return (
                <div key={track.id} className={cn("group flex items-center gap-3 border-b border-[#f0f0f0] px-3 py-3", active && "bg-[#fafafa]")}>
                  <button onClick={() => void store.playTrack(track.id)} className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border", active ? "border-black bg-black text-white" : "border-[#dedede] text-[#777] hover:border-black hover:text-black")} aria-label="播放">
                    {active && store.isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </button>
                  <span className="w-6 shrink-0 text-right text-[10px] tabular-nums text-[#aaa]">{String(trackIndex + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1"><p className={cn("truncate text-[12px]", active ? "font-medium text-black" : "text-[#555]")}>{track.name}</p><p className="mt-0.5 text-[10px] text-[#aaa]">{formatFileSize(track.size)}</p></div>
                  <button onClick={() => void remove(track.id)} className="p-1 text-[#aaa] opacity-0 transition-opacity hover:text-black group-hover:opacity-100" aria-label="删除"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}


