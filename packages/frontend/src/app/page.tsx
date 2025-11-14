"use client";

import { useState } from "react";
import { UserSearch } from "@/components/user-search";
import { UserProfile } from "@/components/user-profile";

export default function Home() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleUserSearch = (userId: number) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Bilibili 用户信息查询
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              基于 B 站公开 API
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <UserSearch onSearch={handleUserSearch} />

        {selectedUserId && (
          <UserProfile userId={selectedUserId} />
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© 2024 Bilibili 用户信息查询系统</p>
            <p className="mt-1">
              数据来源于{" "}
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
