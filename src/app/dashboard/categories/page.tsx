"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Plus,
  FolderOpen,
  Palette,
  GripVertical,
  Trash2,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RAINBOW_COLORS, type RainbowColor } from "@/types";
import { cn } from "@/lib/utils";

const mockCategories = [
  { id: "c1", name: "图片", color: "red" as RainbowColor, icon: "image", fileCount: 12 },
  { id: "c2", name: "文档", color: "green" as RainbowColor, icon: "file-text", fileCount: 8 },
  { id: "c3", name: "视频", color: "orange" as RainbowColor, icon: "video", fileCount: 5 },
  { id: "c4", name: "音频", color: "yellow" as RainbowColor, icon: "music", fileCount: 3 },
  { id: "c5", name: "代码", color: "cyan" as RainbowColor, icon: "code", fileCount: 15 },
  { id: "c6", name: "压缩包", color: "blue" as RainbowColor, icon: "archive", fileCount: 7 },
  { id: "c7", name: "其他", color: "purple" as RainbowColor, icon: "folder", fileCount: 4 },
];

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">分类管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理七彩分类，让文件管理更有条理
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          新建分类
        </Button>
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(RAINBOW_COLORS).map(([key, value]) => (
          <div
            key={key}
            className="inline-flex items-center gap-2 rounded-xl border border-border/50 px-3 py-1.5 text-xs"
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: value.hex }}
            />
            {value.label}
          </div>
        ))}
      </div>

      {/* Categories grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockCategories.map((cat, i) => {
          const colorInfo = RAINBOW_COLORS[cat.color];
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{
                borderColor: `${colorInfo.hex}30`,
                backgroundColor: `${colorInfo.hex}08`,
              }}
            >
              {/* Drag handle */}
              <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Color indicator */}
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${colorInfo.hex}20` }}
              >
                <FolderOpen className="h-7 w-7" style={{ color: colorInfo.hex }} />
              </div>

              <h3 className="font-semibold">{cat.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {cat.fileCount} 个文件
              </p>

              {/* Color bar */}
              <div
                className="mt-4 h-1.5 w-12 rounded-full transition-all duration-300 group-hover:w-full"
                style={{ backgroundColor: colorInfo.hex }}
              />

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
