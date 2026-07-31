"use client";

import * as React from "react";
import {
  Upload, File, Star, Grid3X3, List, Download,
  Trash2, Heart, Eye, FileText, Search,
  X, Check, RefreshCw, Image, Video,
  Music, Archive, Code, MoreHorizontal, Copy,
  Pencil, FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/files/upload-zone";
import { FilePreview } from "@/components/files/file-preview";
import { useFileStore, useCategoryStore } from "@/store";
import { formatFileSize, formatRelativeTime, getFileTypeIcon, cn, getContrastColor } from "@/lib/utils";
import {
  getFiles, uploadFile, deleteFiles,
  toggleFavorite, renameFile, copyFile, moveFiles,
} from "@/actions/files";
import { getCategories } from "@/actions/categories";
import type { FileItem } from "@/types";
import { RAINBOW_COLORS } from "@/types";

const FILE_ICON_MAP: Record<string, React.ElementType> = {
  image: Image, video: Video, audio: Music, pdf: FileText,
  word: FileText, excel: FileText, powerpoint: FileText,
  archive: Archive, code: Code, text: FileText, markdown: FileText,
  file: File,
};

export default function FilesPage() {
  const { files, selectedFiles, viewMode, setFiles, setViewMode, toggleSelect, clearSelection } = useFileStore();
  const { categories, setCategories, activeCategoryId, setActiveCategory } = useCategoryStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [previewFile, setPreviewFile] = React.useState<FileItem | null>(null);
  const [message, setMessage] = React.useState("");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // More menu state
  const [moreMenuFileId, setMoreMenuFileId] = React.useState<string | null>(null);
  const moreMenuRef = React.useRef<HTMLDivElement>(null);

  // Rename state
  const [renamingFile, setRenamingFile] = React.useState<string | null>(null);
  const [renameInput, setRenameInput] = React.useState("");

  // Move category state
  const [moveMenuFileId, setMoveMenuFileId] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const [filesRes, catsRes] = await Promise.all([
        getFiles({ search: searchQuery || undefined, categoryId: activeCategoryId || undefined }),
        getCategories(),
      ]);
      if (filesRes.success && filesRes.data) setFiles(filesRes.data.items);
      if (catsRes.success && catsRes.data) setCategories(catsRes.data);
    } catch (err) {
      console.error("加载数据失败:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, activeCategoryId, setFiles, setCategories]);

  React.useEffect(() => { loadData(); }, [loadData]);

  // Close more menu on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuFileId(null);
        setMoveMenuFileId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleUpload = async (file: File): Promise<boolean> => {
    const formData = new FormData();
    formData.append("file", file);
    if (activeCategoryId) formData.append("categoryId", activeCategoryId);
    try {
      const res = await uploadFile(formData);
      if (res.success) {
        setMessage(`"${file.name}" 上传成功`);
        return true;
      } else {
        setMessage(`上传失败: ${res.error}`);
        return false;
      }
    } catch {
      setMessage(`"${file.name}" 上传失败`);
      return false;
    }
  };

  const handleUploadComplete = async () => {
    await loadData();
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDelete = async (fileIds: string[]) => {
    if (!confirm(`确定要删除 ${fileIds.length} 个文件吗？`)) return;
    const res = await deleteFiles(fileIds);
    if (res.success) setMessage(res.message ?? "已移至回收站");
    clearSelection();
    await loadData();
    setTimeout(() => setMessage(""), 3000);
  };

  const handleFavorite = async (fileId: string) => {
    const res = await toggleFavorite(fileId);
    if (res.success) {
      setFiles(files.map((f) =>
        f.id === fileId ? { ...f, isFavorite: res.data?.isFavorite ?? !f.isFavorite } : f,
      ));
    }
  };

  const handleDownload = (file: FileItem) => {
    const a = document.createElement("a");
    a.href = file.path;
    a.download = file.originalName;
    a.click();
  };

  const handleCopy = async (fileId: string) => {
    const res = await copyFile(fileId);
    if (res.success) setMessage(res.message ?? "文件已复制");
    else setMessage(`复制失败: ${res.error}`);
    setMoreMenuFileId(null);
    await loadData();
    setTimeout(() => setMessage(""), 3000);
  };

  const handleRenameStart = (file: FileItem) => {
    setRenamingFile(file.id);
    setRenameInput(file.name);
    setMoreMenuFileId(null);
  };

  const handleRenameSubmit = async () => {
    if (!renamingFile || !renameInput.trim()) return;
    const res = await renameFile(renamingFile, { name: renameInput.trim() });
    if (res.success) setMessage("文件已重命名");
    else setMessage(`重命名失败: ${res.error}`);
    setRenamingFile(null);
    setRenameInput("");
    await loadData();
    setTimeout(() => setMessage(""), 3000);
  };

  const handleMove = async (fileId: string, targetCategoryId: string | null) => {
    const res = await moveFiles([fileId], targetCategoryId);
    if (res.success) setMessage("文件已移动");
    else setMessage(`移动失败: ${res.error}`);
    setMoveMenuFileId(null);
    setMoreMenuFileId(null);
    await loadData();
    setTimeout(() => setMessage(""), 3000);
  };

  const selectedArray = Array.from(selectedFiles);

  return (
    <div className="space-y-4">
      {/* Message toast */}
      {message && (
        <div className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm">
          {message}
        </div>
      )}

      {/* Header + Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索文件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Category filter */}
          <select
            value={activeCategoryId ?? ""}
            onChange={(e) => setActiveCategory(e.target.value || null)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">全部分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Selected actions */}
          {selectedFiles.size > 0 && (
            <>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                已选 {selectedFiles.size} 项
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-destructive"
                onClick={() => handleDelete(selectedArray)}
              >
                <Trash2 className="h-3.5 w-3.5" /> 删除
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearSelection}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => { setIsRefreshing(true); loadData(); }}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          <div className="flex items-center rounded-lg border border-border p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-md p-1.5",
                viewMode === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md p-1.5",
                viewMode === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload zone */}
      <UploadZone onUpload={handleUpload} onComplete={handleUploadComplete} categoryId={activeCategoryId ?? undefined} />

      {/* Files content */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Upload className="h-10 w-10 mb-4 opacity-30" />
          <p className="text-sm">还没有文件</p>
          <p className="text-xs mt-1 opacity-70">拖拽文件到上方区域或点击上传按钮</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((file) => {
            const iconType = getFileTypeIcon(file.extension);
            const IconComponent = (FILE_ICON_MAP[iconType] || File) as React.ComponentType<{ className?: string }>;
            const isSelected = selectedFiles.has(file.id);
            return (
              <div
                key={file.id}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) toggleSelect(file.id);
                }}
                className={cn(
                  "group relative rounded-lg border p-4 transition-colors cursor-pointer",
                  isSelected
                    ? "border-foreground/30 bg-secondary"
                    : "border-border bg-card hover:border-foreground/20 hover:bg-secondary/50",
                )}
              >
                {/* Checkbox */}
                <div className="absolute left-3 top-3 z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(file.id); }}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                      isSelected ? "bg-foreground border-foreground" : "border-muted-foreground/30 bg-background opacity-0 group-hover:opacity-100",
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-background" />}
                  </button>
                </div>

                {/* Rename inline */}
                {renamingFile === file.id ? (
                  <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleRenameSubmit(); if (e.key === "Escape") setRenamingFile(null); }}
                      onBlur={() => setRenamingFile(null)}
                      className="h-8 w-full rounded-md border border-foreground/30 bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    {/* Icon */}
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                      <IconComponent className="h-6 w-6 text-muted-foreground" />
                    </div>

                    {/* Info */}
                    <h3 className="font-medium text-sm truncate">{file.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </>
                )}

                {/* Category badge */}
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

                {/* Actions */}
                <div className="mt-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setPreviewFile(file)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground" title="预览">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDownload(file)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground" title="下载">
                    <Download className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleFavorite(file.id)} className="p-1.5 rounded-md hover:bg-secondary" title="收藏">
                    <Heart className={cn("h-4 w-4", file.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                  </button>
                  <button onClick={() => handleDelete([file.id])} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="删除">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {/* More menu */}
                  <div className="relative ml-auto" ref={moreMenuFileId === file.id ? moreMenuRef : undefined}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setMoreMenuFileId(moreMenuFileId === file.id ? null : file.id); }}
                      className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"
                      title="更多"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {moreMenuFileId === file.id && (
                      <div
                        ref={moreMenuRef}
                        className="absolute right-0 top-full mt-1 z-50 min-w-36 rounded-lg border border-border bg-card py-1 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleRenameStart(file)}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" /> 重命名
                        </button>
                        <button
                          onClick={() => handleCopy(file.id)}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" /> 复制
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setMoveMenuFileId(moveMenuFileId === file.id ? null : file.id)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
                          >
                            <FolderOpen className="h-3.5 w-3.5" /> 移动到...
                          </button>
                          {moveMenuFileId === file.id && (
                            <div className="absolute left-full top-0 ml-1 min-w-28 rounded-lg border border-border bg-card py-1 shadow-lg">
                              <button
                                onClick={() => handleMove(file.id, null)}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
                              >
                                未分类
                              </button>
                              {categories.filter((c) => c.id !== activeCategoryId).map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => handleMove(file.id, cat.id)}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
                                >
                                  <span
                                    className="h-3 w-3 rounded-full shrink-0"
                                    style={{ backgroundColor: RAINBOW_COLORS[cat.color]?.hex ?? "#888" }}
                                  />
                                  {cat.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">名称</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground w-20">大小</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground w-16">类型</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground w-24">分类</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground w-28">修改时间</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground w-28">操作</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => {
                const iconType = getFileTypeIcon(file.extension);
                const IconComponent = (FILE_ICON_MAP[iconType] || File) as React.ComponentType<{ className?: string }>;
                return (
                  <tr key={file.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-2.5">
                      {renamingFile === file.id ? (
                        <input
                          type="text"
                          value={renameInput}
                          onChange={(e) => setRenameInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleRenameSubmit(); if (e.key === "Escape") setRenamingFile(null); }}
                          onBlur={() => setRenamingFile(null)}
                          className="h-7 w-40 rounded border border-foreground/30 bg-background px-1.5 text-sm"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-sm">{file.name}</span>
                          {file.isFavorite && (
                            <Heart className="h-3 w-3 fill-red-500 text-red-500 shrink-0" />
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">{formatFileSize(file.size)}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-muted-foreground uppercase">{file.extension}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {file.category ? (() => {
                        const hex = RAINBOW_COLORS[file.category.color]?.hex ?? "#888";
                        return (
                          <span
                            className="inline-block rounded px-1.5 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: `${hex}1a`,
                              color: getContrastColor(hex),
                            }}
                          >
                            {file.category.name}
                          </span>
                        );
                      })() : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">{formatRelativeTime(file.updatedAt)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => setPreviewFile(file)} className="p-1 rounded hover:bg-secondary text-muted-foreground" title="预览">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDownload(file)} className="p-1 rounded hover:bg-secondary text-muted-foreground" title="下载">
                          <Download className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleFavorite(file.id)} className="p-1 rounded hover:bg-secondary" title="收藏">
                          <Heart className={cn("h-4 w-4", file.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                        </button>
                        <button onClick={() => handleDelete([file.id])} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="删除">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {/* More menu */}
                        <div className="relative" ref={moreMenuFileId === file.id ? moreMenuRef : undefined}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setMoreMenuFileId(moreMenuFileId === file.id ? null : file.id); }}
                            className="p-1 rounded hover:bg-secondary text-muted-foreground"
                            title="更多"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {moreMenuFileId === file.id && (
                            <div
                              ref={moreMenuRef}
                              className="absolute right-0 top-full mt-1 z-50 min-w-36 rounded-lg border border-border bg-card py-1 shadow-lg"
                            >
                              <button
                                onClick={() => handleRenameStart(file)}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
                              >
                                <Pencil className="h-3.5 w-3.5" /> 重命名
                              </button>
                              <button
                                onClick={() => handleCopy(file.id)}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
                              >
                                <Copy className="h-3.5 w-3.5" /> 复制
                              </button>
                              <div className="relative">
                                <button
                                  onClick={() => setMoveMenuFileId(moveMenuFileId === file.id ? null : file.id)}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
                                >
                                  <FolderOpen className="h-3.5 w-3.5" /> 移动到...
                                </button>
                                {moveMenuFileId === file.id && (
                                  <div className="absolute left-full top-0 ml-1 min-w-28 rounded-lg border border-border bg-card py-1 shadow-lg">
                                    <button
                                      onClick={() => handleMove(file.id, null)}
                                      className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
                                    >
                                      未分类
                                    </button>
                                    {categories.filter((c) => c.id !== activeCategoryId).map((cat) => (
                                      <button
                                        key={cat.id}
                                        onClick={() => handleMove(file.id, cat.id)}
                                        className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
                                      >
                                        <span
                                          className="h-3 w-3 rounded-full shrink-0"
                                          style={{ backgroundColor: RAINBOW_COLORS[cat.color]?.hex ?? "#888" }}
                                        />
                                        {cat.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
