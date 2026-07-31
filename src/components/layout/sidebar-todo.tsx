"use client";

import * as React from "react";
import { ChevronDown, Circle, CheckCircle2, Trash2 } from "lucide-react";
import { useTodoStore } from "@/store/widgets";
import { cn } from "@/lib/utils";

export function SidebarTodo() {
  const { todos, addTodo, toggleTodo, removeTodo, clearDone } = useTodoStore();
  const [text, setText] = React.useState("");
  const [collapsed, setCollapsed] = React.useState(false);

  const doneCount = todos.filter((t) => t.done).length;

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    addTodo(value);
    setText("");
  };

  return (
    <div className="px-2">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform",
            collapsed && "-rotate-90",
          )}
        />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          每日待办
        </span>
        <span className="ml-auto text-[10px] tabular-nums text-muted-foreground/70">
          {doneCount}/{todos.length}
        </span>
      </button>

      {!collapsed && (
        <div className="mt-1 space-y-1">
          <div className="flex items-center gap-1.5 rounded-md border border-black/10 bg-background px-2 py-1.5 dark:border-white/10">
            <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="添加待办事项..."
              className="w-full bg-transparent text-[13px] placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </div>

          {todos.length === 0 ? (
            <p className="px-1 py-1 text-xs text-muted-foreground/60">暂无待办事项</p>
          ) : (
            <ul className="max-h-44 space-y-0.5 overflow-y-auto pr-0.5">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="group flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    title={todo.done ? "标记为未完成" : "标记为完成"}
                  >
                    {todo.done ? (
                      <CheckCircle2 className="h-4 w-4 text-foreground" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </button>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[13px] leading-snug",
                      todo.done && "text-muted-foreground line-through",
                    )}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => removeTodo(todo.id)}
                    className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    title="删除"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {doneCount > 0 && (
            <button
              onClick={clearDone}
              className="w-full rounded-md px-2 py-1 text-left text-[11px] text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5 transition-colors"
            >
              清除已完成
            </button>
          )}
        </div>
      )}
    </div>
  );
}
