"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Entrance } from "@/components/ui/entrance";
import Link from "next/link";

const pills = [
  { file: "upload.ts", label: "极速上传", desc: "拖拽即可上传" },
  { file: "shield.enc", label: "安全可靠", desc: "加密存储保障" },
  { file: "archive/", label: "分类管理", desc: "一目了然有序" },
];

const ascii = [
  "  ██████╗  ██████╗ ███████╗████████╗",
  " ██╔═══██╗██╔═══██╗██╔════╝╚══██╔══╝",
  " ██║   ██║██║   ██║███████╗   ██║   ",
  " ██║   ██║██║   ██║╚════██║   ██║   ",
  " ╚██████╔╝╚██████╔╝███████║   ██║   ",
  "  ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ",
];

export function Hero() {
  return (
    <section className="term-bg term-scanlines term-noise relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pt-28 pb-28 lg:px-10">
      <div className="relative z-10 grid w-full max-w-[1600px] items-center gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* ============ 左栏：终端内容（左对齐） ============ */}
        <div className="max-w-2xl">
          {/* Status line */}
          <Entrance
            as="div"
            from={{ opacity: 0, x: -16 }}
            to={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 flex items-center gap-4 font-mono text-[11px] tracking-[0.2em] text-[#8a8a86]"
          >
            <span className="text-white">SYS.ONLINE</span>
            <span>{"//"}</span>
            <span>ARCHIVE.FS</span>
            <span>{"//"}</span>
            <span>GRAYSCALE.7</span>
          </Entrance>

          {/* ASCII logo */}
          <Entrance
            as="pre"
            from={{ opacity: 0, x: -16 }}
            to={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mb-10 select-none font-mono text-[10px] leading-[1.3] tracking-[0.02em] text-[#8a8a86] sm:text-[13px]"
          >
            {ascii.join("\n")}
          </Entrance>

          {/* Terminal commands */}
          <Entrance
            as="div"
            from={{ opacity: 0, x: -16 }}
            to={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 max-w-md space-y-1.5 text-left font-mono text-[12px] text-[#8a8a86]"
          >
            <p>
              <span className="text-white">$</span> system.init --profile=postmodern{" "}
              <span className="text-white">[OK]</span>
            </p>
            <p>
              <span className="text-white">$</span> mount /archive/gray.7{" "}
              <span className="text-white">[OK]</span>
            </p>
            <p>
              <span className="text-white">$</span> <span className="text-white">open ./start</span>
              <span className="term-caret ml-1" />
            </p>
          </Entrance>

          {/* Title */}
          <Entrance
            as="h1"
            from={{ opacity: 0, x: -16 }}
            to={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-left"
          >
            <span
              data-text="一切终将归档"
              className="term-glitch font-mono text-[40px] font-bold leading-[1.06] tracking-[-0.02em] text-white sm:text-[64px] lg:text-[84px]"
            >
              一切终将归档
            </span>
            <span className="mt-3 block font-mono text-[14px] tracking-[0.22em] text-[#8a8a86] sm:text-[18px]">
              EVERYTHING GETS ARCHIVED
            </span>
          </Entrance>

          {/* Subtitle */}
          <Entrance
            as="p"
            from={{ opacity: 0, x: -16 }}
            to={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-xl font-mono text-[14px] leading-relaxed text-[#8a8a86] sm:text-[15px]"
          >
            生活记录 · 资料归档 · 事务处理 —— <span className="text-white">归档，是对时间的尊重。</span>
          </Entrance>

          {/* CTAs */}
          <Entrance
            as="div"
            from={{ opacity: 0, x: -16 }}
            to={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex flex-col items-start gap-4 font-mono sm:flex-row"
          >
            <Link
              href="/register"
              className="inline-block border border-white bg-white px-9 py-4 text-[13px] font-bold tracking-[0.16em] text-black transition-all hover:bg-black hover:text-white hover:shadow-[0_0_24px_rgba(255,255,255,0.35)]"
            >
              开始归档 →
            </Link>
            <a
              href="#features"
              className="inline-block border border-[#666] px-9 py-4 text-[13px] tracking-[0.16em] text-white transition-colors hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              浏览模块
            </a>
          </Entrance>

          {/* Feature pills */}
          <Entrance
            as="div"
            from={{ opacity: 0, x: -16 }}
            to={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 w-full max-w-lg divide-y divide-[#1a1a18] border-y border-[#2a2a28] text-left font-mono"
          >
            {pills.map((p) => (
              <div key={p.label} className="flex items-center gap-4 py-3">
                <span className="text-[11px] text-[#4a4a48]">{p.file}</span>
                <span className="text-[13px] text-white">▸ {p.label}</span>
                <span className="ml-auto text-[11px] text-[#8a8a86]">{p.desc}</span>
                <span className="text-[10px] tracking-[0.14em] text-[#4a4a48]">ACTIVE</span>
              </div>
            ))}
          </Entrance>
        </div>

        {/* ============ 右栏：剪影摄影档案图 ============ */}
        <Entrance
          as="div"
          from={{ opacity: 0, x: 24 }}
          to={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="relative border border-[#2a2a28] bg-[#050505] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
            <img
              src="/art/silhouette-archive.png"
              alt="剪影档案 · ARCHIVE"
              className="w-full grayscale"
              loading="eager"
            />
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 pb-3 pt-10 font-mono text-[10px] tracking-[0.22em] text-[#8a8a86] [background:linear-gradient(0deg,rgba(5,5,5,0.94),rgba(5,5,5,0))]">
              <span>FIG.03 — ARCHIVE / GRAYSCALE</span>
              <span className="term-blink inline-block h-[7px] w-[7px] bg-white" />
            </div>
          </div>
          <div className="absolute -top-2 right-2 border border-[#2a2a28] bg-[#050505]/80 px-2.5 py-1.5 font-mono text-[9px] tracking-[0.26em] text-[#666]">
            ◉ SESSION ACTIVE
          </div>
          <div className="mt-4 text-right font-mono text-[10px] leading-loose tracking-[0.3em] text-[#555]">
            REC.STATUS ●<br />
            KEEP.FOREVER<br />
            GRAY.7
          </div>
        </Entrance>
      </div>

      {/* Scroll indicator */}
      <Entrance
        as="div"
        from={{ opacity: 0 }}
        to={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 font-mono">
          <span className="text-[10px] tracking-[0.3em] text-[#8a8a86]">SCROLL</span>
          <div className="h-9 w-5 overflow-hidden border border-[#2a2a28]">
            <motion.div
              animate={{ y: [0, 24, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mt-1 h-1.5 w-1.5 bg-white"
            />
          </div>
        </div>
      </Entrance>
    </section>
  );
}
