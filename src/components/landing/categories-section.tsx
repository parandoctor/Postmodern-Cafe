"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { RainbowColor } from "@/types";

const categories: Array<{
  color: string;
  bgColor: string;
  label: string;
  description: string;
}> = [
  { color: "red",      bgColor: "#DC2626", label: "红", description: "重要文件 · 紧急事项" },
  { color: "orange",   bgColor: "#EA580C", label: "橙", description: "创意灵感 · 设计素材" },
  { color: "yellow",   bgColor: "#CA8A04", label: "黄", description: "学习笔记 · 知识库" },
  { color: "green",    bgColor: "#BDB76B", label: "绿", description: "个人文档 · 证件资料" },
  { color: "blue",     bgColor: "#87CEFA", label: "蓝", description: "工作文件 · 项目管理" },
  { color: "darkblue", bgColor: "#1E3A8A", label: "深蓝", description: "归档备份 · 历史记录" },
  { color: "purple",   bgColor: "#7C3AED", label: "紫", description: "娱乐媒体 · 个人收藏" },
];

function CategoryPanel({
  bgColor,
  label,
  description,
  index,
}: {
  bgColor: string;
  label: string;
  description: string;
  index: number;
}) {
  return (
    <section
      className="relative flex h-screen w-full snap-start items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Subtle pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 px-8 text-center text-white"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 inline-block text-[12rem] font-black leading-none tracking-tight sm:text-[16rem] md:text-[20rem]"
          style={{ opacity: 0.15 }}
        >
          {label}
        </motion.span>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto mt-4 max-w-lg text-lg font-light tracking-wide text-white/80 sm:text-xl"
        >
          {description}
        </motion.p>

        {/* Bottom index */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <span className="text-sm font-light text-white/40">
            {String(index + 1).padStart(2, "0")} / 07
          </span>
        </motion.div>
      </motion.div>

      {/* Side color label */}
      <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
        <span
          className="text-[8rem] font-black leading-none tracking-tighter text-white/10"
          style={{ writingMode: "vertical-rl" }}
        >
          {label}
        </span>
      </div>
    </section>
  );
}

export function CategoriesSection() {
  return (
    <div className="h-screen snap-y snap-mandatory overflow-y-scroll">
      {categories.map((cat, index) => (
        <CategoryPanel
          key={cat.color}
          bgColor={cat.bgColor}
          label={cat.label}
          description={cat.description}
          index={index}
        />
      ))}
    </div>
  );
}
