"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  HardDrive,
  FolderOpen,
  Star,
  Clock,
  Trash2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const handleLogout = async () => {
    await logoutUser();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          {sidebarOpen ? (
            <a href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600">
                <span className="text-sm font-bold text-white">R</span>
              </div>
              <span className="text-sm font-semibold">收纳盒</span>
            </a>
          ) : (
            <a href="/dashboard" className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600">
              <span className="text-sm font-bold text-white">R</span>
            </a>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border/50 p-3">
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>收起</span>
              </>
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-16",
      )}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索文件..."
                className="h-9 w-64 rounded-xl border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative" asChild>
              <a href="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="用户" />
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    U
                  </AvatarFallback>
                </Avatar>
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
              title="退出登录"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
