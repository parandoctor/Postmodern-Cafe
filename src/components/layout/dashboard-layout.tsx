"use client";

import * as React from "react";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  HardDrive,
  FolderOpen,
  Star,
  Clock,
  Trash2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Image,
  X,
  Check,
  CalendarDays,
  GripVertical,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { logoutUser } from "@/actions/auth";
import { processWallpaperImage } from "@/lib/wallpaper";
import { useUIStore } from "@/store";
import { SidebarTodo } from "@/components/layout/sidebar-todo";
import { SidebarNotes } from "@/components/layout/sidebar-notes";
import { SidebarMusic } from "@/components/layout/sidebar-music";
import { CalendarWidget } from "@/components/layout/calendar-widget";
import { TimerWidget } from "@/components/layout/timer-widget";

const sidebarItems = [
  { label: "任务管理", href: "/dashboard/tasks", icon: Target },
  { label: "我的文件", href: "/dashboard/files", icon: HardDrive },
  { label: "分类管理", href: "/dashboard/categories", icon: FolderOpen },
  { label: "收藏夹", href: "/dashboard/favorites", icon: Star },
  { label: "最近使用", href: "/dashboard/recent", icon: Clock },
  { label: "回收站", href: "/dashboard/recycle", icon: Trash2 },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, sidebarWidth, setSidebarWidth, toggleSidebar, rightOpen, setRightOpen, toggleRight, wallpaper, setWallpaper } = useUIStore();
  const [wallpaperOpen, setWallpaperOpen] = React.useState(false);
  const [wallpaperProcessing, setWallpaperProcessing] = React.useState(false);
  const [workspaceCollapsed, setWorkspaceCollapsed] = React.useState(false);
  const [privateCollapsed, setPrivateCollapsed] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/");
  };

  const handleWallpaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 允许重复选择同一文件
    e.target.value = "";
    setWallpaperProcessing(true);
    try {
      // canvas 智能重绘：EXIF 方向修正、低分图放大防模糊、超大图压缩体积
      const optimized = await processWallpaperImage(file);
      setWallpaper(optimized);
      setWallpaperOpen(false);
    } catch (err) {
      console.error("壁纸优化失败，回退原图", err);
      try {
        // 优化失败时回退：直接使用原始文件
        const raw = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        setWallpaper(raw);
        setWallpaperOpen(false);
      } catch {
        // 完全失败，保持现状
      }
    } finally {
      setWallpaperProcessing(false);
    }
  };

  // ---- Sidebar drag resize ----
  const onMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    const startX = e.clientX;
    const startW = sidebarWidth;
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = ev.clientX - startX;
      const newW = Math.max(200, Math.min(480, startW + delta));
      setSidebarWidth(newW);
    };
    const onUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [sidebarWidth, setSidebarWidth]);

  const currentLabel = sidebarItems.find((s) => pathname === s.href || (s.href !== "/dashboard" && pathname.startsWith(s.href)))?.label ?? "我的文件";

  return (
    <div className="relative flex min-h-screen">
      {/* Wallpaper layer — sits above blueprint, below content */}
      {wallpaper && (
        <div
          className="fixed inset-0 z-[1]"
          style={{
            backgroundImage: `url(${wallpaper})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        />
      )}

      {/* Sidebar - Notion style + draggable */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-whisper bg-white/75 backdrop-blur-md transition-[width] duration-150",
        )}
        style={{ width: sidebarOpen ? sidebarWidth : 64 }}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center border-b border-whisper px-4">
          {sidebarOpen ? (
            <a href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-foreground">
                <NextImage src="/images/cafe-logo-white.png" alt="后现代咖啡馆" width={20} height={20} className="h-5 w-5 object-contain dark:invert" />
              </div>
              <span className="text-[15px] font-semibold tracking-tight">后现代咖啡馆</span>
            </a>
          ) : (
            <a href="/dashboard" className="mx-auto flex h-7 w-7 items-center justify-center rounded bg-foreground">
              <NextImage src="/images/cafe-logo-white.png" alt="后现代咖啡馆" width={20} height={20} className="h-5 w-5 object-contain dark:invert" />
            </a>
          )}
        </div>

        {/* Scroll area: nav + widgets */}
        <div className="flex-1 space-y-2 overflow-y-auto p-2">
          {/* 工作区 — 分组标题（与待办 widget 同格式） */}
          {sidebarOpen && (
            <button
              onClick={() => setWorkspaceCollapsed((c) => !c)}
              className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left hover:bg-[rgba(0,0,0,0.05)] transition-colors"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform",
                  workspaceCollapsed && "-rotate-90",
                )}
              />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                工作区
              </span>
            </button>
          )}
          {!workspaceCollapsed && (
            <nav className="space-y-0.5">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 rounded px-2 py-1.5 transition-colors",
                      isActive
                        ? "bg-[rgba(0,0,0,0.08)] text-foreground"
                        : "text-muted-foreground hover:bg-[rgba(0,0,0,0.05)] hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    {sidebarOpen && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider">
                        {item.label}
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>
          )}

          {/* 私有空间 — 待办 / 随手记 / 音乐盒 */}
          {sidebarOpen && (
            <div className="space-y-1 border-t border-whisper pt-2">
              <button
                onClick={() => setPrivateCollapsed((c) => !c)}
                className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left hover:bg-[rgba(0,0,0,0.05)] transition-colors"
              >
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform",
                    privateCollapsed && "-rotate-90",
                  )}
                />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  私有空间
                </span>
              </button>
              {!privateCollapsed && (
                <div className="space-y-1">
                  <SidebarTodo />
                  <SidebarNotes />
                  <SidebarMusic />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="shrink-0 border-t border-whisper p-2">
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center rounded px-3 py-1.5 text-[14px] text-muted-foreground hover:bg-[rgba(0,0,0,0.05)] hover:text-foreground transition-colors"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>收起</span>
              </>
            ) : (
              <ChevronRight className="h-4 w-4 mx-auto" />
            )}
          </button>
        </div>

        {/* Drag handle */}
        {sidebarOpen && (
          <div
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-notion-blue/20 transition-colors z-50"
            onMouseDown={onMouseDown}
            title="拖动调整侧边栏宽度"
          />
        )}
      </aside>

      {/* Main area */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-150",
          rightOpen ? "lg:mr-[300px]" : "lg:mr-0",
        )}
        style={{ marginLeft: sidebarOpen ? sidebarWidth : 64 }}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-whisper bg-white/70 backdrop-blur-md px-5">
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-medium text-muted-foreground">
              {currentLabel}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleRight}
              className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors lg:hidden"
              title="侧边面板"
            >
              <CalendarDays className="h-4 w-4" />
            </button>
            <button
              onClick={toggleRight}
              className={cn(
                "hidden h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors lg:flex",
                rightOpen && "bg-secondary text-foreground",
              )}
              title={rightOpen ? "收起面板" : "展开面板"}
            >
              <CalendarDays className="h-4 w-4" />
            </button>
            <button
              onClick={() => setWallpaperOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="更换背景"
            >
              <Image className="h-4 w-4" />
            </button>
            {wallpaper && (
              <button
                onClick={() => setWallpaper(null)}
                className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="移除背景"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <a
              href="/profile"
              className="flex h-8 w-8 items-center justify-center rounded hover:bg-secondary transition-colors"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src="" alt="用户" />
                <AvatarFallback className="bg-secondary text-xs text-foreground">
                  U
                </AvatarFallback>
              </Avatar>
            </a>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="退出登录"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="relative z-[2] flex-1 p-5 lg:p-6">
          {children}
        </main>
      </div>

      {/* Wallpaper Dialog */}
      <Dialog
        open={wallpaperOpen}
        onClose={() => setWallpaperOpen(false)}
        title="更换背景壁纸"
        description="上传图片后自动优化清晰度并压缩体积"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleWallpaperUpload}
            className="hidden"
          />
          <button
            onClick={() => {
              setWallpaper(null);
              setWallpaperOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-lg border border-whisper bg-white/60 px-4 py-3 text-sm hover:bg-black/[0.04] transition-colors"
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded",
                !wallpaper ? "bg-foreground text-background" : "bg-secondary",
              )}
            >
              <Check className="h-4 w-4" />
            </span>
            <span className="text-left">
              <span className="block font-medium">默认浅色</span>
              <span className="block text-xs text-muted-foreground">简洁的纯色背景</span>
            </span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={wallpaperProcessing}
            className="flex w-full items-center gap-3 rounded-lg border border-whisper bg-white/60 px-4 py-3 text-sm hover:bg-black/[0.04] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded bg-secondary">
              <Image className="h-4 w-4" />
            </span>
            <span className="text-left">
              <span className="block font-medium">
                {wallpaperProcessing ? "正在优化图片…" : "自定义壁纸"}
              </span>
              <span className="block text-xs text-muted-foreground">
                {wallpaperProcessing
                  ? "正在提升清晰度并压缩体积，请稍候"
                  : "从本地选择一张图片，自动优化清晰度"}
              </span>
            </span>
          </button>
          {wallpaper && (
            <button
              onClick={() => {
                setWallpaper(null);
                setWallpaperOpen(false);
              }}
              className="w-full rounded border border-border px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              移除壁纸
            </button>
          )}
        </div>
      </Dialog>

      {/* Right panel: 日历 + 计时器 */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-40 hidden h-full w-[300px] flex-col border-l border-whisper bg-white/45 backdrop-blur-md transition-transform duration-200 lg:flex",
          rightOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-whisper px-4">
          <span className="text-[14px] font-semibold tracking-tight">面板</span>
          <button
            onClick={() => setRightOpen(false)}
            className="rounded p-1.5 text-muted-foreground hover:bg-[rgba(0,0,0,0.05)] hover:text-foreground transition-colors"
            title="收起面板"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-3">
          <CalendarWidget />
          <TimerWidget />
        </div>
      </aside>
    </div>
  );
}
