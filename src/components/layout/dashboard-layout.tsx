"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/actions/auth";
import { MusicProvider } from "@/components/layout/music-provider";
import { CountdownIndicator } from "@/components/layout/countdown-indicator";

const TITLES: Record<string, string> = {
  "/dashboard/notes": "笔记管理",
  "/dashboard/aesthetic": "美学空间",
  "/dashboard/tools": "实用工具",
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = React.useState(false);
  const isMap = pathname === "/dashboard";
  const title = Object.entries(TITLES).find(([path]) => pathname.startsWith(path))?.[1];

  const handleLogout = async () => {
    if (leaving) return;
    setLeaving(true);
    await logoutUser();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <MusicProvider />
      <header className={cn("fixed inset-x-0 top-0 z-40 h-16 bg-white/95 backdrop-blur-sm", !isMap && "border-b border-[#ededed]")}>
        <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-5">
            <Link href="/dashboard" className="shrink-0 text-[14px] font-medium tracking-wide">后现代咖啡馆</Link>
            {!isMap && (
              <div className="hidden items-center gap-2 text-[11px] text-[#999] sm:flex">
                <span className="text-[#c0c0c0]">/</span>
                <Link href="/dashboard" className="hover:text-black">空间图</Link>
                {title && <><span className="text-[#c0c0c0]">/</span><span className="text-[#444]">{title}</span></>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isMap && <Link href="/dashboard" className="text-[11px] text-[#888] hover:text-black sm:hidden">空间图</Link>}
            <CountdownIndicator />
            <Link href="/profile" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] text-[#666] transition-colors hover:border-black hover:text-black" title="个人中心">
              <UserRound className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <button onClick={handleLogout} disabled={leaving} className="hidden h-8 w-8 items-center justify-center rounded-full text-[#999] transition-colors hover:bg-[#f4f4f4] hover:text-black sm:flex" title="退出登录">
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <main className={cn("min-h-screen", isMap ? "pt-16" : "px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:pt-24")}>{children}</main>
    </div>
  );
}

