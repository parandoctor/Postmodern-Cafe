"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FolderOpen,
  File,
  Star,
  Clock,
  Grid3X3,
  List,
  MoreHorizontal,
  Download,
  Trash2,
  Heart,
  Eye,
  FileText,
  Image,
  Music,
  Video,
  Archive,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFileStore } from "@/store";
import { formatFileSize, formatRelativeTime, getFileTypeIcon } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { FileItem } from "@/types";

// Mock data for demonstration
const mockFiles: FileItem[] = [
  {
    id: "1", name: "项目设计方案.pdf", originalName: "项目设计方案.pdf",
    extension: "pdf", mimeType: "application/pdf", size: 2457600,
    path: "/mock/project.pdf", thumbnailPath: null,
    categoryId: "c1", isFavorite: true, isDeleted: false,
    deletedAt: null, createdAt: new Date("2026-07-20"), updatedAt: new Date("2026-07-20"),
  },
  {
    id: "2", name: "会议照片.jpg", originalName: "会议照片.jpg",
    extension: "jpg", mimeType: "image/jpeg", size: 3584000,
    path: "/mock/photo.jpg", thumbnailPath: null,
    categoryId: "c2", isFavorite: false, isDeleted: false,
    deletedAt: null, createdAt: new Date("2026-07-19"), updatedAt: new Date("2026-07-19"),
  },
];

export default function FilesPage() {
  const { files, viewMode, setViewMode } = useFileStore();
  const displayFiles = files.length > 0 ? files : mockFiles;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">我的文件</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理你上传的所有文件
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center rounded-xl border border-border/50 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-lg p-2 transition-colors",
                viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-lg p-2 transition-colors",
                viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            上传文件
          </Button>
        </div>
      </div>

      {/* Files Area */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayFiles.map((file, i) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              {/* File icon */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/10">
                <FileText className="h-8 w-8 text-primary/70" />
              </div>

              {/* File name */}
              <h3 className="font-medium truncate">{file.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatFileSize(file.size)} · {formatRelativeTime(file.createdAt)}
              </p>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Star className={cn("h-4 w-4", file.isFavorite && "fill-yellow-500 text-yellow-500")} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">大小</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">修改时间</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {displayFiles.map((file) => (
                <tr key={file.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5">
                        <FileText className="h-5 w-5 text-primary/70" />
                      </div>
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatFileSize(file.size)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-lg bg-primary/5 px-2 py-1 text-xs text-primary">
                      {file.extension.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatRelativeTime(file.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {displayFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 mb-6">
            <Upload className="h-10 w-10 text-primary/40" />
          </div>
          <h3 className="text-lg font-medium">还没有文件</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            拖拽文件到此处或点击上传按钮开始
          </p>
        </div>
      )}
    </div>
  );
}
