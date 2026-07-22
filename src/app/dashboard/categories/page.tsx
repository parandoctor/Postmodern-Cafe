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
    <div className="flex flex-col h-full -m-6 lg:-m-8">
      {/* Message toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 right-6 z-50 rounded-xl border border-border/50 bg-card px-4 py-3 shadow-lg text-sm"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top action bar */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">分类管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {categories.length} 个分类 · {totalFiles} 个文件
          </p>
        </div>
        <Button className="gap-2" onClick={() => openCreateModal()}>
          <Plus className="h-4 w-4" /> 新建分类
        </Button>
      </div>

      {/* Full-screen 7-color layout */}
      <div className="flex flex-1">
        {RAINBOW_ORDER.map((color) => {
          const cat = categories.find((c) => c.color === color);
          const colorInfo = RAINBOW_COLORS[color];
          const IconComponent = (cat ? (ICONS[cat.icon] ?? FolderOpen) : FolderOpen) as React.ComponentType<{ className?: string }>;

          return (
            <motion.div
              key={color}
              className="relative flex flex-1 flex-col items-center justify-center group min-w-0 cursor-pointer"
              style={{ backgroundColor: colorInfo.hex }}
              whileHover={{ flexGrow: 1.15 }}
              transition={{ duration: 0.3 }}
              onClick={() => { if (cat) router.push(`/dashboard/categories/${color}`); }}
            >
              {/* Hover: edit/delete */}
              {cat && (
                <div className="absolute bottom-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(cat); }}
                    className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(cat); }}
                    className="rounded-lg bg-white/20 p-2 text-white hover:bg-red-500/50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Center content */}
              <div className="flex flex-col items-center gap-3 text-center px-4">
                <IconComponent className="h-12 w-12 text-white/80" />
                {cat ? (
                  <>
                    <h2 className="text-2xl font-bold text-white">{cat.name}</h2>
                    <p className="text-sm text-white/70">{cat.fileCount} 个文件</p>
                    {cat.description && (
                      <p className="text-xs text-white/50 max-w-[200px] truncate">
                        {cat.description}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white/60">{colorInfo.label}色</h2>
                    <p className="text-sm text-white/40">空置中</p>
                    <button
                      onClick={() => openCreateModal(color)}
                      className="mt-2 rounded-lg bg-white/20 px-3 py-1.5 text-xs text-white hover:bg-white/30 transition-colors"
                    >
                      <Plus className="inline h-3 w-3 mr-1" />
                      添加分类
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
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
