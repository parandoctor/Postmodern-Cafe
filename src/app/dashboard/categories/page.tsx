"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, FolderOpen, Edit3, Trash2, X, Minimize2, Maximize2,
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
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  folder: FolderOpen, image: Image, "file-text": FileText, video: Video,
  music: Music, code: Code, archive: Archive, file: File, book: Book,
  user: User, settings: Settings, star: Star, heart: Heart, camera: Camera,
  globe: Globe, database: Database, cloud: Cloud, lock: Lock, shield: Shield,
  zap: Zap,
};

/* Distribute categories evenly across 5 columns */
const COL_COUNT = 5;

function distributeToColumns<T>(items: T[]): T[][] {
  const cols: T[][] = Array.from({ length: COL_COUNT }, () => []);
  items.forEach((item, i) => {
    const col = cols[i % COL_COUNT];
    if (col) col.push(item);
  });
  return cols;
}

/* ── Browser Window Card ── */
function BrowserWindow({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  const offsetX = (index - 2) * 4; // cascade spread
  const offsetY = index * 8;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.55,
        delay: 0.08 * index,
        ease: [0.22, 0.85, 0.25, 1],
      }}
      className="relative flex flex-col"
      style={{
        zIndex: 10 + index,
        marginTop: index > 0 ? -6 : 0,
      }}
    >
      {/* Depth shadow layers */}
      <div
        className="absolute inset-0 rounded-lg bg-black/[0.05]"
        style={{
          transform: `translate(${offsetX + 3}px, ${offsetY + 3}px)`,
        }}
      />
      <div
        className="absolute inset-0 rounded-lg bg-black/[0.08]"
        style={{
          transform: `translate(${offsetX + 1.5}px, ${offsetY + 1.5}px)`,
        }}
      />

      {/* Window frame — translucent so blueprint shows through */}
      <div className="relative flex flex-col rounded-lg border border-black/[0.12] bg-white/70 backdrop-blur-md shadow-card overflow-hidden">
        {/* Title bar */}
        <div className="flex h-9 shrink-0 items-center gap-2 border-b border-black/[0.08] bg-white/60 px-3">
          {/* Traffic light dots */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-black/[0.30]" />
            <span className="h-2.5 w-2.5 rounded-full bg-black/[0.22]" />
            <span className="h-2.5 w-2.5 rounded-full bg-black/[0.15]" />
          </div>
          <span className="flex-1 text-center text-[10px] font-medium text-muted-foreground tracking-wider uppercase select-none">
            分类面板 {index + 1}
          </span>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Category Card inside a window ── */
function CategoryCard({
  cat,
  onEdit,
  onDelete,
  onClick,
}: {
  cat: Category;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  const colorInfo = RAINBOW_COLORS[cat.color] ?? RAINBOW_COLORS.blue;
  const IconComponent = (ICONS[cat.icon] ?? FolderOpen) as React.ComponentType<{ className?: string }>;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.25, ease: [0.22, 0.85, 0.25, 1] }}
      onClick={onClick}
      className="group relative cursor-pointer rounded border border-black/[0.10] bg-white/60 backdrop-blur-sm p-3 hover:border-black/[0.25] transition-all duration-200"
    >
      {/* Hard edge accent strip */}
      <div
        className="absolute left-0 top-0 h-full w-[3px] rounded-l-sm"
        style={{ backgroundColor: colorInfo.hex }}
      />

      <div className="flex items-start gap-3 pl-1">
        <IconComponent className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-semibold truncate text-foreground">{cat.name}</h3>
          {cat.description && (
            <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{cat.description}</p>
          )}
          <p className="mt-1.5 text-[10px] text-muted-foreground/60 tabular-nums">
            {cat.fileCount} 个文件
          </p>
        </div>

        {/* Hover actions */}
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="rounded p-1 hover:bg-black/5 transition-colors"
            title="编辑"
          >
            <Edit3 className="h-3 w-3 text-muted-foreground" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="rounded p-1 hover:bg-black/5 transition-colors"
            title="删除"
          >
            <Trash2 className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */
export default function CategoriesPage() {
  const router = useRouter();
  const { categories, setCategories } = useCategoryStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [defaultColor, setDefaultColor] = React.useState<RainbowColor>("blue");
  const [message, setMessage] = React.useState("");
  const [addColIdx, setAddColIdx] = React.useState<number | null>(null);

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
    setAddColIdx(null);
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
    if (!confirm(`确定删除 "${cat.name}"？该分类下文件将变为未分类。`)) return;
    const res = await deleteCategory(cat.id);
    if (!res.success) { alert(res.error); return; }
    setMessage(`"${cat.name}" 已删除`);
    await loadCategories();
    setTimeout(() => setMessage(""), 2000);
  };

  const openCreateModal = (colIdx: number) => {
    setEditingCategory(null);
    setDefaultColor("blue");
    setAddColIdx(colIdx);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setAddColIdx(null);
  };

  const totalFiles = categories.reduce((sum, c) => sum + c.fileCount, 0);
  const columns = distributeToColumns(categories);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 right-6 z-50 rounded border border-black/[0.12] bg-white/85 backdrop-blur px-4 py-3 text-[14px] text-foreground"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-6 py-5 shrink-0">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.3px]">分类管理</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {categories.length} 个分类 · {totalFiles} 个文件
          </p>
        </div>
        <Button className="gap-2" onClick={() => openCreateModal(0)}>
          <Plus className="h-4 w-4" /> 新建分类
        </Button>
      </div>

      {/* Browser window grid */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-10">
        {categories.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground/20" />
            <p className="text-[14px] text-muted-foreground">尚未创建任何分类</p>
            <Button className="mt-4" onClick={() => openCreateModal(0)}>
              <Plus className="h-4 w-4 mr-1.5" /> 创建第一个分类
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: COL_COUNT }).map((_, colIdx) => (
              <BrowserWindow key={colIdx} index={colIdx}>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {(columns[colIdx] ?? []).map((cat) => (
                      <CategoryCard
                        key={cat.id}
                        cat={cat}
                        onEdit={() => openEditModal(cat)}
                        onDelete={() => handleDelete(cat)}
                        onClick={() => router.push(`/dashboard/categories/${cat.color}`)}
                      />
                    ))}
                  </AnimatePresence>

                  {/* Add button per column */}
                  <button
                    onClick={() => openCreateModal(colIdx)}
                    className="flex w-full items-center justify-center gap-1.5 rounded border border-dashed border-black/[0.15] py-3 text-[12px] text-muted-foreground hover:border-black/[0.30] hover:text-foreground transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    在此列添加
                  </button>
                </div>
              </BrowserWindow>
            ))}
          </div>
        )}
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
