"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UserProfile } from "@/components/user-profile";

export default function UserPage() {
  const params = useParams();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    if (params.id) {
      const id = Number.parseInt(params.id as string);
      if (!isNaN(id)) {
        setUserId(id);
      }
    }
  }, [params.id]);

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin border-b-2 border-blue-600 rounded-full"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-500 transition-colors dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <h1 className="text-xl text-gray-900 font-bold dark:text-gray-100">
                用户详情
              </h1>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              基于 B 站公开 API
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <UserProfile userId={userId} />
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 sm:px-6">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© 2024 Bilibili 用户信息查询系统</p>
            <p className="mt-1">
              数据来源于
              {" "}
              <a
                href="https://api.bilibili.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Bilibili 公开 API
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
