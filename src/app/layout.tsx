import type { Metadata } from "next";
import { BlueprintOverlay } from "@/components/ui/blueprint-overlay";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { DefaultBgm } from "@/components/ui/default-bgm";
import "./globals.css";

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
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <BlueprintOverlay />
          {children}
          <DefaultBgm />
        </ThemeProvider>
      </body>
    </html>
  );
}
