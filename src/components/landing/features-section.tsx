"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FolderOpen,
  Search,
  Star,
  Trash2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon: Icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="group relative overflow-hidden rounded-xl border border-whisper bg-white/60 backdrop-blur-md p-6 shadow-card transition-shadow hover:shadow-card-hover">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded border border-whisper bg-white/70">
          <Icon className="h-[18px] w-[18px] text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-[16px] font-semibold tracking-[-0.15px]">{title}</h3>
        <p className="text-[14px] text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

const features = [
  {
    icon: Upload,
    title: "极速上传",
    description: "支持拖拽、点击、批量上传多种方式，大文件断点续传，上传进度实时显示。",
  },
  {
    icon: FolderOpen,
    title: "分类管理",
    description: "多级分类体系，黑白灰阶哑光色系统一视觉规范，让文件管理更直观有序。",
  },
  {
    icon: Search,
    title: "智能搜索",
    description: "快速搜索文件名称，按分类、类型、日期筛选，大文件分页懒加载，性能优秀。",
  },
  {
    icon: Star,
    title: "收藏与最近",
    description: "收藏常用文件，自动记录最近访问和最近修改，让高频文件触手可及。",
  },
  {
    icon: Trash2,
    title: "回收站",
    description: "删除的文件进入回收站保护期，支持恢复和永久删除，不再担心误操作。",
  },
  {
    icon: Shield,
    title: "安全可靠",
    description: "密码加密，Session 管理，CSRF 防护，文件类型白名单，全方位安全保障。",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 lg:py-32 border-t border-whisper">
      <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-[32px] font-bold tracking-[-0.5px] sm:text-[40px]">
            强大而优雅的文件管理
          </h2>
          <p className="mt-4 text-[16px] text-muted-foreground leading-relaxed">
            从上传到分类，从预览到管理，每一个细节都经过精心打磨，
            为你带来前所未有的文件管理体验。
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.05}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
