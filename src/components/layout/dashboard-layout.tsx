"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/actions/auth";
import { MotionButton } from "@/components/ui/motion-button";
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
      <header className={cn("fixed inset-x-0 top-0 z-40 h-16 bg-white/90 backdrop-blur-md", !isMap && "border-b border-[#ededed]")}>
        <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-5">
            <Link href="/dashboard" className="group shrink-0 text-[14px] font-medium tracking-wide">
              后现代咖啡馆
              <span className="mt-0.5 block h-px w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>
            {!isMap && (
              <div className="hidden items-center gap-2 text-[11px] text-[#999] sm:flex">
                <span className="text-[#c0c0c0]">/</span>
                <Link href="/dashboard" className="transition-colors hover:text-black">空间图</Link>
                {title && <><span className="text-[#c0c0c0]">/</span><span className="text-[#444]">{title}</span></>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isMap && <MotionButton href="/dashboard" variant="ghost" size="sm" className="px-2 sm:hidden">空间图</MotionButton>}
            <CountdownIndicator />
            <MotionButton href="/profile" variant="icon" size="icon" icon={<UserRound className="h-4 w-4" strokeWidth={1.5} />} ariaLabel="个人中心" title="个人中心" />
            <MotionButton variant="icon" size="icon" onClick={handleLogout} disabled={leaving} icon={<LogOut className="h-4 w-4" strokeWidth={1.5} />} ariaLabel="退出登录" title="退出登录" className="hidden sm:inline-flex" />
          </div>
        </div>
      </header>

      <main className={cn("min-h-screen", isMap ? "pt-16" : "px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:pt-24")}>{children}</main>
    </div>
  );
}
