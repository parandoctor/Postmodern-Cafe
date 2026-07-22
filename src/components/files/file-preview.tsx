"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X, Download, FileText, Image, Video, Music, Archive, Code,
  File,
} from "lucide-react";
import { formatFileSize, formatDate, getFileTypeIcon, isPreviewable } from "@/lib/utils";
import type { FileItem } from "@/types";

const FILE_ICON_MAP: Record<string, React.ElementType> = {
  image: Image,
  video: Video,
  audio: Music,
  pdf: FileText,
  word: FileText,
  excel: FileText,
  powerpoint: FileText,
  archive: Archive,
  code: Code,
  file: File,
};

interface FilePreviewProps {
  file: FileItem | null;
  open: boolean;
  onClose: () => void;
  onDownload?: (file: FileItem) => void;
}

export function FilePreview({ file, open, onClose, onDownload }: FilePreviewProps) {
  if (!file) return null;

  const iconType = getFileTypeIcon(file.extension);
  const IconComponent = (FILE_ICON_MAP[iconType] || File) as React.ComponentType<{ className?: string }>;
  const canPreview = isPreviewable(file.mimeType);
  const isImage = file.mimeType.startsWith("image/");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="max-w-2xl">
      <div className="space-y-4">
        {/* Preview area */}
        <div className="flex items-center justify-center rounded-xl border border-border/50 bg-muted/20 p-8">
          {isImage ? (
            <img
              src={file.path}
              alt={file.name}
              className="max-h-64 rounded-lg object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <IconComponent className="h-16 w-16 text-primary/40" />
              <p className="text-sm text-muted-foreground">
                {canPreview ? "可在新窗口中预览" : "不支持预览"}
              </p>
            </div>
          )}
        </div>

        {/* File info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">文件名</p>
            <p className="font-medium truncate">{file.originalName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">大小</p>
            <p className="font-medium">{formatFileSize(file.size)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">类型</p>
            <p className="font-medium">{file.extension.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">上传时间</p>
            <p className="font-medium">{formatDate(file.createdAt)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onDownload && (
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => onDownload(file)}
            >
              <Download className="h-4 w-4" /> 下载
            </Button>
          )}
          {canPreview && (
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => window.open(file.path, "_blank")}
            >
              新窗口预览
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
