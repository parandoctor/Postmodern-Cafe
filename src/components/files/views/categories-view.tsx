"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, FolderOpen, Edit3, Trash2, GripVertical,
  Image, FileText, Video, Music, Code, Archive,
  File, Book, User, Settings, Star, Heart, Camera, Globe,
  Database, Cloud, Lock, Shield, Zap,
} from "lucide-react";
import { CategoryModal } from "@/components/categories/category-modal";
import {
  CATEGORY_IMPORTANCE, CATEGORY_IMPORTANCE_ORDER, type CategoryImportance, type Category,
} from "@/types";
import {
  getCategories, createCategory, updateCategory, deleteCategory, reorderCategories,
} from "@/actions/categories";
import { useCategoryStore } from "@/store";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  folder: FolderOpen, image: Image, "file-text": FileText, video: Video,
  music: Music, code: Code, archive: Archive, file: File, book: Book,
  user: User, settings: Settings, star: Star, heart: Heart, camera: Camera,
  globe: Globe, database: Database, cloud: Cloud, lock: Lock, shield: Shield,
  zap: Zap,
};

function ImportanceSegments({ importance }: { importance: CategoryImportance }) {
  const level = CATEGORY_IMPORTANCE[importance].level;
  return (
    <span className="flex gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <i
          key={i}
          className={cn(
            "block h-4 w-[7px] border border-current",
            i < level ? "bg-current" : "bg-transparent",
          )}
        />
      ))}
    </span>
  );
}

export function CategoriesView() {
  const router = useRouter();
  const { categories, setCategories, setActiveCategory } = useCategoryStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [message, setMessage] = React.useState("");
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  const loadCategories = React.useCallback(async () => {
    try {
      const res = await getCategories();
      if (res.success && res.data) setCategories(res.data);
      else if (res.error) setMessage(res.error);
    } catch {
      setMessage("加载分类失败");
    } finally {
      setIsLoading(false);
    }
  }, [setCategories]);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = async (data: {
    name: string;
    importance: CategoryImportance;
    icon: string;
    description: string;
  }) => {
    const res = await createCategory(data);
    if (!res.success) throw new Error(res.error ?? "创建失败");
    setMessage(`分类 "${data.name}" 创建成功`);
    await loadCategories();
    setTimeout(() => setMessage(""), 2000);
  };

  const handleUpdate = async (data: {
    name: string;
    importance: CategoryImportance;
    icon: string;
    description: string;
  }) => {
    if (!editingCategory) return;
    const res = await updateCategory(editingCategory.id, data);
    if (!res.success) throw new Error(res.error ?? "更新失败");
    setMessage("分类已更新");
    await loadCategories();
    setTimeout(() => setMessage(""), 2000);
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`确定删除 "${cat.name}"？该分类下文件将变为未分类。`)) return;
    const res = await deleteCategory(cat.id);
    if (!res.success) {
      alert(res.error);
      return;
    }
    setMessage(`"${cat.name}" 已删除`);
    await loadCategories();
    setTimeout(() => setMessage(""), 2000);
  };

  const handleDrop = async (targetId: string) => {
    const fromId = dragId;
    setDragId(null);
    setOverId(null);
    if (!fromId || fromId === targetId) return;

    const from = categories.find((c) => c.id === fromId);
    const target = categories.find((c) => c.id === targetId);
    if (!from || !target || from.importance !== target.importance) return;

    const groupOrder = CATEGORY_IMPORTANCE_ORDER;
    const remaining = categories.filter((c) => c.id !== fromId);
    const targetIdx = remaining.findIndex((c) => c.id === targetId);
    if (targetIdx === -1) return;
    const next = [...remaining.slice(0, targetIdx), from, ...remaining.slice(targetIdx)];
    setCategories(next);
    const res = await reorderCategories(
      groupOrder.flatMap((level) => next.filter((c) => c.importance === level).map((c) => c.id)),
    );
    if (!res.success) {
      setMessage(res.error ?? "排序失败");
      await loadCategories();
    }
  };

  const grouped = CATEGORY_IMPORTANCE_ORDER.map((level) => ({
    level,
    items: categories.filter((c) => c.importance === level),
  }));

  const totalFiles = categories.reduce((sum, c) => sum + c.fileCount, 0);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <span className="font-mono text-[11px] tracking-widest">LOADING / 加载中...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed right-6 top-6 z-50 border border-foreground bg-background px-4 py-2 font-mono text-[11px]"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-foreground pb-3">
        <div>
          <h1 className="font-[Bahnschrift] text-[34px] leading-none tracking-tight">分类管理</h1>
          <p className="mt-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
            {categories.length} CATEGORIES · {totalFiles} FILES · SORTED BY IMPORTANCE
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setModalOpen(true);
          }}
          className="border border-foreground bg-foreground px-3 py-2 font-mono text-[11px] tracking-widest text-background"
        >
          ＋ 新建分类
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
          <FolderOpen className="h-10 w-10 opacity-30" />
          <p className="font-mono text-[11px] tracking-widest">NO CATEGORIES / 尚未创建分类</p>
          <button
            onClick={() => {
              setEditingCategory(null);
              setModalOpen(true);
            }}
            className="border border-foreground px-3 py-1.5 font-mono text-[11px]"
          >
            创建第一个分类
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          {grouped.map(({ level, items }) => (
            <section key={level}>
              <div className="flex items-center justify-between border-b border-foreground pb-1.5">
                <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em]">
                  <ImportanceSegments importance={level} />
                  {CATEGORY_IMPORTANCE[level].label} / {CATEGORY_IMPORTANCE[level].short}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">{items.length} ITEMS</span>
              </div>

              {items.length === 0 ? (
                <p className="border-b border-foreground/15 py-3 font-mono text-[10px] text-muted-foreground">
                  — 该重要性下暂无分类
                </p>
              ) : (
                <div className="border-x border-b border-foreground/15">
                  {items.map((cat) => {
                    const IconComponent = (ICONS[cat.icon] ?? FolderOpen) as React.ComponentType<{ className?: string }>;
                    return (
                      <div
                        key={cat.id}
                        draggable
                        onDragStart={() => setDragId(cat.id)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setOverId(cat.id);
                        }}
                        onDrop={() => handleDrop(cat.id)}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverId(null);
                        }}
                        className={cn(
                          "group flex items-center gap-3 border-b border-foreground/15 px-3 py-3 last:border-b-0 hover:bg-foreground/[0.04]",
                          dragId === cat.id && "opacity-40",
                          overId === cat.id && dragId !== cat.id && "border-t-2 border-t-foreground",
                        )}
                      >
                        <span className="cursor-grab font-mono text-[12px] text-muted-foreground/60">
                          <GripVertical className="h-4 w-4" />
                        </span>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-foreground/30">
                          <IconComponent className="h-4 w-4" />
                        </span>
                        <button
                          onClick={() => {
                            setActiveCategory(cat.id);
                            router.push(`/dashboard/categories/${cat.id}`);
                          }}
                          className="min-w-0 flex-1 text-left"
                        >
                          <span className="block truncate text-[14px] font-semibold">{cat.name}</span>
                          <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">
                            {cat.description || "—"}
                          </span>
                        </button>
                        <span className="hidden shrink-0 items-center gap-2 font-mono text-[11px] sm:flex">
                          <span className="flex gap-[2px]">
                            {[0, 1, 2, 3].map((i) => (
                              <i
                                key={i}
                                className={cn(
                                  "block h-4 w-[7px] border border-foreground",
                                  i < CATEGORY_IMPORTANCE[cat.importance].level ? "bg-foreground" : "bg-transparent",
                                )}
                              />
                            ))}
                          </span>
                          <span className="text-muted-foreground">{CATEGORY_IMPORTANCE[cat.importance].label}</span>
                        </span>
                        <span className="w-14 shrink-0 text-right font-mono text-[11px] text-muted-foreground">
                          {cat.fileCount} 文件
                        </span>
                        <span className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setModalOpen(true);
                            }}
                            className="border border-foreground/25 p-1.5 hover:bg-foreground hover:text-background"
                            title="编辑"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            className="border border-foreground/25 p-1.5 hover:bg-foreground hover:text-background"
                            title="删除"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ))}

          <div className="flex items-center gap-3 border border-dashed border-foreground/30 px-3 py-3 text-muted-foreground">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-foreground/30 font-mono text-[11px]">○</span>
            <span className="flex-1">
              <span className="block text-[14px] font-semibold text-foreground">未分类</span>
              <span className="mt-0.5 block font-mono text-[10px]">SYSTEM · 未归档文件自动进入 · 不可编辑</span>
            </span>
          </div>
        </div>
      )}

      <CategoryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={editingCategory ? handleUpdate : handleCreate}
        initialData={
          editingCategory
            ? {
                name: editingCategory.name,
                importance: editingCategory.importance,
                icon: editingCategory.icon,
                description: editingCategory.description ?? "",
              }
            : { importance: 1 }
        }
        title={editingCategory ? "编辑分类" : "新建分类"}
      />
    </div>
  );
}

export default CategoriesView;
