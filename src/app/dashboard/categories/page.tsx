"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, FolderOpen, Edit3, Trash2,
  Image, FileText, Video, Music, Code, Archive,
  File, Book, User, Settings, Star, Heart, Camera, Globe,
  Database, Cloud, Lock, Shield, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryModal } from "@/components/categories/category-modal";
import { RAINBOW_COLORS, type RainbowColor, type Category } from "@/types";
import { getContrastColor } from "@/lib/utils";
import {
  getCategories, createCategory, updateCategory, deleteCategory,
} from "@/actions/categories";
import { useCategoryStore } from "@/store";

const ICONS: Record<string, React.ElementType> = {
  folder: FolderOpen, image: Image, "file-text": FileText, video: Video,
  music: Music, code: Code, archive: Archive, file: File, book: Book,
  user: User, settings: Settings, star: Star, heart: Heart, camera: Camera,
  globe: Globe, database: Database, cloud: Cloud, lock: Lock, shield: Shield,
  zap: Zap,
};

const RAINBOW_ORDER: RainbowColor[] = ["red", "orange", "yellow", "green", "blue", "darkblue", "purple"];

export default function CategoriesPage() {
  const router = useRouter();
  const { categories, setCategories } = useCategoryStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [defaultColor, setDefaultColor] = React.useState<RainbowColor>("blue");
  const [message, setMessage] = React.useState("");

  const loadCategories = React.useCallback(async () => {
    try {
      const res = await getCategories();
      if (res.success && res.data) setCategories(res.data);
    } catch (err) {
      console.error("加载分类失败:", err);
    } finally {
      setIsLoading(false);
    }
  }, [setCategories]);

  React.useEffect(() => { loadCategories(); }, [loadCategories]);

  const handleCreate = async (data: {
    name: string; color: RainbowColor; icon: string; description: string;
  }) => {
    const res = await createCategory(data);
    if (!res.success) throw new Error(res.error ?? "创建失败");
    setMessage(`分类 "${data.name}" 创建成功`);
    await loadCategories();
    setTimeout(() => setMessage(""), 2000);
  };

  const handleUpdate = async (data: {
    name: string; color: RainbowColor; icon: string; description: string;
  }) => {
    if (!editingCategory) return;
    const res = await updateCategory(editingCategory.id, data);
    if (!res.success) throw new Error(res.error ?? "更新失败");
    setMessage("分类已更新");
    setEditingCategory(null);
    await loadCategories();
    setTimeout(() => setMessage(""), 2000);
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`确定要删除分类"${cat.name}"吗？该分类下的文件将变为未分类。`)) return;
    const res = await deleteCategory(cat.id);
    if (!res.success) { alert(res.error); return; }
    setMessage(`分类 "${cat.name}" 已删除`);
    await loadCategories();
    setTimeout(() => setMessage(""), 2000);
  };

  const openCreateModal = (color?: RainbowColor) => {
    setEditingCategory(null);
    setDefaultColor(color ?? "blue");
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const totalFiles = categories.reduce((sum, c) => sum + c.fileCount, 0);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 right-6 z-50 rounded-xl border border-black/10 bg-card px-4 py-3 shadow-notion text-sm dark:border-white/10"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top action bar */}
      <div className="flex items-center justify-between px-6 py-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">分类管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {categories.length} 个分类 · {totalFiles} 个文件
          </p>
        </div>
        <Button className="gap-2 shadow-notion" onClick={() => openCreateModal()}>
          <Plus className="h-4 w-4" /> 新建分类
        </Button>
      </div>

      {/* B/W card grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {RAINBOW_ORDER.map((color) => {
            const cat = categories.find((c) => c.color === color);
            const colorInfo = RAINBOW_COLORS[color];
            const IconComponent = (cat ? (ICONS[cat.icon] ?? FolderOpen) : FolderOpen) as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

            return (
              <motion.div
                key={color}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col rounded-xl border border-black/10 bg-card shadow-notion transition-shadow hover:shadow-notion-deep dark:border-white/10"
              >
                {/* Color strip (grayscale) */}
                <div
                  className="h-1.5 w-full rounded-t-xl"
                  style={{ backgroundColor: colorInfo.hex }}
                />

                <div
                  className="flex flex-1 flex-col items-start gap-3 p-5 cursor-pointer"
                  style={{ backgroundColor: `${colorInfo.hex}0a` }}
                  onClick={() => { if (cat) router.push(`/dashboard/categories/${color}`); }}
                >
                  {/* Hover: edit/delete */}
                  {cat && (
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(cat); }}
                        className="rounded-lg bg-black/5 p-2 text-muted-foreground hover:bg-black/10 hover:text-foreground dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(cat); }}
                        className="rounded-lg bg-black/5 p-2 text-muted-foreground hover:bg-black/10 hover:text-destructive dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-black/10 shadow-notion dark:border-white/10">
                    <IconComponent className="h-5 w-5" style={{ color: cat ? getContrastColor(colorInfo.hex) : undefined }} />
                  </div>

                  {cat ? (
                    <>
                      <div>
                        <h2 className="text-base font-semibold leading-tight">{cat.name}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {cat.fileCount} 个文件 · {colorInfo.label}
                        </p>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {cat.description}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <h2 className="text-base font-semibold leading-tight text-muted-foreground">
                          空置分类
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">{colorInfo.label}</p>
                      </div>
                      <button
                        onClick={() => openCreateModal(color)}
                        className="mt-1 inline-flex items-center gap-1 rounded-lg border border-black/10 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-black/5 hover:text-foreground dark:border-white/10 dark:hover:bg-white/10 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        添加分类
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <CategoryModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={editingCategory ? handleUpdate : handleCreate}
        initialData={
          editingCategory
            ? {
                name: editingCategory.name,
                color: editingCategory.color,
                icon: editingCategory.icon,
                description: editingCategory.description ?? "",
              }
            : { color: defaultColor }
        }
        title={editingCategory ? "编辑分类" : "新建分类"}
      />
    </div>
  );
}
