"use client";

import { UserSearch } from "@/components/user-search";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            <h1 className="text-xl text-gray-900 font-bold dark:text-gray-100">
              Bilibili 用户信息查询
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              基于 B 站公开 API
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <UserSearch />
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
