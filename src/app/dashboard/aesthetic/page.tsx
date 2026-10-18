"use client";

import * as React from "react";
import { Image as ImageIcon, Music2 } from "lucide-react";
import { MusicSection } from "@/components/aesthetic/music-section";
import { ImageEditor } from "@/components/aesthetic/image-editor";
import { MotionButton } from "@/components/ui/motion-button";

type Tab = "music" | "image";

export default function AestheticPage() {
  const [tab, setTab] = React.useState<Tab>("music");

  React.useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("tab");
    if (value === "image" || value === "music") setTab(value);
  }, []);

  const changeTab = (next: Tab) => {
    setTab(next);
    window.history.replaceState(null, "", `/dashboard/aesthetic?tab=${next}`);
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#dedede] pb-5">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-[#999]">AESTHETIC SPACE</p>
          <h1 className="mt-2 font-editorial text-[32px] tracking-[-0.03em]">美学空间</h1>
          <p className="mt-2 text-[12px] text-[#888]">音乐与图片，两件和感受有关的事。</p>
        </div>
        <div className="flex border border-[#dedede] p-0.5">
          <MotionButton onClick={() => changeTab("music")} variant={tab === "music" ? "primary" : "ghost"} size="sm" className="h-8 rounded-none px-4" icon={<Music2 className="h-3.5 w-3.5" />}>音乐</MotionButton>
          <MotionButton onClick={() => changeTab("image")} variant={tab === "image" ? "primary" : "ghost"} size="sm" className="h-8 rounded-none px-4" icon={<ImageIcon className="h-3.5 w-3.5" />}>图片</MotionButton>
        </div>
      </div>

      {tab === "music" ? <MusicSection /> : <ImageEditor />}
    </div>
  );
}


