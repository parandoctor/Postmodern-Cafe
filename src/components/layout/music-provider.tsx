"use client";

import * as React from "react";
import { useMusicStore } from "@/store/widgets";

export function MusicProvider() {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const attachAudio = useMusicStore((state) => state.attachAudio);
  const syncPlayback = useMusicStore((state) => state.syncPlayback);
  const syncTime = useMusicStore((state) => state.syncTime);
  const syncDuration = useMusicStore((state) => state.syncDuration);
  const handleEnded = useMusicStore((state) => state.handleEnded);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    attachAudio(audio);
    const onPlay = () => syncPlayback(true);
    const onPause = () => syncPlayback(false);
    const onTime = () => syncTime(audio.currentTime);
    const onDuration = () => syncDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onEnded = () => void handleEnded();
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.removeAttribute("src");
      attachAudio(null);
    };
  }, [attachAudio, handleEnded, syncDuration, syncPlayback, syncTime]);

  return <audio ref={audioRef} preload="metadata" className="hidden" aria-hidden="true" />;
}
