"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
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

const sidebarItems = [
  { label: "概览", href: "/dashboard", icon: LayoutDashboard },
  { label: "我的文件", href: "/dashboard/files", icon: HardDrive },
  { label: "分类管理", href: "/dashboard/categories", icon: FolderOpen },
  { label: "收藏夹", href: "/dashboard/favorites", icon: Star },
  { label: "最近使用", href: "/dashboard/recent", icon: Clock },
  { label: "回收站", href: "/dashboard/recycle", icon: Trash2 },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar, rightOpen, setRightOpen, toggleRight, wallpaper, setWallpaper } = useUIStore();
  const [wallpaperOpen, setWallpaperOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Notion 风格 */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-black/10 bg-card transition-all duration-200 dark:border-white/10",
          sidebarOpen ? "w-[280px]" : "w-16",
        )}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center border-b border-black/10 px-4 dark:border-white/10">
          {sidebarOpen ? (
            <a href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground shadow-notion">
                <span className="text-xs font-bold text-background">R</span>
              </div>
              <span className="text-sm font-semibold tracking-tight">收纳盒</span>
            </a>
          ) : (
            <a href="/dashboard" className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
              <span className="text-xs font-bold text-background">R</span>
            </a>
          )}
        </div>

        {/* 滚动区域：导航 + 小部件 */}
        <div className="flex-1 space-y-3 overflow-y-auto p-2">
          {sidebarOpen && (
            <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              工作区
            </p>
          )}
          <nav className="space-y-0.5">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-black/5 font-medium text-foreground dark:bg-white/10"
                      : "text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </a>
              );
            })}
          </nav>

          {sidebarOpen && (
            <div className="space-y-1 border-t border-black/10 pt-2 dark:border-white/10">
              <SidebarTodo />
              <SidebarNotes />
              <SidebarMusic />
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="shrink-0 border-t border-black/10 p-2 dark:border-white/10">
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10 transition-colors"
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
      </aside>

      {/* Main area */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-200",
          sidebarOpen ? "ml-[280px]" : "ml-16",
          rightOpen ? "lg:mr-[300px]" : "lg:mr-0",
        )}
        style={
          wallpaper
            ? {
                backgroundImage: `url(${wallpaper})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
              }
            : undefined
        }
      >
        {/* Top bar */}
        <header className={cn(
          "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border px-5",
          wallpaper ? "bg-background/70" : "bg-background",
        )}>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              {sidebarItems.find((s) => pathname === s.href || (s.href !== "/dashboard" && pathname.startsWith(s.href)))?.label ?? "概览"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleRight}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors lg:hidden"
              title="侧边面板"
            >
              <CalendarDays className="h-4 w-4" />
            </button>
            <button
              onClick={toggleRight}
              className={cn(
                "hidden h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors lg:flex",
                rightOpen && "bg-secondary text-foreground",
              )}
              title={rightOpen ? "收起面板" : "展开面板"}
            >
              <CalendarDays className="h-4 w-4" />
            </button>
            <button
              onClick={() => setWallpaperOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="更换背景"
            >
              <Image className="h-4 w-4" />
            </button>
            {wallpaper && (
              <button
                onClick={() => setWallpaper(null)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="移除背景"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ThemeToggle />
            <a
              href="/profile"
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-secondary transition-colors"
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
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="退出登录"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className={cn(
          "flex-1 p-5 lg:p-6",
          wallpaper && "bg-background/60",
        )}>
          {children}
        </main>
      </div>

      {/* Wallpaper Dialog - rendered at top level */}
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

          {/* 默认浅色 */}
          <button
            onClick={() => {
              setWallpaper(null);
              setWallpaperOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-lg border border-black/10 bg-background px-4 py-3 text-sm hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10 transition-colors"
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                !wallpaper ? "bg-foreground text-background" : "bg-black/5 dark:bg-white/10",
              )}
            >
              <Check className="h-4 w-4" />
            </span>
            <span className="text-left">
              <span className="block font-medium">默认浅色</span>
              <span className="block text-xs text-muted-foreground">简洁的纯色背景</span>
            </span>
          </button>

          {/* 自定义壁纸 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-lg border border-black/10 bg-background px-4 py-3 text-sm hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10 transition-colors"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/5 dark:bg-white/10">
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
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              移除壁纸
            </button>
          )}
        </div>
      </Dialog>

      {/* Right panel: 日历 + 计时器 */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-40 hidden h-full w-[300px] flex-col border-l border-black/10 bg-card transition-all duration-200 lg:flex dark:border-white/10",
          rightOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/10 px-4 dark:border-white/10">
          <span className="text-sm font-semibold tracking-tight">面板</span>
          <button
            onClick={() => setRightOpen(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10 transition-colors"
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
