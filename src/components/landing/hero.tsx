"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Upload, Shield, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

// ---- Feature Pills at Bottom ----
const pills = [
  { icon: Upload, label: "极速上传", desc: "拖拽即可上传" },
  { icon: Shield, label: "安全可靠", desc: "加密存储保障" },
  { icon: FolderOpen, label: "分类管理", desc: "一目了然有序" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16">
      {/* Content sits above the global BlueprintOverlay */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 inline-flex items-center gap-2 rounded-full border border-whisper bg-card/90 backdrop-blur-sm px-5 py-2 text-[14px] font-medium text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/60" />
          简约 · 高效 · 有序
        </motion.div>

        {/* Main Title — bold, compressed, impactful */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance text-[52px] font-bold leading-[1.02] tracking-[-2px] sm:text-[64px] md:text-[76px] lg:text-[84px]"
        >
          让文件管理
          <br />
          <span className="text-foreground/85">更加高效快捷</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-10 max-w-xl text-balance text-[18px] leading-relaxed text-muted-foreground sm:text-[20px]"
        >
          极简收纳 · 有序分类 · 极速文件管理
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button size="xl" className="group gap-2" asChild>
            <a href="/register">
              立即开始
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
          <Button variant="outline" size="xl" asChild>
            <a href="#features">分类浏览</a>
          </Button>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 flex flex-wrap items-center justify-center gap-10"
        >
          {pills.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded border border-whisper bg-card/90 backdrop-blur-sm dark:border-white/10">
                <item.icon className="h-[18px] w-[18px] text-muted-foreground" />
              </div>
              <div className="text-left">
                <div className="text-[14px] font-medium">{item.label}</div>
                <div className="text-[12px] text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[12px] text-muted-foreground/60">向下滚动</span>
          <div className="h-10 w-6 rounded-full border border-whisper p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto h-2 w-1.5 rounded-full bg-foreground/50"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
