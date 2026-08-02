"use client";

import * as React from "react";
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
  Image,
  X,
  Check,
  CalendarDays,
  GripVertical,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { logoutUser } from "@/actions/auth";
import { useUIStore } from "@/store";
import { SidebarTodo } from "@/components/layout/sidebar-todo";
import { SidebarNotes } from "@/components/layout/sidebar-notes";
import { SidebarMusic } from "@/components/layout/sidebar-music";
import { CalendarWidget } from "@/components/layout/calendar-widget";
import { TimerWidget } from "@/components/layout/timer-widget";
import { NotesModal } from "@/components/layout/notes-modal";

const sidebarItems = [
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
  const [notesOpen, setNotesOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/");
  };

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setWallpaper(reader.result as string);
      setWallpaperOpen(false);
    };
    reader.readAsDataURL(file);
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
          "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-whisper bg-card transition-[width] duration-150 dark:border-white/10",
        )}
        style={{ width: sidebarOpen ? sidebarWidth : 64 }}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center border-b border-whisper px-4 dark:border-white/10">
          {sidebarOpen ? (
            <a href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-foreground">
                <span className="text-xs font-bold text-background">R</span>
              </div>
              <span className="text-[15px] font-semibold tracking-tight">收纳盒</span>
            </a>
          ) : (
            <a href="/dashboard" className="mx-auto flex h-7 w-7 items-center justify-center rounded bg-foreground">
              <span className="text-xs font-bold text-background">R</span>
            </a>
          )}
        </div>

        {/* Scroll area: nav + widgets */}
        <div className="flex-1 space-y-2 overflow-y-auto p-2">
          {sidebarOpen && (
            <p className="px-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              工作区
            </p>
          )}
          <nav className="space-y-0.5">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded px-2 py-1.5 text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-[rgba(0,0,0,0.06)] text-foreground dark:bg-[rgba(255,255,255,0.08)]"
                      : "text-muted-foreground hover:bg-[rgba(0,0,0,0.04)] hover:text-foreground dark:hover:bg-[rgba(255,255,255,0.05)]",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </a>
              );
            })}
          </nav>

          {/* Divider & Widgets */}
          {sidebarOpen && (
            <div className="space-y-1 border-t border-whisper pt-2 dark:border-white/10">
              <SidebarTodo />
              <SidebarNotes onOpenFull={() => setNotesOpen(true)} />
              <SidebarMusic />
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="shrink-0 border-t border-whisper p-2 dark:border-white/10">
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center rounded px-3 py-1.5 text-[14px] text-muted-foreground hover:bg-[rgba(0,0,0,0.04)] hover:text-foreground dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
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
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-whisper bg-card/85 backdrop-blur-md px-5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-medium text-muted-foreground">
              {currentLabel}
            </span>
            {/* Notes shortcut button */}
            <button
              onClick={() => setNotesOpen(true)}
              className="flex items-center gap-1.5 rounded px-2 py-1 text-[12px] text-muted-foreground hover:bg-[rgba(0,0,0,0.04)] hover:text-foreground dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              title="打开随时记写"
            >
              <StickyNote className="h-3.5 w-3.5" />
              随时记写
            </button>
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
            <ThemeToggle />
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
        description="仅提供默认浅色与自定义壁纸"
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
            className="flex w-full items-center gap-3 rounded-lg border border-whisper bg-background px-4 py-3 text-sm hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
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
            className="flex w-full items-center gap-3 rounded-lg border border-whisper bg-background px-4 py-3 text-sm hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded bg-secondary">
              <Image className="h-4 w-4" />
            </span>
            <span className="text-left">
              <span className="block font-medium">自定义壁纸</span>
              <span className="block text-xs text-muted-foreground">从本地选择一张图片</span>
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
          "fixed right-0 top-0 z-40 hidden h-full w-[300px] flex-col border-l border-whisper bg-card transition-transform duration-200 lg:flex dark:border-white/10",
          rightOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-whisper px-4 dark:border-white/10">
          <span className="text-[14px] font-semibold tracking-tight">面板</span>
          <button
            onClick={() => setRightOpen(false)}
            className="rounded p-1.5 text-muted-foreground hover:bg-[rgba(0,0,0,0.04)] hover:text-foreground dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
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

      {/* Notes full modal */}
      <NotesModal open={notesOpen} onClose={() => setNotesOpen(false)} />
    </div>
  );
}
