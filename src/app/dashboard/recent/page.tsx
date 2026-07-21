"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Clock, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize, formatRelativeTime } from "@/lib/utils";

const mockRecent = [
  { id: "r1", name: "项目设计方案.pdf", size: 2457600, updatedAt: new Date("2026-07-21") },
  { id: "r2", name: "会议记录.docx", size: 1024000, updatedAt: new Date("2026-07-21") },
  { id: "r3", name: "数据分析报告.xlsx", size: 5120000, updatedAt: new Date("2026-07-20") },
  { id: "r4", name: "团队合照.jpg", size: 3584000, updatedAt: new Date("2026-07-19") },
];

export default function RecentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">最近使用</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          最近访问和修改的文件
        </p>
      </div>

      <div className="rounded-2xl border border-border/50 overflow-hidden">
        <div className="divide-y divide-border/30">
          {mockRecent.map((file, i) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5">
                <FileText className="h-5 w-5 text-primary/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} · {formatRelativeTime(file.updatedAt)}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
