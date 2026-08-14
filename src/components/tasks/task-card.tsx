"use client";

import * as React from "react";
import {
  ChevronDown, ChevronRight, Check, Circle, Trash2, Pencil, Plus,
  FileText, StickyNote, CalendarDays, ListTree, X, Search, ExternalLink,
  Flag, Image as ImageIcon, Music, Video, Archive, Code,
} from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import type { TaskItem, TaskPriority, FileItem } from "@/types";
import { TASK_PRIORITY_LABEL } from "@/types";
import { useNotesStore } from "@/store/widgets";
import { getFiles } from "@/actions/files";

const FILE_ICON = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  archive: Archive,
  code: Code,
  file: FileText,
} as const;

function fileIcon(extension: string): React.ElementType {
  const ext = extension.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"].includes(ext)) return FILE_ICON.image;
  if (["mp4", "avi", "mov", "wmv", "mkv", "webm"].includes(ext)) return FILE_ICON.video;
  if (["mp3", "wav", "flac", "aac", "ogg"].includes(ext)) return FILE_ICON.audio;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return FILE_ICON.archive;
  if (["js", "ts", "tsx", "jsx", "json", "html", "css", "py", "java", "go"].includes(ext)) return FILE_ICON.code;
  return FILE_ICON.file;
}

const PRIORITY_STYLE: Record<TaskPriority, string> = {
  HIGH: "bg-foreground text-background",
  MEDIUM: "bg-black/10 text-foreground/80",
  LOW: "bg-black/5 text-muted-foreground",
};

interface TaskCardProps {
  task: TaskItem;
  depth?: number;
  onChanged: () => Promise<void>;
  onEdit: (task: TaskItem) => void;
  onAddSub: (task: TaskItem) => void;
}

export function TaskCard({ task, depth = 0, onChanged, onEdit, onAddSub }: TaskCardProps) {
  const { notes } = useNotesStore();
  const [expanded, setExpanded] = React.useState(false);
  const [linkPanel, setLinkPanel] = React.useState<"file" | "note" | null>(null);
  const [files, setFiles] = React.useState<FileItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const toggleDone = async () => {
    const { updateTask } = await import("@/actions/tasks");
    setBusy(true);
    try {
      await updateTask(task.id, { done: !task.done });
      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  const openLinkPanel = async (kind: "file" | "note") => {
    setLinkPanel(kind);
    if (kind === "file" && files.length === 0) {
      const res = await getFiles({ pageSize: 200 });
      if (res.success && res.data) setFiles(res.data.items.filter((f) => !f.isDeleted));
    }
  };

  const addFileLink = async (fileId: string) => {
    const { addTaskLink } = await import("@/actions/tasks");
    setBusy(true);
    try {
      const res = await addTaskLink({ taskId: task.id, fileId });
      if (res.success) await onChanged();
    } finally {
      setBusy(false);
    }
  };

  const addNoteLink = async (noteId: string) => {
    const { addTaskLink } = await import("@/actions/tasks");
    setBusy(true);
    try {
      const res = await addTaskLink({ taskId: task.id, noteId });
      if (res.success) await onChanged();
    } finally {
      setBusy(false);
    }
  };

  const removeLink = async (linkId: string) => {
    const { removeTaskLink } = await import("@/actions/tasks");
    setBusy(true);
    try {
      const res = await removeTaskLink(linkId);
      if (res.success) await onChanged();
    } finally {
      setBusy(false);
    }
  };

  const deleteTask = async () => {
    const { deleteTask } = await import("@/actions/tasks");
    if (!confirm(`删除任务「${task.title}」及其所有子任务？`)) return;
    setBusy(true);
    try {
      const res = await deleteTask(task.id);
      if (res.success) await onChanged();
    } finally {
      setBusy(false);
    }
  };

  const filteredFiles = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  const filteredNotes = notes.filter((n) => n.text.toLowerCase().includes(search.toLowerCase()));
  const linkedFileIds = new Set(task.links.map((l) => l.fileId).filter(Boolean));
  const linkedNoteIds = new Set(task.links.map((l) => l.noteId).filter(Boolean));

  const subCount = task.children.length;

  return (
    <div className={cn("rounded-xl border border-whisper bg-white/60 backdrop-blur-sm transition-colors", expanded && "shadow-card", depth > 0 && "border-dashed")}>
      {/* 卡片头 */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left hover:bg-black/[0.03] transition-colors"
      >
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); toggleDone(); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); toggleDone(); } }}
          className="shrink-0 cursor-pointer"
          title={task.done ? "标记为未完成" : "标记为完成"}
        >
          {task.done ? (
            <Circle className="h-4 w-4 fill-foreground text-foreground" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground/60" />
          )}
        </span>

        <span className={cn("min-w-0 flex-1 truncate text-[14px]", task.done ? "text-muted-foreground line-through" : "text-foreground")}>
          {task.title}
        </span>

        <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium", PRIORITY_STYLE[task.priority])}>
          {TASK_PRIORITY_LABEL[task.priority]}
        </span>

        {task.dueDate && (
          <span className="hidden shrink-0 items-center gap-1 text-[11px] text-muted-foreground sm:flex">
            <CalendarDays className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
          </span>
        )}

        {subCount > 0 && (
          <span className="shrink-0 flex items-center gap-0.5 text-[11px] text-muted-foreground" title={`${subCount} 个子任务`}>
            <ListTree className="h-3 w-3" />
            {subCount}
          </span>
        )}

        {task.links.length > 0 && (
          <span className="shrink-0 flex items-center gap-0.5 text-[11px] text-muted-foreground" title={`${task.links.length} 个关联`}>
            <ExternalLink className="h-3 w-3" />
            {task.links.length}
          </span>
        )}

        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {/* 详情 */}
      {expanded && (
        <div className="space-y-3 border-t border-whisper px-3 py-3">
          {task.description && (
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/80">
              {task.description}
            </p>
          )}

          {/* 关联目标：文件 + 知识 */}
          {(task.links.length > 0 || linkPanel) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  关联目标
                </span>
                {linkPanel ? (
                  <button
                    onClick={() => setLinkPanel(null)}
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span className="flex gap-1">
                    <button
                      onClick={() => openLinkPanel("file")}
                      className="flex items-center gap-1 rounded border border-whisper px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <FileText className="h-3 w-3" /> 关联文件
                    </button>
                    <button
                      onClick={() => openLinkPanel("note")}
                      className="flex items-center gap-1 rounded border border-whisper px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <StickyNote className="h-3 w-3" /> 关联知识
                    </button>
                  </span>
                )}
              </div>

              {task.links.length > 0 && (
                <ul className="space-y-1">
                  {task.links.map((link) => (
                    <li key={link.id} className="group flex items-center gap-2 rounded-lg border border-whisper bg-white/50 px-2 py-1.5">
                      {link.file ? (
                        <a
                          href={link.file.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-w-0 flex-1 items-center gap-1.5 text-[12px] text-foreground/90 hover:text-foreground hover:underline"
                          title="在新窗口打开文件"
                        >
                          {(() => {
                            const Icon = fileIcon(link.file!.extension);
                            return <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
                          })()}
                          <span className="truncate">{link.file.name}</span>
                          <span className="shrink-0 text-[10px] text-muted-foreground/70">{formatFileSize(link.file.size)}</span>
                        </a>
                      ) : link.note ? (
                        <div className="flex min-w-0 flex-1 items-center gap-1.5">
                          <StickyNote className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate text-[12px] text-foreground/90">{link.note.text}</span>
                        </div>
                      ) : null}
                      <button
                        onClick={() => removeLink(link.id)}
                        className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                        title="取消关联"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* 选择面板 */}
              {linkPanel && (
                <div className="rounded-lg border border-whisper bg-white/60 p-2">
                  <div className="mb-1.5 flex items-center gap-1.5 rounded-md border border-whisper bg-white/60 px-2 py-1">
                    <Search className="h-3 w-3 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={linkPanel === "file" ? "搜索文件..." : "搜索知识..."}
                      className="w-full bg-transparent text-[12px] focus:outline-none"
                    />
                  </div>
                  {linkPanel === "file" ? (
                    filteredFiles.length === 0 ? (
                      <p className="px-1 py-1 text-[11px] text-muted-foreground/60">没有可关联的文件</p>
                    ) : (
                      <ul className="max-h-40 space-y-0.5 overflow-y-auto">
                        {filteredFiles.map((f) => (
                          <li key={f.id}>
                            <button
                              disabled={linkedFileIds.has(f.id)}
                              onClick={() => addFileLink(f.id)}
                              className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-[12px] hover:bg-black/[0.04] disabled:opacity-40 transition-colors"
                            >
                              {(() => {
                                const Icon = fileIcon(f.extension);
                                return <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
                              })()}
                              <span className="truncate">{f.name}</span>
                              {linkedFileIds.has(f.id) && <Check className="ml-auto h-3 w-3 shrink-0" />}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )
                  ) : (
                    filteredNotes.length === 0 ? (
                      <p className="px-1 py-1 text-[11px] text-muted-foreground/60">没有可关联的知识，请先在随时记写中添加</p>
                    ) : (
                      <ul className="max-h-40 space-y-0.5 overflow-y-auto">
                        {filteredNotes.map((n) => (
                          <li key={n.id}>
                            <button
                              disabled={linkedNoteIds.has(n.id)}
                              onClick={() => addNoteLink(n.id)}
                              className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-[12px] hover:bg-black/[0.04] disabled:opacity-40 transition-colors"
                            >
                              <StickyNote className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span className="truncate">{n.text}</span>
                              {linkedNoteIds.has(n.id) && <Check className="ml-auto h-3 w-3 shrink-0" />}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* 子任务 */}
          {task.children.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                子任务（拆分）
              </span>
              {task.children.map((child) => (
                <TaskCard
                  key={child.id}
                  task={child}
                  depth={depth + 1}
                  onChanged={onChanged}
                  onEdit={onEdit}
                  onAddSub={onAddSub}
                />
              ))}
            </div>
          )}

          {/* 操作 */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-whisper pt-2">
            <button
              onClick={() => onAddSub(task)}
              className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-muted-foreground hover:bg-black/[0.05] hover:text-foreground transition-colors"
            >
              <Plus className="h-3 w-3" /> 添加子任务
            </button>
            <button
              onClick={() => onEdit(task)}
              className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-muted-foreground hover:bg-black/[0.05] hover:text-foreground transition-colors"
            >
              <Pencil className="h-3 w-3" /> 编辑
            </button>
            <button
              onClick={deleteTask}
              disabled={busy}
              className="ml-auto flex items-center gap-1 rounded px-2 py-1 text-[11px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3 w-3" /> 删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
