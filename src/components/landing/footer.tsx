"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Github,
  Mail,
  MessageCircle,
  Send,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialLink {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const socialLinks: SocialLink[] = [
  { label: "GitHub", icon: Github, href: "#" },
  { label: "邮箱", icon: Mail, href: "mailto:hello@rainbow-box.com" },
  { label: "QQ", icon: MessageCircle, href: "#" },
  { label: "Telegram", icon: Send, href: "#" },
  { label: "个人网站", icon: Globe, href: "#" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="about" className="border-t border-whisper bg-white/60 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-24">
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
              <div className="flex h-8 w-8 items-center justify-center border border-whisper bg-white/70">
                <span className="text-[14px] font-bold">R</span>
              </div>
              <span className="text-[16px] font-semibold">收纳盒</span>
            </div>
            <p className="mt-4 max-w-sm text-[14px] text-muted-foreground leading-relaxed">
              极简风格个人文件管理与分类收纳平台。
              黑白配色，分类清晰，让每一份文件都有它的归属。
            </p>

            <div className="mt-8">
              <h4 className="text-[14px] font-medium mb-4">联系方式</h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.label}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded border border-whisper",
                      "text-muted-foreground transition-all duration-300",
                      "hover:bg-[rgba(0,0,0,0.04)]",
                    )}
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
            <h4 className="text-[14px] font-medium">快速导航</h4>
            <ul className="mt-4 space-y-3">
              {[
                { label: "功能特性", href: "#features" },
                { label: "登录", href: "/login" },
                { label: "注册", href: "/register" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-[14px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-[14px] font-medium">关于</h4>
            <ul className="mt-4 space-y-3">
              <li className="text-[14px] text-muted-foreground">
                收纳盒 &copy; {currentYear}
              </li>
              <li className="text-[14px] text-muted-foreground">
                简约 · 高效 · 有序
              </li>
              <li className="text-[14px] text-muted-foreground">
                用最纯粹的方式管理文件
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 border-t border-whisper pt-8 text-center"
        >
          <p className="text-[12px] text-muted-foreground">
            &copy; {currentYear} 收纳盒. 保留所有权利.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
