import type { Metadata } from "next";
import setupLocatorUI from "@locator/runtime";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";
import "@unocss/reset/tailwind.css";

if (process.env.NODE_ENV === "development") {
  setupLocatorUI();
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable}  ${geistMono.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
