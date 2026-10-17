"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, ChevronRight, Image, LogOut, Timer, UserRound, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/actions/auth";
import { MusicProvider } from "@/components/layout/music-provider";
import { CountdownIndicator } from "@/components/layout/countdown-indicator";

const MODULES = [
  { href: "/dashboard/notes", label: "笔记管理", short: "笔记", icon: BookOpen },
  { href: "/dashboard/aesthetic", label: "美学空间", short: "美学", icon: Image },
  { href: "/dashboard/tools", label: "实用工具", short: "工具", icon: Wrench },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = async () => {
    if (leaving) return;
    setLeaving(true);
    await logoutUser();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <MusicProvider />

      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-[#dedede] bg-white transition-[width] duration-200 lg:flex", sidebarOpen ? "w-[208px]" : "w-[64px]")}>
        <Link href="/dashboard/notes" className={cn("flex h-16 items-center border-b border-[#dedede] text-[15px] font-medium tracking-wide", sidebarOpen ? "px-6" : "justify-center text-[13px]")} title="返回笔记管理">
          {sidebarOpen ? "后现代咖啡馆" : "后"}
        </Link>

        <nav className={cn("flex-1 pt-10", sidebarOpen ? "px-6" : "px-3")}>
          {sidebarOpen && <p className="mb-5 text-[11px] tracking-[0.18em] text-[#9a9a9a]">SPACE</p>}
          <div className="relative border-l border-[#dedede]">
            {MODULES.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "group relative -ml-px flex items-center border-l py-4 text-[14px] transition-colors",
                    sidebarOpen ? "gap-3 pl-5" : "justify-center pl-0",
                    active ? "border-black font-medium text-black" : "border-transparent text-[#777] hover:text-black",
                  )}
                >
                  <span className={cn("absolute -left-[4px] h-[7px] w-[7px] rounded-full border border-[#b9b9b9] bg-white", active && "border-black bg-black")} />
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  {sidebarOpen && item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={cn("border-t border-[#dedede]", sidebarOpen ? "p-4" : "p-2")}>
          <Link href="/profile" title="个人中心" className={cn("flex items-center gap-3 py-2 text-[13px] text-[#555] hover:text-black", sidebarOpen ? "px-2" : "justify-center px-0")}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#dedede]"><UserRound className="h-3.5 w-3.5" /></span>
            {sidebarOpen && "个人中心"}
          </Link>
          <button onClick={handleLogout} disabled={leaving} title="退出登录" className={cn("mt-1 flex w-full items-center gap-3 py-2 text-[13px] text-[#888] hover:text-black disabled:opacity-50", sidebarOpen ? "px-2 text-left" : "justify-center px-0")}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-transparent"><LogOut className="h-3.5 w-3.5" /></span>
            {sidebarOpen && (leaving ? "正在退出" : "退出登录")}
          </button>
          <button onClick={() => setSidebarOpen((value) => !value)} className={cn("mt-2 flex w-full items-center gap-3 border-t border-[#ededed] pt-3 text-[11px] text-[#999] hover:text-black", sidebarOpen ? "px-2" : "justify-center px-0")} title={sidebarOpen ? "收起导航" : "展开导航"}>
            {sidebarOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            {sidebarOpen && "收起导航"}
          </button>
        </div>
      </aside>

      <div className={cn("min-h-screen transition-[padding] duration-200", sidebarOpen ? "lg:pl-[208px]" : "lg:pl-[64px]")}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#dedede] bg-white/95 px-4 backdrop-blur-sm sm:px-6">
          <Link href="/dashboard/notes" className="text-[14px] font-medium lg:hidden">后现代咖啡馆</Link>
          <div className="hidden items-center gap-2 text-[12px] text-[#999] lg:flex">
            <span>私人空间</span>
            <span>/</span>
            <span className="text-[#333]">{MODULES.find((item) => pathname.startsWith(item.href))?.label ?? "笔记管理"}</span>
          </div>
          <div className="flex items-center gap-3">
            <CountdownIndicator />
            <Link href="/profile" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dedede] text-[#555] hover:border-black hover:text-black" title="个人中心">
              <UserRound className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-[#dedede] bg-white/95 backdrop-blur-sm lg:hidden">
        {MODULES.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon === Wrench ? Timer : item.icon;
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 py-3 text-[11px]", active ? "text-black" : "text-[#8b8b8b]")}>
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              {item.short}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
