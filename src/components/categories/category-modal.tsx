"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RAINBOW_COLORS, type RainbowColor } from "@/types";
import { cn, getContrastColor } from "@/lib/utils";
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
  color: RainbowColor;
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

export function CategoryModal({
  open,
  onClose,
  onSubmit,
  initialData,
  title,
}: CategoryModalProps) {
  const [name, setName] = React.useState(initialData?.name ?? "");
  const [color, setColor] = React.useState<RainbowColor>(initialData?.color ?? "blue");
  const [icon, setIcon] = React.useState(initialData?.icon ?? "folder");
  const [description, setDescription] = React.useState(initialData?.description ?? "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setColor(initialData?.color ?? "blue");
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
      await onSubmit({ name: name.trim(), color, icon, description: description.trim() });
      onClose();
    } catch (err) {
      setError((err as Error).message || "操作失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorInfo = RAINBOW_COLORS[color];
  const SelectedIcon = (ICONS.find((i) => i.name === icon)?.icon || FolderOpen) as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

  return (
    <Dialog open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Preview */}
        <div
          className="flex flex-col items-center gap-3 rounded-xl p-6 transition-colors"
          style={{ backgroundColor: `${colorInfo.hex}15` }}
        >
          <SelectedIcon className="h-10 w-10" style={{ color: getContrastColor(colorInfo.hex) }} />
          <p className="text-sm font-medium">{name || "分类名称"}</p>
        </div>

        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">分类名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：工作文档"
            maxLength={32}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        {/* Color */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">颜色绑定</label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(RAINBOW_COLORS) as [RainbowColor, typeof RAINBOW_COLORS[RainbowColor]][]).map(
              ([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColor(key)}
                  className={cn(
                    "h-9 w-9 rounded-full border-2 transition-all duration-200",
                    color === key
                      ? "border-foreground scale-110 shadow-lg"
                      : "border-transparent hover:scale-105",
                  )}
                  style={{ backgroundColor: value.hex }}
                  title={value.label}
                />
              ),
            )}
          </div>
        </div>

        {/* Icon */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">图标绑定</label>
          <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto rounded-xl border border-border/50 p-2">
            {ICONS.map(({ name: iconName, icon: IconComp }) => {
              const IconEl = IconComp as React.ComponentType<{ className?: string }>;
              return (
              <button
                key={iconName}
                type="button"
                onClick={() => setIcon(iconName)}
                className={cn(
                  "flex items-center justify-center rounded-lg p-2 transition-all duration-200",
                  icon === iconName
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title={iconName}
              >
                <IconEl className="h-5 w-5" />
              </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">描述（可选）</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简短描述这个分类的用途..."
            maxLength={200}
            rows={2}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            取消
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
