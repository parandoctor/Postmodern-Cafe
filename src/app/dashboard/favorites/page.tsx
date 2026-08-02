"use client";

import * as React from "react";
import { Heart, FileText, Trash2, Download, Eye, Image, Video, Music, Archive, Code, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilePreview } from "@/components/files/file-preview";
import { formatFileSize, formatRelativeTime, getFileTypeIcon, cn, getContrastColor } from "@/lib/utils";
import { getFavorites, toggleFavorite, deleteFiles } from "@/actions/files";
import type { FileItem } from "@/types";
import { RAINBOW_COLORS } from "@/types";

const FILE_ICON_MAP: Record<string, React.ElementType> = {
  image: Image, video: Video, audio: Music, pdf: FileText,
  word: FileText, excel: FileText, powerpoint: FileText,
  archive: Archive, code: Code, text: FileText, markdown: FileText,
  file: File,
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = React.useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [previewFile, setPreviewFile] = React.useState<FileItem | null>(null);

  const loadFavorites = React.useCallback(async () => {
    try {
      const res = await getFavorites();
      if (res.success && res.data) setFavorites(res.data);
    } catch (err) {
      console.error("加载收藏失败:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => { loadFavorites(); }, [loadFavorites]);

  const handleUnfavorite = async (fileId: string) => {
    await toggleFavorite(fileId);
    setFavorites((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("确定要删除该文件吗？")) return;
    await deleteFiles([fileId]);
    setFavorites((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleDownload = (file: FileItem) => {
    const a = document.createElement("a");
    a.href = file.path;
    a.download = file.originalName;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">收藏夹</h1>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">收藏夹 · {favorites.length} 个</h1>

      {favorites.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((file) => {
            const iconType = getFileTypeIcon(file.extension);
            const IconComponent = (FILE_ICON_MAP[iconType] || File) as React.ComponentType<{ className?: string }>;
            return (
              <div
                key={file.id}
                className="group relative rounded-lg border border-whisper bg-white/60 backdrop-blur-sm p-4 hover:border-foreground/25 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <button onClick={() => handleUnfavorite(file.id)}>
                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                  </button>
                </div>
                <h3 className="mt-3 font-medium text-sm truncate">{file.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatFileSize(file.size)} · {formatRelativeTime(file.updatedAt)}
                </p>
                {file.category && (() => {
                  const hex = RAINBOW_COLORS[file.category.color]?.hex ?? "#888";
                  return (
                    <span
                      className="mt-2 inline-block rounded px-1.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${hex}1a`,
                        color: getContrastColor(hex),
                      }}
                    >
                      {file.category.name}
                    </span>
                  );
                })()}
                <div className="mt-3 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setPreviewFile(file)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground" title="预览">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDownload(file)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground" title="下载">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(file.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive ml-auto" title="删除">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Heart className="h-10 w-10 mb-4 opacity-30" />
          <p className="text-sm">还没有收藏</p>
          <p className="text-xs mt-1 opacity-70">在文件中点击心形图标即可收藏</p>
        </div>
      )}

      <FilePreview
        file={previewFile}
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={handleDownload}
      />
    </div>
  );
}
