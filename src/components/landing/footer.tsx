"use client";

import * as React from "react";
import {
  Github,
  Mail,
  MessageCircle,
  Send,
  Globe,
  ArrowUpRight,
} from "lucide-react";
import { Entrance } from "@/components/ui/entrance";

interface SocialLink {
  label: string;
  channel: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const socialLinks: SocialLink[] = [
  { label: "GitHub", channel: "github", icon: Github, href: "https://github.com" },
  { label: "邮箱", channel: "mail", icon: Mail, href: "mailto:hello@rainbow-box.com" },
  { label: "QQ", channel: "qq", icon: MessageCircle, href: "#" },
  { label: "Telegram", channel: "telegram", icon: Send, href: "#" },
  { label: "个人网站", channel: "web", icon: Globe, href: "#" },
];

const quickLinks = [
  { label: "功能特性", href: "#features" },
  { label: "登录", href: "/login" },
  { label: "注册", href: "/register" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="about"
      className="term-bg term-scanlines term-noise relative overflow-hidden border-t border-black bg-[#0a0a0a]"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[300px_1fr_260px]">
          {/* Dotwork portrait art (Fig.02) */}
          <Entrance
            as="div"
            from={{ opacity: 0, x: -24 }}
            to={{ opacity: 1, x: 0 }}
            inView
            viewportMargin="-60px"
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative border border-[#2a2a28] bg-[#050505] p-3">
              <img
                src="/art/contact-dotwork.png"
                alt="点阵人像 · STIPPLE"
                className="w-full grayscale"
                loading="lazy"
              />
              <div className="mt-3 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-[#8a8a86]">
                <span>FIG.02 — STIPPLE</span>
                <span className="term-blink">●</span>
              </div>
            </div>
            <p className="mt-4 font-mono text-[10px] leading-relaxed tracking-[0.16em] text-[#4a4a48]">
              黑白蓝图风格的综合服务平台
              <br />
              生活记录 · 资料归档 · 事务处理
            </p>
          </Entrance>

          {/* Contact channels */}
          <Entrance
            as="div"
            from={{ opacity: 0, y: 24 }}
            to={{ opacity: 1, y: 0 }}
            inView
            viewportMargin="-60px"
            transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[11px] tracking-[0.2em] text-[#8a8a86]">
              $ ls ./contact --channels
            </p>
            <h3
              data-text="联系方式 / CONTACT"
              className="term-glitch mt-4 font-mono text-[22px] font-bold tracking-[-0.01em] text-white sm:text-[28px]"
            >
              联系方式 / CONTACT
            </h3>

            <div className="mt-8 divide-y divide-[#1a1a18] border-y border-[#2a2a28]">
              {socialLinks.map((link) => (
                <a
                  key={link.channel}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 py-[14px] font-mono transition-colors hover:bg-[#101010]"
                >
                  <link.icon className="h-[16px] w-[16px] text-[#8a8a86] transition-colors group-hover:text-white" />
                  <span className="text-[13px] text-white">{link.label}</span>
                  <span className="text-[11px] text-[#4a4a48]">./contact/{link.channel}</span>
                  <ArrowUpRight className="ml-auto h-[14px] w-[14px] text-[#4a4a48] transition-all group-hover:translate-x-0.5 group-hover:text-white" />
                </a>
              ))}
            </div>

            <p className="mt-6 font-mono text-[12px] text-[#8a8a86]">
              <span className="text-white">$</span> ping postmodern.cafe{" "}
              <span className="text-white">[OK]</span>
              <span className="term-caret ml-1" />
            </p>
          </Entrance>

          {/* Quick nav + brand */}
          <Entrance
            as="div"
            from={{ opacity: 0, y: 24 }}
            to={{ opacity: 1, y: 0 }}
            inView
            viewportMargin="-60px"
            transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[11px] tracking-[0.2em] text-[#8a8a86]">
              $ tree ./quick-nav
            </p>
            <h4 className="mt-4 font-mono text-[14px] font-bold text-white">快速导航</h4>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="font-mono text-[13px] text-[#8a8a86] transition-colors hover:text-white"
                  >
                    ▸ {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-[#2a2a28] pt-6">
              <div className="font-mono text-[13px] font-bold text-white">后现代咖啡馆</div>
              <p className="mt-2 font-mono text-[11px] leading-relaxed text-[#4a4a48]">
                $ whoami → POSTMODERN.CAFÉ
                <br />
                生活 · 资料 · 事务
              </p>
            </div>
          </Entrance>
        </div>

        {/* Bottom bar */}
        <Entrance
          as="div"
          from={{ opacity: 0 }}
          to={{ opacity: 1 }}
          inView
          viewportMargin="-60px"
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 flex flex-wrap items-center gap-4 border-t border-[#2a2a28] pt-6 font-mono text-[11px] text-[#8a8a86]"
        >
          <span>© {currentYear} 后现代咖啡馆 · 保留所有权利</span>
          <span className="ml-auto flex gap-6 tracking-[0.16em]">
            <span>GRAY.7</span>
            <span>FS.OK</span>
            <span className="text-white">LINK.OK ●</span>
          </span>
        </Entrance>
      </div>
    </footer>
  );
}
