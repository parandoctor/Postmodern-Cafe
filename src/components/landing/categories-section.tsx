"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Folder,
  Image,
  FileText,
  Music,
  Video,
  Archive,
  Code,
  File,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RainbowColor } from "@/types";
import { RAINBOW_COLORS } from "@/types";

const categoryItems: Array<{
  color: RainbowColor;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  description: string;
}> = [
  { color: "red", icon: Image, label: "图片", description: "JPEG, PNG, GIF, WebP..." },
  { color: "orange", icon: Video, label: "视频", description: "MP4, WebM, MOV..." },
  { color: "yellow", icon: Music, label: "音频", description: "MP3, WAV, FLAC..." },
  { color: "green", icon: FileText, label: "文档", description: "PDF, Word, Excel..." },
  { color: "cyan", icon: Code, label: "代码", description: "JS, TS, Python, Java..." },
  { color: "blue", icon: Archive, label: "压缩包", description: "ZIP, RAR, 7z..." },
  { color: "purple", icon: Folder, label: "其他", description: "任意格式文件..." },
];

function CategoryCard({
  color,
  icon: Icon,
  label,
  description,
  index,
}: {
  color: RainbowColor;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  description: string;
  index: number;
}) {
  const colorInfo = RAINBOW_COLORS[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border p-6 transition-all duration-500",
          "hover:shadow-xl hover:-translate-y-1",
        )}
        style={{
          borderColor: `${colorInfo.hex}30`,
          backgroundColor: `${colorInfo.hex}08`,
        }}
      >
        {/* Hover glow */}
        <div
          className="absolute -inset-20 opacity-0 transition-opacity duration-500 group-hover:opacity-20"
          style={{
            background: `radial-gradient(circle at center, ${colorInfo.hex}, transparent 70%)`,
          }}
        />

        {/* Icon */}
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg"
          style={{
            backgroundColor: `${colorInfo.hex}20`,
            boxShadow: `0 0 0 0 ${colorInfo.hex}00`,
          }}
        >
          <Icon className="h-7 w-7 transition-transform duration-500 group-hover:scale-110" style={{ color: colorInfo.hex }} />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold">{label}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>

        {/* Color bar */}
        <div
          className="mt-4 h-1.5 w-12 rounded-full transition-all duration-500 group-hover:w-full"
          style={{ backgroundColor: colorInfo.hex }}
        />
      </div>
    </motion.div>
  );
}

export function CategoriesSection() {
  return (
    <section id="categories" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            七彩<span className="rainbow-text">分类</span>体系
          </h2>
          <p className="mt-4 text-muted-foreground">
            每个颜色对应一种文件类型，统一的视觉规范让文件管理一目了然。
            红橙黄绿青蓝紫，让文件像彩虹一样有序。
          </p>
        </motion.div>

        {/* Category grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          {categoryItems.map((item, index) => (
            <CategoryCard key={item.color} {...item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
