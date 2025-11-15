"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserSearchProps {
  isLoading?: boolean;
}

export function UserSearch({ isLoading = false }: UserSearchProps) {
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) {
      const numUserId = Number(userId.trim());
      if (!isNaN(numUserId) && numUserId > 0) {
        router.push(`/user/${numUserId}`);
      }
    }
  };

  const handleQuickSearch = (id: number) => {
    setUserId(id.toString());
    router.push(`/user/${id}`);
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="animate-fade-in rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl text-gray-900 font-semibold dark:text-gray-100">
          查询用户信息
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="number"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="请输入用户 UID 或数字 ID"
              className="flex-1 border border-gray-300 rounded-lg bg-white px-4 py-2 text-gray-900 transition-all duration-200 dark:border-gray-600 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !userId.trim()}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white font-medium transition-all duration-200 active:scale-95 hover:scale-105 disabled:cursor-not-allowed disabled:bg-blue-400 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading
                ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      查询中...
                    </span>
                  )
                : "查询"}
            </button>
          </div>
        </form>

        {/* 快速查询选项 */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm text-gray-700 font-medium dark:text-gray-300">
            快速查询
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 456664753, name: "官方测试账号" },
              { id: 2, name: "碧诗" },
              { id: 946974, name: "LexBurner" },
              { id: 22603245, name: "老番茄" },
            ].map(user => (
              <button
                key={user.id}
                onClick={() => handleQuickSearch(user.id)}
                disabled={isLoading}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-all duration-200 active:scale-95 hover:scale-105 disabled:cursor-not-allowed dark:bg-gray-700 hover:bg-gray-200 dark:text-gray-300 disabled:opacity-50 dark:hover:bg-gray-600"
              >
                {user.name}
              </button>
            ))}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-6 border border-blue-200 rounded-lg bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h4 className="mb-2 flex items-center gap-2 text-sm text-blue-800 font-medium dark:text-blue-200">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            使用说明
          </h4>
          <ul className="text-sm text-blue-700 space-y-1 dark:text-blue-300">
            <li>• 输入 B 站用户的 UID 或数字 ID</li>
            <li>• 点击快速查询可以直接查看预设用户</li>
            <li>• 查询结果包含用户的详细信息、统计数据等</li>
            <li>• 数据来源于 B 站公开 API</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
