"use client";

import * as React from "react";
import { Clock, FileText, ExternalLink, Download, Eye, Image, Video, Music, Archive, Code, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilePreview } from "@/components/files/file-preview";
import { formatFileSize, formatRelativeTime, getFileTypeIcon } from "@/lib/utils";
import { getRecentFiles } from "@/actions/files";
import type { FileItem } from "@/types";

const FILE_ICON_MAP: Record<string, React.ElementType> = {
  image: Image, video: Video, audio: Music, pdf: FileText,
  word: FileText, excel: FileText, powerpoint: FileText,
  archive: Archive, code: Code, text: FileText, markdown: FileText,
  file: File,
};

export function RecentView() {
  const [files, setFiles] = React.useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [previewFile, setPreviewFile] = React.useState<FileItem | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await getRecentFiles(20);
        if (res.success && res.data) setFiles(res.data);
      } catch (err) {
        console.error("加载最近文件失败:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleDownload = (file: FileItem) => {
    const a = document.createElement("a");
    a.href = file.path;
    a.download = file.originalName;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">最近使用</h1>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">最近使用 · {files.length} 个</h1>

      {files.length > 0 ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {files.map((file) => {
              const iconType = getFileTypeIcon(file.extension);
              const IconComponent = (FILE_ICON_MAP[iconType] || File) as React.ComponentType<{ className?: string }>;
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} · {formatRelativeTime(file.updatedAt)}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    <button onClick={() => setPreviewFile(file)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground" title="预览">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDownload(file)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground" title="下载">
                      <Download className="h-4 w-4" />
                    </button>
                    <button onClick={() => window.open(file.path, "_blank")} className="p-1.5 rounded hover:bg-secondary text-muted-foreground" title="打开">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Clock className="h-10 w-10 mb-4 opacity-30" />
          <p className="text-sm">还没有最近使用的文件</p>
          <p className="text-xs mt-1 opacity-70">上传一些文件后，它们会出现在这里</p>
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

