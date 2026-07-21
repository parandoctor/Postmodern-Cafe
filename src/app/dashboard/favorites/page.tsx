"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Heart, FileText, FolderOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize, formatRelativeTime } from "@/lib/utils";

const mockFavorites = [
  {
    id: "f1",
    name: "项目设计方案.pdf",
    size: 2457600,
    updatedAt: new Date("2026-07-20"),
  },
  {
    id: "f2",
    name: "品牌Logo设计稿.ai",
    size: 5120000,
    updatedAt: new Date("2026-07-18"),
  },
  {
    id: "f3",
    name: "团队合照.jpg",
    size: 3584000,
    updatedAt: new Date("2026-07-15"),
  },
];

export default function FavoritesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">收藏夹</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          你收藏的常用文件
        </p>
      </div>

      {mockFavorites.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockFavorites.map((file, i) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5">
                  <FileText className="h-6 w-6 text-primary/70" />
                </div>
                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
              </div>
              <h3 className="mt-4 font-medium truncate">{file.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatFileSize(file.size)} · {formatRelativeTime(file.updatedAt)}
              </p>
              <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <ExternalLink className="h-3.5 w-3.5" /> 打开
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 mb-6">
            <Heart className="h-10 w-10 text-primary/40" />
          </div>
          <h3 className="text-lg font-medium">还没有收藏</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            在文件中点击星标即可收藏
          </p>
        </div>
      )}
    </div>
  );
}
