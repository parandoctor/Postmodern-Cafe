"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, StickyNote, Plus, Trash2 } from "lucide-react";
import { useNotesStore } from "@/store/widgets";
import { cn } from "@/lib/utils";

interface NotesModalProps {
  open: boolean;
  onClose: () => void;
}

export function NotesModal({ open, onClose }: NotesModalProps) {
  const { notes, addNote, updateNote, removeNote } = useNotesStore();
  const [text, setText] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingText, setEditingText] = React.useState("");
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

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

  // Keyboard shortcuts
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-whisper bg-card shadow-notion-deep dark:border-white/10"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-whisper px-5 py-3.5 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-foreground">
                  <StickyNote className="h-4 w-4 text-background" />
                </div>
                <h2 className="text-[15px] font-semibold tracking-tight">随时记写</h2>
                <span className="text-[12px] text-muted-foreground">{notes.length} 条记录</span>
              </div>
              <button
                onClick={onClose}
                className="rounded p-1.5 text-muted-foreground hover:bg-[rgba(0,0,0,0.04)] hover:text-foreground dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                title="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Input area */}
            <div className="shrink-0 border-b border-whisper p-4 dark:border-white/10">
              <div className="flex items-start gap-2 rounded-lg border border-whisper bg-background p-3 dark:border-white/10">
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
                  placeholder="写点什么... (Enter 提交，Shift+Enter 换行)"
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

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto p-4">
              {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <StickyNote className="mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-[14px] text-muted-foreground/60">暂无记录</p>
                  <p className="mt-1 text-[12px] text-muted-foreground/40">
                    在上方输入框写下你的想法
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {notes.map((note) => (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative flex flex-col rounded-lg border border-whisper bg-background p-4 hover:shadow-notion transition-shadow dark:border-white/10"
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
                          className="w-full resize-none rounded border border-whisper bg-background px-2 py-1.5 text-[13px] leading-relaxed focus:outline-none dark:border-white/20"
                        />
                      ) : (
                        <>
                          <p
                            onClick={() => startEdit(note.id, note.text)}
                            className="min-h-[40px] cursor-text whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90 hover:text-foreground"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
