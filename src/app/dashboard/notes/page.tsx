"use client";

import * as React from "react";
import { Check, ChevronLeft, Eye, FileText, Loader2, PanelLeft, Pencil, Plus, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { useNotesStore } from "@/store/widgets";
import { FileDrawer } from "@/components/files/file-drawer";

function titleOf(text: string) {
  const line = text.split("\n").map((item) => item.trim()).find(Boolean) ?? "未命名笔记";
  return line.replace(/^#{1,6}\s*/, "").replace(/^[-*+]\s+/, "").slice(0, 46) || "未命名笔记";
}

export default function NotesPage() {
  const { notes, hydrated, load, addNote, updateNote, removeNote } = useNotesStore();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [mode, setMode] = React.useState<"edit" | "preview">("edit");
  const [indexOpen, setIndexOpen] = React.useState(true);
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = React.useState("");
  const selectedRef = React.useRef<string | null>(null);
  const draftRef = React.useRef("");
  const lastSavedRef = React.useRef("");
  const saveQueueRef = React.useRef<Promise<void>>(Promise.resolve());
  const timerRef = React.useRef<number | null>(null);

  const selected = notes.find((note) => note.id === selectedId) ?? null;
  selectedRef.current = selectedId;
  draftRef.current = draft;

  React.useEffect(() => { void load(); }, [load]);

  React.useEffect(() => {
    if (!hydrated) return;
    if (selectedId && notes.some((note) => note.id === selectedId)) return;
    const first = notes[0];
    if (first) {
      setSelectedId(first.id);
      setDraft(first.text);
      lastSavedRef.current = first.text;
      setStatus("saved");
    } else {
      setSelectedId(null);
      setDraft("");
    }
  }, [hydrated, notes, selectedId]);

  const queueSave = React.useCallback((id: string, text: string) => {
    if (!text.trim() || text === lastSavedRef.current) return;
    setStatus("saving");
    setError("");
    saveQueueRef.current = saveQueueRef.current.then(async () => {
      const result = await updateNote(id, text);
      if (result) {
        if (selectedRef.current === id && draftRef.current === text) {
          lastSavedRef.current = text;
          setStatus("saved");
        }
      } else {
        setStatus("error");
        setError("保存失败，请重试");
      }
    });
  }, [updateNote]);

  const saveNow = React.useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (selectedRef.current) queueSave(selectedRef.current, draftRef.current);
  }, [queueSave]);

  React.useEffect(() => {
    if (!selectedId || draft === lastSavedRef.current) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => queueSave(selectedId, draft), 800);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [draft, selectedId, queueSave]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveNow();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveNow]);

  const selectNote = (id: string) => {
    if (id === selectedId) return;
    saveNow();
    const note = notes.find((item) => item.id === id);
    if (!note) return;
    setSelectedId(id);
    setDraft(note.text);
    lastSavedRef.current = note.text;
    setStatus("saved");
    setMode("edit");
    if (window.innerWidth < 1024) setIndexOpen(false);
  };

  const createNote = async () => {
    saveNow();
    const text = "# 新笔记\n\n";
    const note = await addNote(text);
    if (!note) return;
    setSelectedId(note.id);
    setDraft(note.text);
    lastSavedRef.current = "";
    setStatus("idle");
    setMode("edit");
    if (window.innerWidth < 1024) setIndexOpen(false);
  };

  const deleteNote = async (id: string) => {
    if (!window.confirm("确定删除这篇笔记？")) return;
    const ok = await removeNote(id);
    if (!ok) return;
    const next = notes.find((note) => note.id !== id);
    if (selectedId === id) {
      setSelectedId(next?.id ?? null);
      setDraft(next?.text ?? "");
      lastSavedRef.current = next?.text ?? "";
      setStatus("idle");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#dedede] pb-5">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-[#999]">NOTES</p>
          <h1 className="mt-2 font-editorial text-[32px] tracking-[-0.03em]">笔记管理</h1>
          <p className="mt-2 text-[12px] text-[#888]">Markdown 自动保存，文件收在下方抽屉里。</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[11px] text-[#999]">
            {status === "saving" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : status === "saved" ? <Check className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
            {status === "saving" ? "保存中" : status === "saved" ? "已保存" : status === "error" ? "保存失败" : "未修改"}
          </span>
          <button onClick={() => void createNote()} className="flex items-center gap-1.5 bg-[#111] px-3 py-2 text-[12px] text-white"><Plus className="h-3.5 w-3.5" />新建</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className={cn("min-w-0 lg:block", !indexOpen && "hidden")}>
          <div className="flex items-center justify-between border-b border-[#dedede] pb-2">
            <span className="text-[11px] tracking-[0.16em] text-[#999]">INDEX</span>
            <button onClick={() => setIndexOpen(false)} className="lg:hidden text-[11px] text-[#999]">收起</button>
          </div>
          <div className="mt-2 max-h-[60vh] overflow-y-auto">
            {notes.length === 0 ? <p className="py-8 text-[12px] text-[#aaa]">还没有笔记。</p> : notes.map((note) => (
              <button key={note.id} onClick={() => selectNote(note.id)} className={cn("group flex w-full items-start gap-2 border-b border-[#f0f0f0] px-1 py-3 text-left", selectedId === note.id ? "text-black" : "text-[#777] hover:text-black")}>
                <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", selectedId === note.id ? "bg-black" : "bg-[#d6d6d6]")} />
                <span className="min-w-0 flex-1"><span className="block truncate text-[12px]">{titleOf(note.text)}</span><span className="mt-1 block text-[10px] text-[#aaa]">{new Date(note.updatedAt).toLocaleDateString("zh-CN")}</span></span>
                <span onClick={(event) => { event.stopPropagation(); void deleteNote(note.id); }} className="mt-0.5 hidden p-1 text-[#aaa] hover:text-black group-hover:block"><Trash2 className="h-3 w-3" /></span>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button onClick={() => setIndexOpen((value) => !value)} className="flex items-center gap-1.5 text-[11px] text-[#888] hover:text-black lg:hidden"><PanelLeft className="h-3.5 w-3.5" />笔记索引</button>
            <div className="ml-auto flex border border-[#dedede] p-0.5">
              <button onClick={() => setMode("edit")} className={cn("flex items-center gap-1 px-3 py-1.5 text-[11px]", mode === "edit" ? "bg-[#111] text-white" : "text-[#777]")}><Pencil className="h-3 w-3" />编辑</button>
              <button onClick={() => setMode("preview")} className={cn("flex items-center gap-1 px-3 py-1.5 text-[11px]", mode === "preview" ? "bg-[#111] text-white" : "text-[#777]")}><Eye className="h-3 w-3" />预览</button>
            </div>
          </div>

          {error && <div className="mb-3 border border-[#d8d8d8] bg-[#fafafa] px-3 py-2 text-[12px] text-[#555]">{error}</div>}

          {selected ? (
            mode === "edit" ? (
              <textarea
                value={draft}
                onChange={(event) => { setDraft(event.target.value); setStatus("idle"); }}
                onBlur={saveNow}
                className="min-h-[56vh] w-full resize-y border-0 bg-white px-0 py-2 font-sans text-[15px] leading-8 text-[#222] outline-none placeholder:text-[#bbb]"
                placeholder="从一个标题开始..."
              />
            ) : (
              <article className="note-prose min-h-[56vh] border-t border-[#f0f0f0] py-5">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft || "*还没有内容。*"}</ReactMarkdown>
              </article>
            )
          ) : (
            <div className="flex min-h-[56vh] flex-col items-center justify-center border border-dashed border-[#dedede] text-center">
              <FileText className="h-8 w-8 text-[#ccc]" strokeWidth={1.2} />
              <p className="mt-3 text-[13px] text-[#888]">新建一篇笔记，或者从左侧选择。</p>
              <button onClick={() => void createNote()} className="mt-4 flex items-center gap-1.5 border border-[#111] px-4 py-2 text-[12px]"><Plus className="h-3.5 w-3.5" />新建笔记</button>
            </div>
          )}
        </section>
      </div>

      <FileDrawer />
    </div>
  );
}
