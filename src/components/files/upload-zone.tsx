"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileUp, X, Check, Loader2 } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB per chunk
const CHUNK_THRESHOLD = 2 * 1024 * 1024; // files > 2MB use chunked upload

interface UploadZoneProps {
  onUpload: (file: File) => Promise<boolean>;
  onComplete?: () => void;
  categoryId?: string;
  maxSize?: number;
  accept?: Record<string, string[]>;
  className?: string;
}

type FileStatus = {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  chunkProgress?: { uploaded: number; total: number };
  sessionId?: string;
};

export function UploadZone({
  onUpload,
  onComplete,
  categoryId,
  maxSize = 100 * 1024 * 1024,
  accept,
  className,
}: UploadZoneProps) {
  const [fileStatuses, setFileStatuses] = React.useState<FileStatus[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const abortRef = React.useRef(false);

  const totalFiles = fileStatuses.length;
  const completedCount = fileStatuses.filter((f) => f.status === "done").length;
  const currentIdx = fileStatuses.findIndex((f) => f.status === "uploading");

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFileStatuses((prev) => [
        ...prev,
        ...acceptedFiles.map((f) => ({ file: f, status: "pending" as const })),
      ]);
    },
    maxSize,
    accept,
    multiple: true,
    disabled: isUploading,
  });

  // --- Chunked upload helpers ---

  const initChunkSession = async (file: File): Promise<string | undefined> => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const form = new FormData();
    form.append("action", "init");
    form.append("fileName", file.name);
    form.append("fileSize", String(file.size));
    form.append("mimeType", file.type || "application/octet-stream");
    form.append("totalChunks", String(totalChunks));
    form.append("chunkSize", String(CHUNK_SIZE));
    if (categoryId) form.append("categoryId", categoryId);

    const res = await fetch("/api/upload/chunk", { method: "POST", body: form });
    const data = await res.json();
    return data.success ? data.data.sessionId : undefined;
  };

  const uploadChunk = async (sessionId: string, file: File, chunkIndex: number): Promise<boolean> => {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const blob = file.slice(start, end);

    const form = new FormData();
    form.append("action", "chunk");
    form.append("sessionId", sessionId);
    form.append("chunkIndex", String(chunkIndex));
    form.append("chunk", blob, `chunk-${chunkIndex}`);

    const res = await fetch("/api/upload/chunk", { method: "POST", body: form });
    const data = await res.json();
    return data.success;
  };

  const completeChunkSession = async (sessionId: string): Promise<boolean> => {
    const form = new FormData();
    form.append("action", "complete");
    form.append("sessionId", sessionId);

    const res = await fetch("/api/upload/chunk", { method: "POST", body: form });
    const data = await res.json();
    return data.success;
  };

  const getSessionStatus = async (sessionId: string): Promise<number[] | undefined> => {
    try {
      const res = await fetch(`/api/upload/chunk?sessionId=${sessionId}`);
      const data = await res.json();
      return data.success ? data.data.uploadedChunks : undefined;
    } catch {
      return undefined;
    }
  };

  // --- Upload logic ---

  const uploadFileChunked = async (idx: number, fs: FileStatus): Promise<boolean> => {
    // Init session (or resume)
    let sessionId = fs.sessionId;
    let startChunk = 0;

    if (sessionId) {
      // Resume: check which chunks are already uploaded
      const uploaded = await getSessionStatus(sessionId);
      if (uploaded && uploaded.length > 0) {
        startChunk = uploaded[uploaded.length - 1]! + 1;
      }
    }

    if (!sessionId || startChunk === 0) {
      sessionId = await initChunkSession(fs.file);
      if (!sessionId) return false;
      setFileStatuses((prev) =>
        prev.map((f, i) => (i === idx ? { ...f, sessionId } : f))
      );
    }

    const totalChunks = Math.ceil(fs.file.size / CHUNK_SIZE);

    for (let ci = startChunk; ci < totalChunks; ci++) {
      if (abortRef.current) return false;

      // Update chunk progress
      setFileStatuses((prev) =>
        prev.map((f, i) =>
          i === idx
            ? { ...f, chunkProgress: { uploaded: ci, total: totalChunks } }
            : f
        )
      );

      const ok = await uploadChunk(sessionId!, fs.file, ci);
      if (!ok) {
        setFileStatuses((prev) =>
          prev.map((f, i) => (i === idx ? { ...f, status: "error" as const } : f))
        );
        return false;
      }
    }

    // Complete
    const ok = await completeChunkSession(sessionId!);
    return ok;
  };

  const handleUpload = async () => {
    if (fileStatuses.length === 0 || isUploading) return;
    setIsUploading(true);
    abortRef.current = false;

    for (let i = 0; i < fileStatuses.length; i++) {
      if (abortRef.current) break;
      const fs = fileStatuses[i]!;
      setFileStatuses((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: "uploading" as const } : f))
      );

      let ok: boolean;
      if (fs.file.size > CHUNK_THRESHOLD) {
        ok = await uploadFileChunked(i, fs);
      } else {
        ok = await onUpload(fs.file);
      }

      setFileStatuses((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: ok ? ("done" as const) : ("error" as const) } : f
        )
      );
    }

    setIsUploading(false);

    // Cleanup done/error after a delay
    setTimeout(() => {
      setFileStatuses((prev) =>
        prev.filter((f) => f.status !== "done")
      );
    }, 2000);

    onComplete?.();
  };

  const removeFile = (index: number) => {
    setFileStatuses((prev) => prev.filter((_, i) => i !== index));
  };

  const hasPending = fileStatuses.some((f) => f.status === "pending");
  const hasError = fileStatuses.some((f) => f.status === "error");
  const showRetry = hasError && !isUploading;
  const allDone = totalFiles > 0 && completedCount === totalFiles;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-lg border-2 border-dashed px-6 py-5 text-center transition-colors",
          isDragActive && !isDragReject
            ? "border-foreground/30 bg-secondary"
            : isDragReject
              ? "border-destructive/50 bg-destructive/5"
              : "border-border hover:border-foreground/20 hover:bg-secondary/30",
          isUploading && "pointer-events-none opacity-60",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            {isDragActive ? (
              <FileUp className="h-5 w-5 text-foreground" />
            ) : (
              <Upload className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm">
              {isDragActive ? "松开以添加文件" : "拖拽文件到此处，或点击选择"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              单个文件最大 {formatFileSize(maxSize)}，超过 2MB 自动分片上传
            </p>
          </div>
        </div>
      </div>

      {/* File list */}
      {fileStatuses.length > 0 && (
        <div className="space-y-2">
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between mb-2 gap-3">
              <p className="text-xs text-muted-foreground shrink-0">
                {isUploading
                  ? `上传中 ${completedCount + 1}/${totalFiles}`
                  : allDone
                    ? "上传完成"
                    : `待上传 (${totalFiles} 个文件)`}
              </p>
              {isUploading && (
                <div className="h-1 flex-1 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-foreground transition-all duration-300"
                    style={{ width: `${(completedCount / totalFiles) * 100}%` }}
                  />
                </div>
              )}
            </div>
            <div className="max-h-52 space-y-1.5 overflow-y-auto">
              {fileStatuses.map((fs, i) => (
                <div
                  key={`${fs.file.name}-${i}`}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2",
                    fs.status === "uploading"
                      ? "bg-foreground/5"
                      : fs.status === "done"
                        ? "bg-secondary/30"
                        : fs.status === "error"
                          ? "bg-destructive/10"
                          : "bg-secondary/50",
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {fs.status === "uploading" ? (
                      <Loader2 className="h-3.5 w-3.5 shrink-0 text-foreground animate-spin" />
                    ) : fs.status === "done" ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
                    ) : fs.status === "error" ? (
                      <X className="h-3.5 w-3.5 shrink-0 text-destructive" />
                    ) : (
                      <FileUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="truncate text-sm">{fs.file.name}</span>
                      <span className="text-xs text-muted-foreground ml-2 shrink-0">
                        {formatFileSize(fs.file.size)}
                      </span>
                      {/* Chunk progress sub-bar */}
                      {fs.chunkProgress && fs.status === "uploading" && (
                        <div className="mt-1 h-0.5 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-foreground/60 transition-all duration-200"
                            style={{ width: `${(fs.chunkProgress.uploaded / fs.chunkProgress.total) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {!isUploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      className="ml-2 rounded p-0.5 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleUpload}
            disabled={isUploading || (!hasPending && !showRetry)}
            className="w-full rounded-lg bg-foreground py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isUploading
              ? `上传中 ${completedCount + 1}/${totalFiles}...`
              : showRetry
                ? "重试上传"
                : `上传 ${totalFiles} 个文件`}
          </button>
        </div>
      )}
    </div>
  );
}

