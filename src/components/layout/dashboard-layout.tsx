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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { CursorTrail } from "@/components/ui/cursor-trail";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { logoutUser } from "@/actions/auth";
import { useUIStore } from "@/store";

const sidebarItems = [
  { label: "概览", href: "/dashboard", icon: LayoutDashboard },
  { label: "我的文件", href: "/dashboard/files", icon: HardDrive },
  { label: "分类管理", href: "/dashboard/categories", icon: FolderOpen },
  { label: "收藏夹", href: "/dashboard/favorites", icon: Star },
  { label: "最近使用", href: "/dashboard/recent", icon: Clock },
  { label: "回收站", href: "/dashboard/recycle", icon: Trash2 },
];

const PRESET_WALLPAPERS = [
  { label: "晨光", color: "#f5a623", url: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f5a623"/><stop offset="100%" style="stop-color:#f7dc6f"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/></svg>') },
  { label: "海洋", color: "#2196F3", url: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#2196F3"/><stop offset="100%" style="stop-color:#64B5F6"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/></svg>') },
  { label: "森林", color: "#2E7D32", url: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#2E7D32"/><stop offset="100%" style="stop-color:#66BB6A"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/></svg>') },
  { label: "暗夜", color: "#1a1a2e", url: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1a1a2e"/><stop offset="100%" style="stop-color:#16213e"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/></svg>') },
  { label: "薄暮", color: "#8B5CF6", url: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#8B5CF6"/><stop offset="100%" style="stop-color:#EC4899"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/></svg>') },
  { label: "极光", color: "#06D6A0", url: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#06D6A0"/><stop offset="100%" style="stop-color:#118AB2"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/></svg>') },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar, wallpaper, setWallpaper } = useUIStore();
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
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-border bg-card transition-all duration-200",
          sidebarOpen ? "w-60" : "w-16",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-4">
          {sidebarOpen ? (
            <a href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-foreground">
                <span className="text-xs font-bold text-background">R</span>
              </div>
              <span className="font-semibold text-sm">收纳盒</span>
            </a>
          ) : (
            <a href="/dashboard" className="mx-auto flex h-7 w-7 items-center justify-center rounded bg-foreground">
              <span className="text-xs font-bold text-background">R</span>
            </a>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-2">
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
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
          sidebarOpen ? "ml-60" : "ml-16",
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
        description="选择一张图片作为后台壁纸"
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
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
          >
            <Image className="h-4 w-4" /> 从本地选择图片
          </button>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">预设壁纸</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_WALLPAPERS.map((wp, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setWallpaper(wp.url);
                    setWallpaperOpen(false);
                  }}
                  className="group relative aspect-video overflow-hidden rounded-lg border border-border transition-all hover:scale-105"
                  style={{ backgroundColor: wp.color }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-white/80 text-xs font-medium">
                    {wp.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

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

      {/* Cursor stardust trail */}
      <CursorTrail />
    </div>
  );
}
