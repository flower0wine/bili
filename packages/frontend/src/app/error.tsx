"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 记录全局错误
    console.error("Global application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        {/* 错误图标动画 */}
        <div className="mb-8 relative">
          {/* 外圈脉冲动画 */}
          <div className="w-24 h-24 mx-auto relative">
            <div className="absolute inset-0 bg-destructive/20 rounded-full animate-ping" style={{ animationDelay: "0.6s" }}></div>
            <div className="absolute inset-2 bg-destructive/30 rounded-full animate-ping" style={{ animationDelay: "0.6s" }}></div>
            <div className="absolute inset-4 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive animate-bounce" />
            </div>
          </div>

          {/* 环绕的警告点 */}
          <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-destructive/40 rounded-full animate-pulse"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-16px)`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: "1.5s"
                }}
              />
            ))}
          </div>
        </div>

        {/* 错误标题 */}
        <h1 className="text-3xl font-bold text-foreground mb-4 animate-fade-in">
          应用出错了
        </h1>

        {/* 错误描述 */}
        <p className="text-muted-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          很抱歉，应用遇到了意外错误。请尝试刷新页面或返回首页。
        </p>

        {/* 错误详情（开发环境） */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-3 bg-muted rounded-lg text-left animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <h3 className="font-medium text-sm text-foreground mb-1">错误详情：</h3>
            <code className="text-xs text-muted-foreground break-all">
              {error.message}
            </code>
            {error.digest && (
              <div className="mt-1">
                <span className="text-xs text-muted-foreground">
                  ID:
                  {" "}
                  {error.digest}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <button
            onClick={reset}
            className="group inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 text-sm font-medium hover:scale-105 hover:shadow-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            重试
          </button>

          <Link
            href="/"
            className="group inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted transition-all duration-300 text-sm font-medium hover:scale-105 hover:shadow-md"
          >
            <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
            返回首页
          </Link>
        </div>
      </div>

      {/* 自定义动画样式 */}
      <style jsx>
        {`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}
      </style>
    </div>
  );
}
