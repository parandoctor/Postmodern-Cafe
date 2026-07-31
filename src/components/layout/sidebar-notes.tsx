"use client";

import * as React from "react";
import { ChevronDown, StickyNote, Trash2, X } from "lucide-react";
import { useNotesStore } from "@/store/widgets";
import { cn } from "@/lib/utils";

export function SidebarNotes() {
  const { notes, addNote, updateNote, removeNote } = useNotesStore();
  const [text, setText] = React.useState("");
  const [collapsed, setCollapsed] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingText, setEditingText] = React.useState("");

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    addNote(value);
    setText("");
  };

  const startEdit = (noteId: string, noteText: string) => {
    setEditingId(noteId);
    setEditingText(noteText);
  };

  const commitEdit = () => {
    if (editingId) {
      const value = editingText.trim();
      if (value) updateNote(editingId, value);
      else removeNote(editingId);
    }
    setEditingId(null);
    setEditingText("");
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
          随时记写
        </span>
      </button>

      {!collapsed && (
        <div className="mt-1 space-y-1">
          <div className="flex items-center gap-1.5 rounded-md border border-black/10 bg-background px-2 py-1.5 dark:border-white/10">
            <StickyNote className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="写点什么..."
              className="w-full bg-transparent text-[13px] placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </div>

          {notes.length === 0 ? (
            <p className="px-1 py-1 text-xs text-muted-foreground/60">暂无记录</p>
          ) : (
            <ul className="max-h-36 space-y-0.5 overflow-y-auto pr-0.5">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="group flex items-start gap-1.5 rounded-md px-1.5 py-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  {editingId === note.id ? (
                    <input
                      autoFocus
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onBlur={commitEdit}
                      className="w-full rounded border border-black/20 bg-background px-1.5 py-0.5 text-[13px] focus:outline-none dark:border-white/20"
                    />
                  ) : (
                    <button
                      onClick={() => startEdit(note.id, note.text)}
                      className="min-w-0 flex-1 truncate text-left text-[13px] leading-snug text-foreground/90 hover:text-foreground"
                      title="点击编辑"
                    >
                      {note.text}
                    </button>
                  )}
                  {editingId !== note.id && (
                    <button
                      onClick={() => removeNote(note.id)}
                      className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                      title="删除"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
