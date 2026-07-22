"use client";

import * as React from "react";
import { Trash2, RotateCcw, FileText, AlertTriangle, Image, Video, Music, Archive, Code, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize, formatRelativeTime, getFileTypeIcon } from "@/lib/utils";
import { getRecycleBin, restoreFiles, permanentlyDeleteFiles } from "@/actions/files";
import type { FileItem } from "@/types";

const FILE_ICON_MAP: Record<string, React.ElementType> = {
  image: Image, video: Video, audio: Music, pdf: FileText,
  word: FileText, excel: FileText, powerpoint: FileText,
  archive: Archive, code: Code, text: FileText, markdown: FileText,
  file: File,
};

export default function RecyclePage() {
  const [items, setItems] = React.useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [message, setMessage] = React.useState("");

  const loadItems = React.useCallback(async () => {
    try {
      const res = await getRecycleBin();
      if (res.success && res.data) setItems(res.data);
    } catch (err) {
      console.error("加载回收站失败:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => { loadItems(); }, [loadItems]);

  const handleRestore = async (fileIds: string[]) => {
    const res = await restoreFiles(fileIds);
    if (res.success) setMessage(res.message ?? "文件已恢复");
    await loadItems();
    setTimeout(() => setMessage(""), 3000);
  };

  const handlePermanentDelete = async (fileIds: string[]) => {
    if (!confirm(`确定要永久删除 ${fileIds.length} 个文件吗？此操作不可恢复！`)) return;
    const res = await permanentlyDeleteFiles(fileIds);
    if (res.success) setMessage(res.message ?? "文件已永久删除");
    await loadItems();
    setTimeout(() => setMessage(""), 3000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">回收站</h1>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm">{message}</div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">回收站</h1>
          <p className="text-xs text-muted-foreground mt-1">
            30天后自动永久删除 · {items.length} 个文件
          </p>
        </div>
        {items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-destructive"
            onClick={() => handlePermanentDelete(items.map((i) => i.id))}
          >
            <Trash2 className="h-4 w-4" /> 清空回收站
          </Button>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
        <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          回收站中的文件将在30天后自动永久删除，请及时恢复需要的文件。
        </p>
      </div>

      {items.length > 0 ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {items.map((file) => {
              const iconType = getFileTypeIcon(file.extension);
              const IconComponent = (FILE_ICON_MAP[iconType] || File) as React.ComponentType<{ className?: string }>;
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/5">
                    <IconComponent className="h-4 w-4 text-destructive/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} · 已删除 {file.deletedAt ? formatRelativeTime(file.deletedAt) : "-"}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => handleRestore([file.id])}>
                      <RotateCcw className="h-3 w-3" /> 恢复
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handlePermanentDelete([file.id])}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Trash2 className="h-10 w-10 mb-4 opacity-30" />
          <p className="text-sm">回收站为空</p>
          <p className="text-xs mt-1 opacity-70">删除的文件将出现在这里</p>
        </div>
      )}
    </div>
  );
}
