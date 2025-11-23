import type { Metadata } from "next";
import setupLocatorUI from "@locator/runtime";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/providers/query.provider";
import ToastProvider from "@/providers/toast.provider";
import "./globals.css";
import "./animation.css";

if (process.env.NODE_ENV === "development") {
  setupLocatorUI();
}

export const metadata: Metadata = {
  title: "Bilibili 用户信息查询",
  description:
    "基于 B 站公开 API 的用户信息查询系统，展示用户的详细资料、统计数据等内容",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
