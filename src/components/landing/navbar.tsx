"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Entrance } from "@/components/ui/entrance";

const navLinks = [
  { label: "功能", href: "#features" },
  { label: "关于", href: "#about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [now, setNow] = React.useState<string>("");

  React.useEffect(() => {
    const tick = () => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setNow(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Entrance
      as="header"
      from={{ y: -100 }}
      to={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-[#2a2a28] bg-[#050505]/90 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 lg:px-8">
        {/* Brand — text only */}
        <Link
          href="/"
          className="group flex items-baseline gap-2 font-mono text-[13px] tracking-[0.06em] text-white"
        >
          后现代咖啡馆
          <span className="text-[#8a8a86]">::</span>
          <span className="text-[#8a8a86] transition-colors group-hover:text-white">
            POSTMODERN-CAFÉ
          </span>
        </Link>

        {/* Right status bar */}
        <div className="hidden items-center gap-5 md:flex">
          <span className="font-mono text-[12px] tracking-[0.08em] text-white/60 tabular-nums">
            {now}
          </span>
          <span className="font-mono text-[11px] tracking-[0.2em] text-[#8a8a86]">
            ARCHIVE.FS
          </span>
          <Link
            href="/login"
            className="border border-white px-5 py-[7px] font-mono text-[12px] tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-black"
          >
            登录
          </Link>
        </div>

        {/* Mobile trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <span className="font-mono text-[12px] text-white/60 tabular-nums">{now}</span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="菜单"
            className="flex h-9 w-9 items-center justify-center border border-[#2a2a28] text-white"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="border-b border-[#2a2a28] bg-[#050505] md:hidden"
          >
            <div className="space-y-1 px-6 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 font-mono text-[13px] text-[#8a8a86] transition-colors hover:bg-[#101010] hover:text-white"
                >
                  ▸ {link.label}
                </a>
              ))}
              <div className="flex gap-2 pt-2">
                <Link
                  href="/login"
                  className="flex-1 border border-[#555] px-4 py-3 text-center font-mono text-[12px] text-white"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="flex-1 bg-white px-4 py-3 text-center font-mono text-[12px] font-bold text-black"
                >
                  注册
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Entrance>
  );
}
