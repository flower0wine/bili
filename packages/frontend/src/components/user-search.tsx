"use client";

import { useState } from "react";

interface UserSearchProps {
  onSearch: (userId: number) => void;
  isLoading?: boolean;
}

export function UserSearch({ onSearch, isLoading = false }: UserSearchProps) {
  const [userId, setUserId] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) {
      const numUserId = Number(userId.trim());
      if (!isNaN(numUserId) && numUserId > 0) {
        onSearch(numUserId);
      }
    }
  };

  const handleQuickSearch = (id: number) => {
    setUserId(id.toString());
    onSearch(id);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          查询用户信息
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="请输入用户 UID 或数字 ID"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !userId.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
            >
              {isLoading ? "查询中..." : "查询"}
            </button>
          </div>
        </form>

        {/* 快速查询选项 */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            快速查询
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 456664753, name: "官方测试账号" },
              { id: 2, name: "碧诗" },
              { id: 946974, name: "LexBurner" },
              { id: 22603245, name: "老番茄" },
            ].map((user) => (
              <button
                key={user.id}
                onClick={() => handleQuickSearch(user.id)}
                disabled={isLoading}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 text-sm rounded-full transition-colors"
              >
                {user.name}
              </button>
            ))}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            使用说明
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
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