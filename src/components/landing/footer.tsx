"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Github,
  Mail,
  MessageCircle,
  Send,
  Globe,
  Twitter,
  Youtube,
  Music2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialLink {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const socialLinks: SocialLink[] = [
  { label: "GitHub", icon: Github, href: "#", color: "hover:text-[#333] dark:hover:text-[#fff]" },
  { label: "邮箱", icon: Mail, href: "mailto:hello@rainbow-box.com", color: "hover:text-[#EA4335]" },
  { label: "QQ", icon: MessageCircle, href: "#", color: "hover:text-[#12B7F5]" },
  { label: "Telegram", icon: Send, href: "#", color: "hover:text-[#26A5E4]" },
  { label: "Discord", icon: MessageCircle, href: "#", color: "hover:text-[#5865F2]" },
  { label: "X (Twitter)", icon: Twitter, href: "#", color: "hover:text-[#1DA1F2]" },
  { label: "Bilibili", icon: Youtube, href: "#", color: "hover:text-[#FB7299]" },
  { label: "个人网站", icon: Globe, href: "#", color: "hover:text-primary" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="about" className="relative border-t border-border/50 bg-background">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600">
                <span className="text-sm font-bold text-white">R</span>
              </div>
              <span className="text-lg font-semibold">
                <span className="rainbow-text">收纳盒</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
              现代化个人文件管理与分类收纳平台。
              以七彩分类重新定义文件管理方式，让每一份文件都有它的归属。
            </p>

            {/* Social links */}
            <div className="mt-8">
              <h4 className="text-sm font-medium mb-4">联系方式</h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.label}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border border-border/50",
                      "text-muted-foreground transition-all duration-300",
                      "hover:scale-110 hover:shadow-lg hover:border-transparent",
                      link.color,
                    )}
                    style={{
                      boxShadow: "0 0 0 0 transparent",
                    }}
                  >
                    <link.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-sm font-medium">快速导航</h4>
            <ul className="mt-4 space-y-3">
              {[
                { label: "功能特性", href: "#features" },
                { label: "七彩分类", href: "#categories" },
                { label: "登录", href: "/login" },
                { label: "注册", href: "/register" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-sm font-medium">联系我们</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="mailto:hello@rainbow-box.com"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  hello@rainbow-box.com
                </a>
              </li>
              <li className="text-sm text-muted-foreground">
                欢迎提出建议和反馈
              </li>
            </ul>

            <div className="mt-8 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-purple-500/5 p-6">
              <h4 className="text-sm font-semibold">开始使用</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                注册即可获得免费的七彩分类管理体验
              </p>
              <a
                href="/register"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                立即注册 →
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 border-t border-border/50 pt-8"
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} 收纳盒 (Rainbow-box). All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">隐私政策</a>
              <a href="#" className="hover:text-foreground transition-colors">服务条款</a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
