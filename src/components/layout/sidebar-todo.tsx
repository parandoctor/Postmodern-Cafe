"use client";

import * as React from "react";
import { ChevronDown, Circle, Trash2, ListChecks } from "lucide-react";
import { getTasks, createTask, updateTask, deleteTask } from "@/actions/tasks";
import { cn } from "@/lib/utils";
import type { TaskItem } from "@/types";

function isToday(due: Date | null): boolean {
  if (!due) return true;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  return target === today;
}

export function SidebarTodo() {
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [text, setText] = React.useState("");
  const [collapsed, setCollapsed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    const res = await getTasks();
    if (res.success && res.data) setTasks(res.data);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const todayTasks = tasks
    .flatMap((t) => [t, ...t.children])
    .filter((t) => isToday(t.dueDate) && !t.done)
    .slice(0, 8);

  const doneCount = tasks
    .flatMap((t) => [t, ...t.children])
    .filter((t) => isToday(t.dueDate) && t.done).length;

  const submit = async () => {
    const value = text.trim();
    if (!value || busy) return;
    setBusy(true);
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const res = await createTask({
      title: value,
      dueDate: today.toISOString(),
    });
    setBusy(false);
    if (res.success) {
      setText("");
      await load();
    }
  };

  const toggle = async (t: TaskItem) => {
    setBusy(true);
    const res = await updateTask(t.id, { done: !t.done });
    setBusy(false);
    if (res.success) await load();
  };

  const remove = async (id: string) => {
    setBusy(true);
    const res = await deleteTask(id);
    setBusy(false);
    if (res.success) await load();
  };

  return (
    <div className="px-2">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left hover:bg-[rgba(0,0,0,0.05)] transition-colors"
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform",
            collapsed && "-rotate-90",
          )}
        />
        <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          今日任务
        </span>
        <span className="ml-auto text-[10px] tabular-nums text-muted-foreground/70">
          {doneCount}/{doneCount + todayTasks.length}
        </span>
      </button>

      {!collapsed && (
        <div className="mt-1 space-y-1">
          <div className="flex items-center gap-1.5 rounded border border-whisper bg-white/60 px-2 py-1.5">
            <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="添加今日任务..."
              className="w-full bg-transparent text-[13px] placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </div>

          {todayTasks.length === 0 ? (
            <p className="px-1 py-1 text-[12px] text-muted-foreground/60">
              {doneCount > 0 ? "今日任务已完成" : "暂无今日任务"}
            </p>
          ) : (
            <ul className="max-h-44 space-y-0.5 overflow-y-auto pr-0.5">
              {todayTasks.map((task) => (
                <li
                  key={task.id}
                  className="group flex items-center gap-2 rounded px-1.5 py-1 hover:bg-[rgba(0,0,0,0.05)] transition-colors"
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
                  <a
                    href="/dashboard/tasks"
                    className="min-w-0 flex-1 truncate text-[13px] leading-snug text-foreground/90 hover:text-foreground"
                    title={task.title}
                  >
                    {task.title}
                  </a>
                  <button
                    onClick={() => remove(task.id)}
                    className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    title="删除"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
