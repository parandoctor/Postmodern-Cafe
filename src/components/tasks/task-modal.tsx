"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { TaskItem, TaskPriority } from "@/types";

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: string | null;
    parentId?: string | null;
  }) => Promise<void> | void;
  initial?: TaskItem | null;
  parentOptions: TaskItem[]; // 可用于拆分（父任务选择）
  editingId?: string | null; // 编辑中的任务 ID（用于禁止选择自身）
}

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string; desc: string }> = [
  { value: "HIGH", label: "重要", desc: "第一层：必须优先处理" },
  { value: "MEDIUM", label: "一般", desc: "第二层：常规推进" },
  { value: "LOW", label: "次要", desc: "第三层：可延后" },
];

export function TaskModal({ open, onClose, onSave, initial, parentOptions, editingId }: TaskModalProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = React.useState("");
  const [parentId, setParentId] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setPriority(initial?.priority ?? "MEDIUM");
    setDueDate(initial?.dueDate ? initial.dueDate.toISOString().slice(0, 10) : "");
    setParentId(initial?.parentId ?? "");
    setError("");
  }, [open, initial]);

  const submit = async () => {
    const value = title.trim();
    if (!value) {
      setError("任务名不能为空");
      return;
    }
    await onSave({
      title: value,
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? new Date(`${dueDate}T00:00:00`).toISOString() : null,
      parentId: parentId || null,
    });
    onClose();
  };

  // 过滤掉编辑中的任务自身及其子树（不能把任务设为自身的子任务）
  const ownIds = new Set<string>();
  const collect = (t: TaskItem) => {
    ownIds.add(t.id);
    t.children.forEach(collect);
  };
  if (editingId) {
    parentOptions.forEach((t) => t.id === editingId && collect(t));
  }

  return (
    <Dialog open={open} onClose={onClose} title={initial ? "编辑任务" : "新建任务"} description="设置任务名、目的、重要性与截止日期，可拆分到父任务下" maxWidth="max-w-xl">
      <div className="space-y-4">
        {/* 任务名 */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-foreground">任务名</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="例如：整理季度项目资料"
            autoFocus
            className="w-full rounded-lg border border-whisper bg-white/70 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/60"
          />
        </div>

        {/* 目的 */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-foreground">目的</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="说明这项任务要达成的目标..."
            className="w-full resize-none rounded-lg border border-whisper bg-white/70 px-3 py-2 text-[14px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring/60"
          />
        </div>

        {/* 重要性三档 */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-foreground">重要性</label>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left transition-colors",
                  priority === opt.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-whisper bg-white/60 hover:bg-black/[0.04]",
                )}
              >
                <span className="block text-[13px] font-medium">{opt.label}</span>
                <span className={cn("block text-[11px]", priority === opt.value ? "text-background/70" : "text-muted-foreground")}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* 截止日期 */}
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-foreground">截止日期（时间线用）</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-whisper bg-white/70 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
          </div>

          {/* 父任务（拆分） */}
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-foreground">父任务（拆分）</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full rounded-lg border border-whisper bg-white/70 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/60"
            >
              <option value="">无（作为顶层任务）</option>
              {parentOptions
                .filter((t) => !ownIds.has(t.id))
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </select>
            <p className="mt-1 text-[11px] text-muted-foreground/70">高级任务可拆分出多个低级子任务</p>
          </div>
        </div>

        {error && <p className="text-[13px] text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-[13px] text-muted-foreground hover:bg-black/[0.05] transition-colors"
          >
            取消
          </button>
          <button
            onClick={submit}
            className="rounded-lg bg-foreground px-4 py-2 text-[13px] font-medium text-background hover:bg-foreground/90 transition-colors"
          >
            {initial ? "保存修改" : "创建任务"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
