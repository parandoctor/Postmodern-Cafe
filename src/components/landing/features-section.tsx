"use client";

import * as React from "react";
import { Entrance } from "@/components/ui/entrance";

const features = [
  {
    index: "01",
    file: "upload.ts",
    title: "极速上传",
    description: "支持拖拽、点击、批量上传多种方式，大文件断点续传，上传进度实时显示。",
  },
  {
    index: "02",
    file: "archive/",
    title: "分类管理",
    description: "多级分类体系，黑白灰阶哑光色系统一视觉规范，让文件管理更直观有序。",
  },
  {
    index: "03",
    file: "search.sh",
    title: "智能搜索",
    description: "快速搜索文件名称，按分类、类型、日期筛选，大文件分页懒加载，性能优秀。",
  },
  {
    index: "04",
    file: "star.db",
    title: "收藏与最近",
    description: "收藏常用文件，自动记录最近访问和最近修改，让高频文件触手可及。",
  },
  {
    index: "05",
    file: "trash.bin",
    title: "回收站",
    description: "删除的文件进入回收站保护期，支持恢复和永久删除，不再担心误操作。",
  },
  {
    index: "06",
    file: "shield.enc",
    title: "安全可靠",
    description: "密码加密，Session 管理，CSRF 防护，文件类型白名单，全方位安全保障。",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="term-bg term-scanlines term-noise relative overflow-hidden border-t border-black py-24 lg:py-32"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_320px]">
          {/* Terminal archive table */}
          <div>
            <Entrance
              as="div"
              from={{ opacity: 0, y: 24 }}
              to={{ opacity: 1, y: 0 }}
              inView
              viewportMargin="-60px"
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-mono text-[11px] tracking-[0.2em] text-[#8a8a86]">
                $ cat ./core_modules --format=table
              </p>
              <h2
                data-text="核心模块 / CORE MODULES"
                className="term-glitch mt-4 font-mono text-[26px] font-bold tracking-[-0.01em] text-white sm:text-[34px]"
              >
                核心模块 / CORE MODULES
              </h2>
              <p className="mt-4 max-w-xl font-mono text-[13px] leading-relaxed text-[#8a8a86]">
                从文件归档到生活规划，从待办事务到随手记录 ——
                每一个细节都经过精心打磨，归档，是对时间的尊重。
              </p>
            </Entrance>

            <Entrance
              as="div"
              from={{ opacity: 0, y: 24 }}
              to={{ opacity: 1, y: 0 }}
              inView
              viewportMargin="-60px"
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10"
            >
              <div className="grid grid-cols-[52px_1.1fr_1.3fr_96px] gap-4 border-b border-[#2a2a28] pb-3 font-mono text-[10px] tracking-[0.2em] text-[#8a8a86]">
                <span>MODE</span>
                <span>MODULE</span>
                <span>DESC</span>
                <span className="text-right">STATUS</span>
              </div>
              {features.map((f) => (
                <div
                  key={f.index}
                  className="group grid grid-cols-[52px_1.1fr_1.3fr_96px] items-start gap-4 border-b border-[#1a1a18] py-[18px] font-mono transition-colors hover:bg-[#101010]"
                >
                  <span className="text-[11px] text-[#8a8a86]">{f.index}</span>
                  <div>
                    <div className="text-[15px] text-white transition-all group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]">
                      ▸ {f.title}
                    </div>
                    <div className="mt-1 text-[11px] text-[#4a4a48]">{f.file}</div>
                  </div>
                  <p className="text-[12px] leading-relaxed text-[#8a8a86]">{f.description}</p>
                  <span className="text-right text-[10px] tracking-[0.18em] text-[#8a8a86]">
                    ACTIVE
                  </span>
                </div>
              ))}
            </Entrance>
          </div>

          {/* Constructivist geometry art (Fig.01) */}
          <Entrance
            as="aside"
            from={{ opacity: 0, x: 24 }}
            to={{ opacity: 1, x: 0 }}
            inView
            viewportMargin="-60px"
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block"
          >
            <div className="sticky top-28">
              <div className="relative border border-[#2a2a28] bg-[#0a0a0a] p-3">
                <img
                  src="/art/features-geometry.png"
                  alt="构成主义几何 · GRAYSCALE.7"
                  className="w-full grayscale"
                  loading="lazy"
                />
                <div className="mt-3 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-[#8a8a86]">
                  <span>FIG.01 — GRAYSCALE.7</span>
                  <span className="term-blink">▚</span>
                </div>
              </div>
              <div className="mt-4 space-y-1 font-mono text-[10px] tracking-[0.16em] text-[#4a4a48]">
                <p>AXIS: VERTICAL</p>
                <p>NOISE: 0.85</p>
                <p>STATE: ORDERED</p>
              </div>
            </div>
          </Entrance>
        </div>
      </div>
    </section>
  );
}
