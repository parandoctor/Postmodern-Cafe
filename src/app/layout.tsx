import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import { BlueprintOverlay } from "@/components/ui/blueprint-overlay";
import { DefaultBgm } from "@/components/ui/default-bgm";
import "./globals.css";

// 思源黑体（Noto Sans SC / Source Han Sans）：全站默认字体，本地打包自托管
const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "后现代咖啡馆 | Rainbow-box - 一站式综合服务平台",
  description:
    "黑白蓝图风格的综合服务平台，统一管理生活记录、资料归档与事务处理，让一切井然有序。",
  keywords: ["生活管理", "资料归档", "事务处理", "文件管理", "后现代咖啡馆", "Rainbow-box"],
  authors: [{ name: "Rainbow-box" }],
  openGraph: {
    title: "后现代咖啡馆 | Rainbow-box",
    description: "一站式管理生活、资料与事务的综合服务平台",
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
      <body className={`${notoSansSC.variable} min-h-screen bg-background text-foreground antialiased`}>
        <BlueprintOverlay />
        {children}
        <DefaultBgm />
      </body>
    </html>
  );
}
