"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Circle, ListChecks, ArrowRight, Trash2 } from "lucide-react";
import { getTasks, createTask, updateTask, deleteTask } from "@/actions/tasks";
import { cn } from "@/lib/utils";
import type { TaskItem } from "@/types";

function isToday(due: Date | null): boolean {
  if (!due) return false; // 无截止日期归入「长期任务」，与今日任务区分
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  return target === today;
}

export default function TodayPage() {
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [text, setText] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async () => {
    const res = await getTasks();
    if (res.success && res.data) setTasks(res.data);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const todayTasks = tasks
    .flatMap((t) => [t, ...t.children])
    .filter((t) => isToday(t.dueDate))
    .sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));

  const doneCount = todayTasks.filter((t) => t.done).length;
  const pendingCount = todayTasks.length - doneCount;

  const submit = async () => {
    const value = text.trim();
    if (!value || busy) return;
    setBusy(true);
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const res = await createTask({ title: value, dueDate: today.toISOString() });
    setBusy(false);
    if (res.success) {
      setText("");
      await load();
      inputRef.current?.focus();
    }
  };

  const toggle = async (t: TaskItem) => {
    const res = await updateTask(t.id, { done: !t.done });
    if (res.success) await load();
  };

  const remove = async (id: string) => {
    const res = await deleteTask(id);
    if (res.success) await load();
  };

  const todayLabel = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight">今日任务</h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {todayLabel} · {pendingCount} 项待完成 · 已完成 {doneCount} 项
          </p>
        </div>
        <Link
          href="/dashboard/tasks"
          className="flex items-center gap-1.5 rounded-lg border border-whisper bg-white/60 px-3 py-1.5 text-[12px] text-muted-foreground hover:text-foreground hover:bg-white/80 transition-colors"
        >
          全部任务管理
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 添加今日任务 */}
      <div className="rounded-xl border border-whisper bg-white/60 p-3 backdrop-blur-sm">
        <div className="flex items-center gap-2 rounded-lg border border-whisper bg-white/70 px-3 py-2.5">
          <Circle className="h-4 w-4 shrink-0 text-muted-foreground/60" />
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="添加今日任务，回车提交..."
            className="w-full bg-transparent text-[14px] placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={!text.trim() || busy}
            className="flex shrink-0 items-center gap-1 rounded px-3 py-1.5 text-[13px] font-medium text-background bg-foreground hover:bg-foreground/90 disabled:opacity-30 transition-opacity"
          >
            <Plus className="h-3.5 w-3.5" />
            添加
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-[13px] text-muted-foreground/60">加载中...</div>
      ) : todayTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-whisper bg-white/40 py-20 text-center">
          <ListChecks className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-[14px] text-muted-foreground/70">今日暂无任务</p>
          <p className="mt-1 text-[12px] text-muted-foreground/50">在上方输入框写下今天的计划，回车即添加到今日任务</p>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {todayTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group flex items-center gap-2.5 rounded-xl border border-whisper bg-white/60 px-3.5 py-3 hover:shadow-card transition-shadow"
            >
              <button
                onClick={() => toggle(task)}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                title={task.done ? "标记为未完成" : "标记为完成"}
              >
                <Circle
                  className={cn(
                    "h-4 w-4 transition-colors",
                    task.done ? "fill-foreground text-foreground" : "text-muted-foreground/60",
                  )}
                />
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-[13px] leading-snug",
                    task.done ? "text-muted-foreground line-through" : "text-foreground/90",
                  )}
                  title={task.title}
                >
                  {task.title}
                </p>
                {task.parentId && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground/60">子任务</p>
                )}
              </div>
              {task.priority === "HIGH" && (
                <span className="shrink-0 rounded bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background">
                  重要
                </span>
              )}
              <button
                onClick={() => remove(task.id)}
                className="shrink-0 rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                title="删除"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
