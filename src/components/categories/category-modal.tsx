"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_IMPORTANCE, CATEGORY_IMPORTANCE_ORDER, type CategoryImportance,
} from "@/types";
import { cn } from "@/lib/utils";
import {
  FolderOpen, Image, FileText, Video, Music, Code, Archive,
  File, Book, User, Settings, Star, Heart, Camera, Globe,
  Database, Cloud, Lock, Shield, Zap,
} from "lucide-react";

const ICONS: { name: string; icon: React.ElementType }[] = [
  { name: "folder", icon: FolderOpen },
  { name: "image", icon: Image },
  { name: "file-text", icon: FileText },
  { name: "video", icon: Video },
  { name: "music", icon: Music },
  { name: "code", icon: Code },
  { name: "archive", icon: Archive },
  { name: "file", icon: File },
  { name: "book", icon: Book },
  { name: "user", icon: User },
  { name: "settings", icon: Settings },
  { name: "star", icon: Star },
  { name: "heart", icon: Heart },
  { name: "camera", icon: Camera },
  { name: "globe", icon: Globe },
  { name: "database", icon: Database },
  { name: "cloud", icon: Cloud },
  { name: "lock", icon: Lock },
  { name: "shield", icon: Shield },
  { name: "zap", icon: Zap },
];

interface CategoryFormData {
  name: string;
  importance: CategoryImportance;
  icon: string;
  description: string;
}

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  initialData?: Partial<CategoryFormData>;
  title: string;
}

function ImportanceSegments({ importance }: { importance: CategoryImportance }) {
  const level = CATEGORY_IMPORTANCE[importance].level;
  return (
    <span className="flex gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <i
          key={i}
          className={cn(
            "block h-4 w-[7px] border border-foreground",
            i < level ? "bg-foreground" : "bg-transparent",
          )}
        />
      ))}
    </span>
  );
}

export function CategoryModal({
  open,
  onClose,
  onSubmit,
  initialData,
  title,
}: CategoryModalProps) {
  const [name, setName] = React.useState(initialData?.name ?? "");
  const [importance, setImportance] = React.useState<CategoryImportance>(
    initialData?.importance ?? 1,
  );
  const [icon, setIcon] = React.useState(initialData?.icon ?? "folder");
  const [description, setDescription] = React.useState(initialData?.description ?? "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setImportance(initialData?.importance ?? 1);
      setIcon(initialData?.icon ?? "folder");
      setDescription(initialData?.description ?? "");
      setError("");
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("请输入分类名称");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await onSubmit({ name: name.trim(), importance, icon, description: description.trim() });
      onClose();
    } catch (err) {
      setError((err as Error).message || "操作失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const SelectedIcon = (ICONS.find((i) => i.name === icon)?.icon || FolderOpen) as React.ComponentType<{ className?: string }>;

  return (
    <Dialog open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5 font-mono text-[12px]">
        <div className="flex items-center gap-3 border border-foreground/30 p-4">
          <span className="flex h-10 w-10 items-center justify-center border border-foreground/40">
            <SelectedIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-sans text-[14px] font-semibold">
              {name || "分类名称"}
            </span>
            <span className="mt-1 flex items-center gap-2 text-[10px] tracking-widest text-muted-foreground">
              <ImportanceSegments importance={importance} />
              {CATEGORY_IMPORTANCE[importance].label}
            </span>
          </span>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] tracking-[0.2em] text-muted-foreground">
            分类名称 / NAME
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：工作档案"
            maxLength={32}
            className="w-full border border-foreground/30 bg-transparent px-3 py-2.5 font-sans text-[13px] outline-none focus:border-foreground"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] tracking-[0.2em] text-muted-foreground">
            重要性 / IMPORTANCE
          </label>
          <div className="grid grid-cols-4 gap-px border border-foreground/30 bg-foreground/30">
            {CATEGORY_IMPORTANCE_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setImportance(key)}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-2.5 text-[11px] transition-colors",
                  importance === key
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground hover:bg-foreground/5",
                )}
              >
                <ImportanceSegments importance={key} />
                {CATEGORY_IMPORTANCE[key].label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] tracking-[0.2em] text-muted-foreground">
            图标 / ICON
          </label>
          <div className="grid max-h-32 grid-cols-6 gap-px overflow-y-auto border border-foreground/30 bg-foreground/30">
            {ICONS.map(({ name: iconName, icon: IconComp }) => {
              const IconEl = IconComp as React.ComponentType<{ className?: string }>;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={cn(
                    "flex h-9 items-center justify-center transition-colors",
                    icon === iconName
                      ? "bg-foreground text-background"
                      : "bg-background text-muted-foreground hover:bg-foreground/5",
                  )}
                  title={iconName}
                >
                  <IconEl className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] tracking-[0.2em] text-muted-foreground">
            描述 / DESCRIPTION
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简短描述这个分类的用途..."
            maxLength={200}
            rows={2}
            className="w-full resize-none border border-foreground/30 bg-transparent px-3 py-2.5 font-sans text-[13px] outline-none focus:border-foreground"
          />
        </div>

        {error && <p className="text-[12px] text-destructive">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存分类"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
