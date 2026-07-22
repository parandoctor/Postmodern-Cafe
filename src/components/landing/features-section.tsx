"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FolderOpen,
  Image,
  Search,
  Trash2,
  Star,
  Share2,
  Grid3X3,
  List,
  Palette,
  Shield,
  Zap,
  Cloud,
  RefreshCw,
  FileType,
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
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-none border border-border bg-background p-6 transition-all duration-500 hover:bg-secondary">
        <div className="relative z-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center border border-border bg-background">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

const features = [
  {
    icon: Upload,
    title: "拖拽上传",
    description: "支持拖拽、点击、批量上传多种方式，大文件断点续传，上传进度实时显示，失败自动重试。",
  },
  {
    icon: Palette,
    title: "七彩分类",
    description: "红橙黄绿蓝深蓝紫七种配色，每种颜色对应一类文件，统一的视觉规范让管理更直观。",
  },
  {
    icon: Image,
    title: "在线预览",
    description: "图片、视频、音频、PDF、Office 文档、Markdown 等格式无需下载即可在线预览。",
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
    icon: Grid3X3,
    title: "多种视图",
    description: "支持网格和列表两种视图模式，满足不同场景下的文件浏览需求。",
  },
  {
    icon: Shield,
    title: "安全可靠",
    description: "密码 bcrypt 加密，Session 管理，CSRF 防护，文件类型白名单，全方位安全保障。",
  },
  {
    icon: RefreshCw,
    title: "批量操作",
    description: "批量移动、删除、收藏、下载，选中多个文件一键完成批量管理操作。",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 lg:py-32 border-t border-border">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            强大而优雅的
            <span className="font-extrabold">文件管理</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            从上传到分类，从预览到管理，每一个细节都经过精心打磨，
            为你带来前所未有的文件管理体验。
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
