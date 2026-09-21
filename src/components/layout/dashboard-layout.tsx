"use client";

import * as React from "react";
import NextImage from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LogOut, ChevronLeft, ChevronRight, ChevronDown, Image as ImageIcon, X, Check,
  CalendarDays, Target, HardDrive, FolderOpen, Star, Clock, Trash2, Sun, Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
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

const FILE_TABS = [
  { key: "categories", label: "分类管理", href: "/dashboard/files?tab=categories", icon: FolderOpen },
  { key: "files", label: "我的文件", href: "/dashboard/files?tab=files", icon: HardDrive },
  { key: "favorites", label: "收藏夹", href: "/dashboard/files?tab=favorites", icon: Star },
  { key: "recent", label: "最近使用", href: "/dashboard/files?tab=recent", icon: Clock },
  { key: "recycle", label: "回收站", href: "/dashboard/files?tab=recycle", icon: Trash2 },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const {
    sidebarOpen, sidebarWidth, setSidebarWidth, toggleSidebar,
    rightOpen, setRightOpen, toggleRight, wallpaper, setWallpaper,
  } = useUIStore();
  const [wallpaperOpen, setWallpaperOpen] = React.useState(false);
  const [wallpaperProcessing, setWallpaperProcessing] = React.useState(false);
  const [workspaceCollapsed, setWorkspaceCollapsed] = React.useState(false);
  const [privateCollapsed, setPrivateCollapsed] = React.useState(false);
  const [fileTab, setFileTab] = React.useState("categories");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dragging = React.useRef(false);

  React.useEffect(() => setMounted(true), []);

  // 文件管理二级目录：从 URL query 读取当前子视图
  React.useEffect(() => {
    const read = () => {
      const sp = new URLSearchParams(window.location.search);
      setFileTab(sp.get("tab") ?? "categories");
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [pathname]);

  const filesActive = pathname.startsWith("/dashboard/files") || pathname.startsWith("/dashboard/categories");
  const tasksActive = pathname.startsWith("/dashboard/tasks");

  const handleLogout = async () => {
    await logoutUser();
    router.push("/");
  };

  const handleWallpaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setWallpaperProcessing(true);
    try {
      const optimized = await processWallpaperImage(file);
      setWallpaper(optimized);
      setWallpaperOpen(false);
    } catch (err) {
      console.error("壁纸优化失败，回退原图", err);
      try {
        const raw = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        setWallpaper(raw);
        setWallpaperOpen(false);
      } catch {
        /* 保持现状 */
      }
    } finally {
      setWallpaperProcessing(false);
    }
  };

  const onMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    const startX = e.clientX;
    const startW = sidebarWidth;
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = ev.clientX - startX;
      setSidebarWidth(Math.max(220, Math.min(480, startW + delta)));
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

  const navItem = "flex items-center justify-between px-2.5 py-2 d5-mono text-[11px] tracking-[0.08em] border-l-2 border-transparent d5-muted hover:text-foreground hover:bg-foreground/5 transition-colors";
  const navItemOn = "border-l-2 d5-line d5-ink bg-foreground/[0.06] font-semibold";

  return (
    <div className="relative flex min-h-screen d5-bg d5-ink">
      {wallpaper && (
        <div
          className="fixed inset-0 z-0"
          style={{ backgroundImage: `url(${wallpaper})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}
        />
      )}

      {/* 左栏：导航 + 私有空间 */}
      <aside
        className="sticky top-0 z-30 flex h-screen shrink-0 flex-col d5-bg border-r d5-line"
        style={{ width: sidebarOpen ? sidebarWidth : 64 }}
      >
        <div className="flex h-14 shrink-0 items-center border-b-2 d5-line px-3">
          {sidebarOpen ? (
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center border d5-line">
                <NextImage src="/images/cafe-logo-white.png" alt="后现代咖啡馆" width={20} height={20} className="h-5 w-5 object-contain invert dark:invert-0" />
              </span>
              <span className="d5-title text-[15px] font-semibold tracking-tight">后现代咖啡馆</span>
            </Link>
          ) : (
            <Link href="/dashboard" className="mx-auto flex h-7 w-7 items-center justify-center border d5-line">
              <NextImage src="/images/cafe-logo-white.png" alt="后现代咖啡馆" width={20} height={20} className="h-5 w-5 object-contain invert dark:invert-0" />
            </Link>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {sidebarOpen && (
            <button onClick={() => setWorkspaceCollapsed((c) => !c)} className="flex w-full items-center gap-1.5 px-3 py-2 d5-mono text-[9px] tracking-[0.22em] d5-faint">
              <ChevronDown className={cn("h-3 w-3 transition-transform", workspaceCollapsed && "-rotate-90")} />
              WORKSPACE / 工作区
            </button>
          )}
          {!workspaceCollapsed && (
            <nav>
              <Link href="/dashboard/tasks" className={cn(navItem, tasksActive && navItemOn)}>
                <span className="flex items-center gap-2"><Target className="h-3.5 w-3.5" />{sidebarOpen && "任务管理"}</span>
                {sidebarOpen && <span className="d5-faint">F1</span>}
              </Link>
              <Link href="/dashboard/files" className={cn(navItem, filesActive && navItemOn)}>
                <span className="flex items-center gap-2"><HardDrive className="h-3.5 w-3.5" />{sidebarOpen && "文件管理"}</span>
                {sidebarOpen && <span className="d5-faint">F2</span>}
              </Link>
              {sidebarOpen && filesActive && (
                <div className="ml-3 border-l d5-line">
                  {FILE_TABS.map((tab) => (
                    <Link
                      key={tab.key}
                      href={tab.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-1.5 text-[11px] d5-muted hover:text-foreground",
                        fileTab === tab.key && "d5-ink font-semibold bg-foreground/[0.05]",
                      )}
                    >
                      <span>{tab.label}</span>
                      <tab.icon className="h-3 w-3 opacity-60" />
                    </Link>
                  ))}
                </div>
              )}
            </nav>
          )}

          {sidebarOpen && (
            <button onClick={() => setPrivateCollapsed((c) => !c)} className="mt-3 flex w-full items-center gap-1.5 px-3 py-2 d5-mono text-[9px] tracking-[0.22em] d5-faint">
              <ChevronDown className={cn("h-3 w-3 transition-transform", privateCollapsed && "-rotate-90")} />
              PRIVATE / 私有空间
            </button>
          )}
          {!privateCollapsed && (
            <div className="space-y-1 px-1">
              <SidebarTodo />
              <SidebarNotes />
              <SidebarMusic />
            </div>
          )}
        </div>

        <div className="shrink-0 border-t d5-line px-2 py-2">
          <div className="mb-1 flex items-center justify-between gap-1">
            <button
              onClick={() => mounted && setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex h-7 w-7 items-center justify-center border d5-line d5-muted hover:text-foreground"
              title="切换明暗"
            >
              {mounted && resolvedTheme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
            <button onClick={() => setWallpaperOpen(true)} className="flex h-7 w-7 items-center justify-center border d5-line d5-muted hover:text-foreground" title="更换背景">
              <ImageIcon className="h-3.5 w-3.5" />
            </button>
            <Link href="/profile" className="flex h-7 w-7 items-center justify-center border d5-line" title="个人中心">
              <Avatar className="h-5 w-5">
                <AvatarImage src="" alt="用户" />
                <AvatarFallback className="bg-foreground text-[9px] text-background">U</AvatarFallback>
              </Avatar>
            </Link>
            <button onClick={handleLogout} className="flex h-7 w-7 items-center justify-center border d5-line d5-muted hover:text-foreground" title="退出登录">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
          <button onClick={toggleSidebar} className="flex w-full items-center justify-center gap-2 border d5-line py-1.5 d5-mono text-[10px] d5-muted hover:text-foreground">
            {sidebarOpen ? <><ChevronLeft className="h-3.5 w-3.5" />收起侧栏</> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="absolute right-0 top-0 z-50 h-full w-1 cursor-col-resize hover:bg-foreground/10" onMouseDown={onMouseDown} title="拖动调整侧边栏宽度" />
        )}
      </aside>

      {/* 中栏：顶部状态条 + 工作台 */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b-2 d5-line d5-bg px-5">
          <div className="flex items-center gap-3 d5-mono text-[10px] tracking-[0.16em] d5-muted">
            <span>POSTMODERN CAFE</span>
            <span className="d5-faint">/</span>
            <span className="d5-ink">{tasksActive ? "任务管理" : filesActive ? "文件管理" : "工作台"}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleRight} className="hidden h-7 items-center gap-1.5 border d5-line px-2 d5-mono text-[10px] d5-muted hover:text-foreground lg:flex" title={rightOpen ? "收起面板" : "展开面板"}>
              <CalendarDays className="h-3.5 w-3.5" />
              {rightOpen ? "HIDE" : "SHOW"}
            </button>
            <button onClick={toggleRight} className="flex h-7 w-7 items-center justify-center border d5-line d5-muted lg:hidden">
              <CalendarDays className="h-3.5 w-3.5" />
            </button>
            {wallpaper && (
              <button onClick={() => setWallpaper(null)} className="flex h-7 w-7 items-center justify-center border d5-line d5-muted hover:text-foreground" title="移除背景">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </header>

        <main className="relative flex-1 d5-panel p-5 lg:p-6">{children}</main>
      </div>

      {/* 右栏：日历 + 计时器 + 读数 */}
      <aside
        className={cn(
          "sticky top-0 z-30 hidden h-screen shrink-0 flex-col overflow-hidden border-l-2 d5-line d5-bg transition-[width] duration-200 lg:flex",
          rightOpen ? "w-[300px]" : "w-0",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b d5-line px-4">
          <span className="d5-mono text-[9px] tracking-[0.22em] d5-faint">INSPECTOR / 读数</span>
          <button onClick={() => setRightOpen(false)} className="flex h-6 w-6 items-center justify-center border d5-line d5-muted hover:text-foreground" title="收起面板">
            <X className="h-3 w-3" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-3">
          <CalendarWidget />
          <TimerWidget />
          <div className="border d5-line">
            <div className="border-b d5-line px-3 py-2 d5-mono text-[9px] tracking-[0.2em] d5-faint">READOUT</div>
            <div className="flex justify-between px-3 py-1.5 d5-mono text-[10px] d5-muted"><span>BGM</span><span>INDEPENDENT</span></div>
            <div className="flex justify-between px-3 py-1.5 d5-mono text-[10px] d5-muted"><span>MUSIC</span><span>LOCAL</span></div>
            <div className="flex justify-between px-3 py-1.5 d5-mono text-[10px] d5-muted"><span>FILES</span><span>INDEXED</span></div>
          </div>
        </div>
      </aside>

      <Dialog open={wallpaperOpen} onClose={() => setWallpaperOpen(false)} title="更换背景壁纸" description="上传图片后自动优化清晰度并压缩体积" maxWidth="max-w-md">
        <div className="space-y-3 d5-mono text-[11px]">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleWallpaperUpload} className="hidden" />
          <button
            onClick={() => { setWallpaper(null); setWallpaperOpen(false); }}
            className="flex w-full items-center gap-3 border d5-line px-4 py-3 text-left hover:bg-foreground/5"
          >
            <span className={cn("flex h-9 w-9 items-center justify-center border d5-line", !wallpaper && "bg-foreground text-background")}>
              <Check className="h-4 w-4" />
            </span>
            <span>
              <span className="block d5-ink">默认背景</span>
              <span className="block text-[10px] d5-faint">简洁的纯色背景</span>
            </span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={wallpaperProcessing}
            className="flex w-full items-center gap-3 border d5-line px-4 py-3 text-left hover:bg-foreground/5 disabled:opacity-50"
          >
            <span className="flex h-9 w-9 items-center justify-center border d5-line"><ImageIcon className="h-4 w-4" /></span>
            <span>
              <span className="block d5-ink">{wallpaperProcessing ? "正在优化图片…" : "自定义壁纸"}</span>
              <span className="block text-[10px] d5-faint">从本地选择一张图片，自动优化清晰度</span>
            </span>
          </button>
        </div>
      </Dialog>
    </div>
  );
}
