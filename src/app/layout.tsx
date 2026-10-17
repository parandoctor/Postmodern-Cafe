import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "后现代咖啡馆 | Rainbow-box",
  description: "把记录，放在安静的地方。笔记、文件、音乐、图片与时间管理，都属于一个安静的私人空间。",
  keywords: ["个人空间", "笔记", "文件管理", "音乐", "图片编辑", "倒计时"],
  authors: [{ name: "Rainbow-box" }],
  openGraph: {
    title: "后现代咖啡馆 | Rainbow-box",
    description: "把记录，放在安静的地方。",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-white text-[#111] antialiased">{children}</body>
    </html>
  );
}
