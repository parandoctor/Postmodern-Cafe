"use client";

import * as React from "react";
import { Plus, List, Clock, Flag, Circle, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTasks, createTask, updateTask, reorderTasks } from "@/actions/tasks";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskModal } from "@/components/tasks/task-modal";
import type { TaskItem, TaskPriority } from "@/types";

type ViewMode = "list" | "timeline";

const DAY = 24 * 60 * 60 * 1000;

function dateGroupKey(due: Date | null): string {
  if (!due) return "no-date";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(due);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / DAY);
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff >= 2 && diff < 7) return "this-week";
  if (diff < 0) return "overdue";
  return target.toISOString().slice(0, 10);
}

const GROUP_LABEL: Record<string, string> = {
  overdue: "已逾期",
  today: "今天",
  tomorrow: "明天",
  "this-week": "本周内",
  "no-date": "长期任务",
};

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<TaskItem | null>(null);
  const [presetParentId, setPresetParentId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState("");
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await getTasks();
      if (res.success && res.data) setTasks(res.data);
      else if (res.error) setMessage(res.error);
    } catch {
      setMessage("加载任务失败");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingTask(null);
    setPresetParentId(null);
    setModalOpen(true);
  };

  const openAddSub = (task: TaskItem) => {
    setEditingTask(null);
    setPresetParentId(task.id);
    setModalOpen(true);
  };

  const openEdit = (task: TaskItem) => {
    setEditingTask(task);
    setPresetParentId(null);
    setModalOpen(true);
  };

  const handleSave = async (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: string | null;
    parentId?: string | null;
  }) => {
    setMessage("");
    const payload = {
      ...data,
      parentId: data.parentId ?? presetParentId,
    };
    const res = editingTask
      ? await updateTask(editingTask.id, payload)
      : await createTask(payload);
    if (!res.success) setMessage(res.error ?? "保存失败");
    await load();
  };

  const doneCount = tasks.filter((t) => t.done).length;
  const longTermCount = tasks.filter((t) => !t.dueDate).length; // 长期任务（无截止日期）

  // ---- 时间线视图：切换完成状态 ----
  const toggleTimelineDone = async (t: TaskItem) => {
    const res = await updateTask(t.id, { done: !t.done });
    if (!res.success) setMessage(res.error ?? "操作失败");
    await load();
  };

  // ---- 列表视图：拖拽排序 ----
  const handleDrop = async (targetId: string) => {
    const from = dragId;
    setDragId(null);
    setOverId(null);
    setDragging(false);
    if (!from || from === targetId) return;
    const fromIndex = tasks.findIndex((t) => t.id === from);
    const toIndex = tasks.findIndex((t) => t.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = [...tasks];
    const [moved] = next.splice(fromIndex, 1);
    if (!moved) return;
    next.splice(toIndex, 0, moved);
    setTasks(next);
    const res = await reorderTasks({
      items: next.map((t, i) => ({ id: t.id, sortOrder: i })),
    });
    if (!res.success) setMessage(res.error ?? "保存排序失败");
  };

  const handleDragEnd = () => {
    setDragId(null);
    setOverId(null);
    setDragging(false);
  };

  // ---- 时间线分组 ----
  const timelineGroups: Array<{ key: string; tasks: TaskItem[] }> = [];
  if (viewMode === "timeline") {
    const all = tasks.flatMap((t) => [t, ...t.children]);
    const groupMap = new Map<string, TaskItem[]>();
    for (const t of all) {
      const key = dateGroupKey(t.dueDate);
      const list = groupMap.get(key) ?? [];
      list.push(t);
      groupMap.set(key, list);
    }
    const order: string[] = ["overdue", "today", "tomorrow", "this-week"];
    for (const [k, v] of groupMap) {
      if (k !== "no-date" && !order.includes(k)) order.push(k);
    }
    order.push("no-date");
    for (const key of order) {
      const list = groupMap.get(key) ?? []; // 长期任务（无截止日期）固定呈现，与今日任务区分
      if (key === "no-date" || list.length > 0) {
        list.sort((a, b) => (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity));
        timelineGroups.push({ key, tasks: list });
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* 顶栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight">任务管理</h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            共 {tasks.length} 个顶层任务 · 已完成 {doneCount} 个 · 长期任务 {longTermCount} 个
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* 视图切换 */}
          <div className="flex rounded-lg border border-whisper bg-white/60 p-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] transition-colors",
                viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="h-3.5 w-3.5" /> 列表
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] transition-colors",
                viewMode === "timeline" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Clock className="h-3.5 w-3.5" /> 时间线
            </button>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-[12px] font-medium text-background hover:bg-foreground/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> 新建任务
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-whisper bg-white/60 px-3 py-2 text-[12px] text-muted-foreground">
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center text-[13px] text-muted-foreground/60">加载中...</div>
      ) : viewMode === "list" ? (
        tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-whisper bg-white/40 py-20 text-center">
            <Flag className="mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-[14px] text-muted-foreground/70">暂无任务</p>
            <p className="mt-1 text-[12px] text-muted-foreground/50">
              点击右上角「新建任务」，支持拆分、关联文件与知识
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => {
                  setDragId(task.id);
                  setDragging(true);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (overId !== task.id) setOverId(task.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(task.id);
                }}
                onDragEnd={handleDragEnd}
                className={cn(
                  "group relative rounded-xl transition-all duration-150",
                  dragId === task.id && "opacity-40 scale-[0.99]",
                  overId === task.id && dragId !== task.id && "translate-y-1 ring-1 ring-foreground/20 ring-offset-1 ring-offset-background",
                )}
              >
                {/* 拖拽手柄 */}
                <span
                  className={cn(
                    "absolute -left-3.5 top-1/2 z-10 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground/40 transition-opacity hover:text-muted-foreground cursor-grab active:cursor-grabbing select-none",
                    dragging ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                  )}
                  title="拖拽调整顺序"
                >
                  <GripVertical className="h-4 w-4" />
                </span>
                <TaskCard
                  task={task}
                  onChanged={load}
                  onEdit={openEdit}
                  onAddSub={openAddSub}
                />
              </div>
            ))}
          </div>
        )
      ) : (
        /* 时间线视图 */
        <div className="relative space-y-5 pl-5">
          <div className="absolute left-[5px] top-1 bottom-1 w-px bg-black/10" />
          {timelineGroups.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-muted-foreground/60">
              暂无任务，先新建一个任务并设置截止日期
            </div>
          ) : (
            timelineGroups.map((group) => (
              <div key={group.key} className="relative">
                <div className="absolute -left-5 top-1.5 flex h-[11px] w-[11px] items-center justify-center rounded-full border-2 border-whisper bg-foreground" />
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-foreground/90">
                    {GROUP_LABEL[group.key] ??
                      new Date(group.key + "T00:00:00").toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                  </span>
                  <span className="text-[11px] text-muted-foreground/60">{group.tasks.length} 项</span>
                </div>
                {group.tasks.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-whisper bg-white/40 px-3 py-2.5 text-[12px] text-muted-foreground/60">
                    暂无长期任务 · 新建任务时不设置截止日期即归入此栏
                  </div>
                ) : (
                <div className="space-y-1.5">
                  {group.tasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 rounded-lg border border-whisper bg-white/60 px-3 py-2">
                      <button
                        onClick={() => toggleTimelineDone(t)}
                        className="shrink-0 transition-colors hover:opacity-70"
                        title={t.done ? "标记为未完成" : "标记为完成"}
                      >
                        <Circle
                          className={cn(
                            "h-4 w-4 transition-colors",
                            t.done ? "fill-foreground text-foreground" : "text-muted-foreground/60",
                          )}
                        />
                      </button>
                      <span className={cn("min-w-0 flex-1 truncate text-[13px]", t.done && "text-muted-foreground line-through")}>
                        {t.title}
                      </span>
                      {t.parentId && (
                        <span className="shrink-0 rounded bg-black/5 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          子任务
                        </span>
                      )}
                      <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium", t.priority === "HIGH" ? "bg-foreground text-background" : t.priority === "MEDIUM" ? "bg-black/10" : "bg-black/5 text-muted-foreground")}>
                        {t.priority === "HIGH" ? "重要" : t.priority === "MEDIUM" ? "一般" : "次要"}
                      </span>
                      {t.links.length > 0 && (
                        <span className="shrink-0 text-[10px] text-muted-foreground/60">{t.links.length} 关联</span>
                      )}
                    </div>
                  ))}
                </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editingTask}
        editingId={editingTask?.id ?? null}
        parentOptions={tasks}
      />
    </div>
  );
}
