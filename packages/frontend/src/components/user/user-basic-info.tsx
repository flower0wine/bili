"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserBasicInfoProps {
  userCard: {
    name?: string;
    face?: string;
    sign?: string;
    sex?: string;
  } | null;
  userSpace: {
    mid: number;
    is_senior_member: boolean;
  } | null;
  levelInfo: {
    isSeniorMember: boolean;
    level: number;
  };
}

export function UserBasicInfo({
  userCard,
  userSpace,
  levelInfo,
}: UserBasicInfoProps) {
  return (
    <div className="animate-fade-in">
      {/* 头像 */}
      <div className="relative mb-4">
        <div
          className={cn(
            "relative h-24 w-24 overflow-hidden border-4 rounded-full bg-gray-100 transition-all duration-300 hover:scale-105 dark:bg-gray-700",
            levelInfo.isSeniorMember
              ? "border-yellow-400 shadow-lg shadow-yellow-200/50 dark:shadow-yellow-600/50 animate-pulse"
              : "border-white dark:border-gray-800 shadow-md"
          )}
        >
          {userCard?.face
            ? (
                <Image
                  src={userCard.face}
                  alt={userCard.name || "用户头像"}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                />
              )
            : (
                <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <svg
                    className="h-12 w-12"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
          {/* LV6硬核会员头像装饰 */}
          {levelInfo.isSeniorMember && (
            <div className="absolute h-8 w-8 flex animate-bounce items-center justify-center rounded-full bg-yellow-500 -right-1 -top-1">
              <span className="text-sm text-white">👑</span>
            </div>
          )}
        </div>
      </div>

      {/* 用户名和认证信息 */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-2xl text-gray-900 font-bold transition-colors duration-200 dark:text-gray-100">
              {userCard?.name || "未知用户"}
            </h1>
            {userCard && (userCard as any).official?.role && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 transition-all duration-200 hover:scale-105 dark:bg-blue-900/30 dark:text-blue-200">
                认证用户
              </span>
            )}
            {userCard && (userCard as any).vip?.status && (
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800 transition-all duration-200 hover:scale-105 dark:bg-yellow-900/30 dark:text-yellow-200">
                VIP
              </span>
            )}
          </div>
          <p className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            UID:
            {" "}
            {userSpace?.mid}
          </p>
        </div>
      </div>

      {/* 个性签名 */}
      {userCard?.sign && (
        <p className="mb-6 border-l-4 border-blue-400 rounded-lg bg-gray-50 p-3 text-gray-700 leading-relaxed dark:bg-gray-700/50 dark:text-gray-300">
          {userCard.sign}
        </p>
      )}
    </div>
  );
}
