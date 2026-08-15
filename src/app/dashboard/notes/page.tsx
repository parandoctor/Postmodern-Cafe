"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, StickyNote, Trash2 } from "lucide-react";
import { useNotesStore } from "@/store/widgets";
import { cn } from "@/lib/utils";

export default function NotesPage() {
  const { notes, load, addNote, updateNote, removeNote } = useNotesStore();
  const [text, setText] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingText, setEditingText] = React.useState("");
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    load();
  }, [load]);

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    addNote(value);
    setText("");
    inputRef.current?.focus();
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight">随时记写</h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            共 {notes.length} 条记录 · 点击卡片即可编辑
          </p>
        </div>
      </div>

      {/* 输入区 */}
      <div className="rounded-xl border border-whisper bg-white/60 p-3 backdrop-blur-sm">
        <div className="flex items-start gap-2 rounded-lg border border-whisper bg-white/70 p-3">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="写下点什么... (Enter 提交，Shift+Enter 换行)"
            rows={3}
            className="min-h-[60px] w-full resize-none bg-transparent text-[14px] leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="flex shrink-0 items-center gap-1 rounded px-3 py-1.5 text-[13px] font-medium text-background bg-foreground hover:bg-foreground/90 disabled:opacity-30 transition-opacity"
          >
            <Plus className="h-3.5 w-3.5" />
            添加
          </button>
        </div>
      </div>

      {/* 记录列表 */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-whisper bg-white/40 py-20 text-center">
          <StickyNote className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-[14px] text-muted-foreground/70">暂无记录</p>
          <p className="mt-1 text-[12px] text-muted-foreground/50">在上方输入框写下你的想法</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {notes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative flex flex-col rounded-lg border border-whisper bg-white/60 p-4 hover:shadow-card transition-shadow"
            >
              {editingId === note.id ? (
                <textarea
                  autoFocus
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      commitEdit();
                    }
                    if (e.key === "Escape") {
                      setEditingId(null);
                      setEditingText("");
                    }
                  }}
                  onBlur={commitEdit}
                  rows={3}
                  className="w-full resize-none rounded border border-whisper bg-white/70 px-2 py-1.5 text-[13px] leading-relaxed focus:outline-none"
                />
              ) : (
                <>
                  <p
                    onClick={() => startEdit(note.id, note.text)}
                    className={cn(
                      "min-h-[40px] cursor-text break-words whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90 hover:text-foreground",
                    )}
                    title="点击编辑"
                  >
                    {note.text}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNote(note.id);
                    }}
                    className="absolute top-2 right-2 rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    title="删除"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <span className="mt-2 text-[10px] text-muted-foreground/50">
                    {new Date(note.createdAt).toLocaleString("zh-CN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
