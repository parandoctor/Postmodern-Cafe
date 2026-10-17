"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { Check, FileUp, Loader2, Upload, X } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

const CHUNK_SIZE = 2 * 1024 * 1024;
const CHUNK_THRESHOLD = 2 * 1024 * 1024;

type FileStatus = { file: File; status: "pending" | "uploading" | "done" | "error"; progress?: number; sessionId?: string };

export function UploadZone({
  onUpload,
  onComplete,
  maxSize = 100 * 1024 * 1024,
  className,
}: {
  onUpload: (file: File) => Promise<boolean>;
  onComplete?: () => void;
  maxSize?: number;
  className?: string;
}) {
  const [files, setFiles] = React.useState<FileStatus[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    maxSize,
    disabled: uploading,
    onDrop: (accepted) => setFiles((current) => [...current, ...accepted.map((file) => ({ file, status: "pending" as const }))]),
  });

  const initSession = async (file: File) => {
    const form = new FormData();
    form.append("action", "init");
    form.append("fileName", file.name);
    form.append("fileSize", String(file.size));
    form.append("mimeType", file.type || "application/octet-stream");
    form.append("totalChunks", String(Math.ceil(file.size / CHUNK_SIZE)));
    form.append("chunkSize", String(CHUNK_SIZE));
    const response = await fetch("/api/upload/chunk", { method: "POST", body: form });
    const data = await response.json();
    return data.success ? (data.data.sessionId as string) : undefined;
  };

  const uploadChunked = async (file: File, onProgress: (value: number) => void) => {
    const sessionId = await initSession(file);
    if (!sessionId) return false;
    const total = Math.ceil(file.size / CHUNK_SIZE);
    for (let index = 0; index < total; index++) {
      const form = new FormData();
      form.append("action", "chunk");
      form.append("sessionId", sessionId);
      form.append("chunkIndex", String(index));
      form.append("chunk", file.slice(index * CHUNK_SIZE, Math.min((index + 1) * CHUNK_SIZE, file.size)), `chunk-${index}`);
      const response = await fetch("/api/upload/chunk", { method: "POST", body: form });
      const data = await response.json();
      if (!data.success) return false;
      onProgress((index + 1) / total);
    }
    const complete = new FormData();
    complete.append("action", "complete");
    complete.append("sessionId", sessionId);
    const response = await fetch("/api/upload/chunk", { method: "POST", body: complete });
    const data = await response.json();
    return Boolean(data.success);
  };

  const runUpload = async () => {
    if (uploading) return;
    setUploading(true);
    for (let index = 0; index < files.length; index++) {
      if (files[index]?.status === "done") continue;
      setFiles((current) => current.map((item, i) => (i === index ? { ...item, status: "uploading", progress: 0 } : item)));
      const file = files[index]!.file;
      const ok = file.size > CHUNK_THRESHOLD
        ? await uploadChunked(file, (value) => setFiles((current) => current.map((item, i) => (i === index ? { ...item, progress: value } : item))))
        : await onUpload(file);
      setFiles((current) => current.map((item, i) => (i === index ? { ...item, status: ok ? "done" : "error", progress: 1 } : item)));
    }
    setUploading(false);
    onComplete?.();
  };

  const pending = files.some((item) => item.status !== "done");
  const done = files.filter((item) => item.status === "done").length;

  return (
    <div className={cn("space-y-3", className)}>
      <div {...getRootProps()} className={cn("cursor-pointer border border-dashed border-[#d3d3d3] px-5 py-5 text-center transition-colors hover:border-black", isDragActive && "border-black bg-[#fafafa]", uploading && "pointer-events-none opacity-60")}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center border border-[#dedede]"><Upload className="h-4 w-4" strokeWidth={1.5} /></span>
          <p className="text-[13px]">{isDragActive ? "松开以添加" : "拖入文件，或点击选择"}</p>
          <p className="text-[11px] text-[#999]">图片、视频、文档、音频与压缩包 · 单文件最大 {formatFileSize(maxSize)}</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="border border-[#e2e2e2]">
          {files.map((item, index) => (
            <div key={`${item.file.name}-${index}`} className="flex items-center gap-3 border-b border-[#ededed] px-3 py-2 last:border-b-0">
              {item.status === "uploading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : item.status === "done" ? <Check className="h-3.5 w-3.5" /> : item.status === "error" ? <X className="h-3.5 w-3.5" /> : <FileUp className="h-3.5 w-3.5 text-[#999]" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3"><span className="truncate text-[12px]">{item.file.name}</span><span className="text-[10px] tabular-nums text-[#999]">{formatFileSize(item.file.size)}</span></div>
                {item.status === "uploading" && <div className="mt-1 h-px bg-[#ededed]"><div className="h-px bg-black transition-[width]" style={{ width: `${(item.progress ?? 0) * 100}%` }} /></div>}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-[#ededed] px-3 py-2">
            <span className="text-[11px] text-[#999]">{uploading ? "正在上传" : done === files.length ? "上传完成" : "等待上传"}</span>
            <button onClick={runUpload} disabled={uploading || !pending} className="bg-[#111] px-3 py-1.5 text-[11px] text-white disabled:opacity-40">{uploading ? "上传中..." : "开始上传"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
