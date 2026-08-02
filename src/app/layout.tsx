import type { Metadata } from "next";
import { BlueprintOverlay } from "@/components/ui/blueprint-overlay";
import "./globals.css";

export const metadata: Metadata = {
  title: "收纳盒 | Rainbow-box - 现代化文件管理与分类收纳平台",
  description:
    "现代化个人文件管理与分类收纳平台。以黑白蓝图重新定义文件管理方式，让每一份文件都有它的归属。",
  keywords: ["文件管理", "蓝图", "收纳", "Rainbow-box", "在线文件管理"],
  authors: [{ name: "Rainbow-box" }],
  openGraph: {
    title: "收纳盒 | Rainbow-box",
    description: "以黑白蓝图重新定义文件管理方式",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <BlueprintOverlay />
        {children}
      </body>
    </html>
  );
}
