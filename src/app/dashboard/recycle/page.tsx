"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Trash2, RotateCcw, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize, formatRelativeTime } from "@/lib/utils";

const mockRecycle = [
  { id: "d1", name: "旧版设计稿.psd", size: 102400000, deletedAt: new Date("2026-07-18") },
  { id: "d2", name: "临时文件.txt", size: 1024, deletedAt: new Date("2026-07-17") },
];

export default function RecyclePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">回收站</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            已删除的文件将在30天后自动永久删除
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-destructive">注意</p>
          <p className="text-xs text-muted-foreground mt-1">
            回收站中的文件将在30天后自动永久删除，请及时恢复需要的文件。
          </p>
        </div>
      </div>

      {mockRecycle.length > 0 ? (
        <div className="rounded-2xl border border-border/50 overflow-hidden">
          <div className="divide-y divide-border/30">
            {mockRecycle.map((file, i) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/5">
                  <FileText className="h-5 w-5 text-destructive/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} · 已删除 {formatRelativeTime(file.deletedAt)}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <RotateCcw className="h-3.5 w-3.5" /> 恢复
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 mb-6">
            <Trash2 className="h-10 w-10 text-primary/40" />
          </div>
          <h3 className="text-lg font-medium">回收站为空</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            删除的文件将出现在这里
          </p>
        </div>
      )}
    </div>
  );
}
