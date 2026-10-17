"use client";

import * as React from "react";
import NextImage from "next/image";
import { ChevronDown, Download, Eye, File, FileText, Image as ImageIcon, Music, Trash2, Video } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import type { FileItem } from "@/types";
import { deleteFile, getFiles, uploadFile } from "@/actions/files";
import { UploadZone } from "@/components/files/upload-zone";
import { Dialog } from "@/components/ui/dialog";

function iconFor(file: FileItem) {
  if (file.mimeType.startsWith("image/")) return ImageIcon;
  if (file.mimeType.startsWith("video/")) return Video;
  if (file.mimeType.startsWith("audio/")) return Music;
  if (file.mimeType === "application/pdf" || file.extension.match(/docx?|xlsx?|pptx?/)) return FileText;
  return File;
}

function canPreview(file: FileItem) {
  return file.mimeType.startsWith("image/") || file.mimeType.startsWith("video/") || file.mimeType.startsWith("audio/") || file.mimeType === "application/pdf" || file.mimeType.startsWith("text/");
}

export function FileDrawer() {
  const [open, setOpen] = React.useState(false);
  const [files, setFiles] = React.useState<FileItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [preview, setPreview] = React.useState<FileItem | null>(null);

  const loadFiles = React.useCallback(async () => {
    setLoading(true);
    const result = await getFiles({ pageSize: 100 });
    if (result.success && result.data) setFiles(result.data.items);
    else setMessage(result.error ?? "读取文件失败");
    setLoading(false);
  }, []);

  React.useEffect(() => { void loadFiles(); }, [loadFiles]);

  const handleSmallUpload = async (file: globalThis.File) => {
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadFile(formData);
    if (!result.success) setMessage(result.error ?? "上传失败");
    return result.success;
  };

  const handleDelete = async (file: FileItem) => {
    if (!window.confirm(`确定删除「${file.name}」？此操作不可恢复。`)) return;
    const result = await deleteFile(file.id);
    if (result.success) setFiles((current) => current.filter((item) => item.id !== file.id));
    else setMessage(result.error ?? "删除失败");
  };

  return (
    <section className="mt-8 border-t border-[#dedede]">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-2 py-4 text-left">
        <ChevronDown className={cn("h-4 w-4 text-[#888] transition-transform", !open && "-rotate-90")} />
        <span className="text-[14px] font-medium">文件</span>
        <span className="text-[11px] tabular-nums text-[#aaa]">{files.length}</span>
        <span className="ml-auto text-[11px] text-[#999]">{open ? "收起" : "图片、视频与文档"}</span>
      </button>

      {open && (
        <div className="pb-6">
          <UploadZone onUpload={handleSmallUpload} onComplete={loadFiles} />
          {message && <p className="mt-3 text-[11px] text-[#777]">{message}</p>}
          {loading ? <p className="py-8 text-center text-[12px] text-[#999]">正在读取文件...</p> : files.length === 0 ? (
            <p className="py-8 text-center text-[12px] text-[#999]">文件抽屉还是空的。</p>
          ) : (
            <div className="mt-5 grid gap-px bg-[#dedede] sm:grid-cols-2 xl:grid-cols-3">
              {files.map((file) => {
                const Icon = iconFor(file);
                return (
                  <div key={file.id} className="group flex min-w-0 items-center gap-3 bg-white px-3 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#ededed]"><Icon className="h-4 w-4 text-[#666]" strokeWidth={1.5} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px]" title={file.name}>{file.name}</p>
                      <p className="mt-0.5 text-[10px] tabular-nums text-[#999]">{formatFileSize(file.size)} · {new Date(file.createdAt).toLocaleDateString("zh-CN")}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                      <button onClick={() => canPreview(file) ? setPreview(file) : window.open(file.path, "_blank", "noopener,noreferrer")} className="p-1.5 text-[#777] hover:text-black" title="预览"><Eye className="h-3.5 w-3.5" /></button>
                      <a href={file.path} download className="p-1.5 text-[#777] hover:text-black" title="下载"><Download className="h-3.5 w-3.5" /></a>
                      <button onClick={() => void handleDelete(file)} className="p-1.5 text-[#777] hover:text-black" title="删除"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} title={preview?.name} description={preview ? `${formatFileSize(preview.size)} · ${preview.extension.toUpperCase()}` : undefined} maxWidth="max-w-4xl">
        {preview?.mimeType.startsWith("image/") && <NextImage src={preview.path} alt={preview.name} width={1200} height={800} unoptimized className="max-h-[68vh] w-full object-contain" />}
        {preview?.mimeType.startsWith("video/") && <video src={preview.path} controls className="max-h-[68vh] w-full" />}
        {preview?.mimeType.startsWith("audio/") && <audio src={preview.path} controls className="w-full" />}
        {preview?.mimeType === "application/pdf" && <iframe src={preview.path} title={preview.name} className="h-[68vh] w-full border-0" />}
        {preview?.mimeType.startsWith("text/") && (
          <iframe src={preview.path} title={preview.name} className="h-[60vh] w-full border border-[#ededed] bg-white" />
        )}
      </Dialog>
    </section>
  );
}


