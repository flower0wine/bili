"use client";

import {
  useUserCardHistoryData,
  useUserCardInfo,
  useUserSpaceInfo,
} from "@/hooks/apis";
import { cn } from "@/lib/utils";
import { FollowerChart } from "./follower-chart";
import { FollowingChart } from "./following-chart";
import {
  BasicDetails,
  Decorations,
  LevelProgress,
  MembershipInfo,
  UserBasicInfo,
} from "./user";

interface UserProfileProps {
  userId: number;
}

export function UserProfile({ userId }: UserProfileProps) {
  const {
    data: userCard,
    isLoading: isLoadingCard,
    error: cardError,
  } = useUserCardInfo(userId);
  const {
    data: userSpace,
    isLoading: isLoadingSpace,
    error: spaceError,
  } = useUserSpaceInfo(userId);
  const { data: historyData, isLoading: isLoadingHistory }
    = useUserCardHistoryData(userId);

  const level = userCard?.level || 0;
  const isSeniorMember = userSpace?.is_senior_member || false;

  if (isLoadingCard || isLoadingSpace) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="flex items-start gap-6">
              <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex-1">
                <div className="mb-2 h-6 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="mb-4 h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[...Array.from({ length: 4 })].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                    >
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cardError || spaceError || !userCard || !userSpace) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="animate-shake border border-red-200 rounded-lg bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <h2 className="mb-2 flex items-center gap-2 text-red-800 font-semibold dark:text-red-200">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            加载失败
          </h2>
          <p className="text-sm text-red-600 dark:text-red-400">
            {cardError?.message || spaceError?.message || "无法获取用户信息"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      {/* 用户基本信息 */}
      <div className={cn(
        "rounded-lg bg-white p-6 shadow-md dark:bg-gray-800",
        isSeniorMember && "border-l-4 border-yellow-500"
      )}
      >
        <UserBasicInfo
          userCard={userCard}
          userSpace={userSpace}
          levelInfo={{ level, isSeniorMember } as any}
        />

        {/* 等级进度 */}
        <LevelProgress level={level} isSeniorMember={isSeniorMember} />
      </div>

      {/* 详细信息 */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h3 className="mb-4 text-lg text-gray-900 font-semibold dark:text-gray-100">
            基本信息
          </h3>
          <BasicDetails userCard={userCard} userSpace={userSpace} />
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h3 className="mb-4 text-lg text-gray-900 font-semibold dark:text-gray-100">
            会员信息
          </h3>
          <MembershipInfo
            userCard={userCard}
            userSpace={userSpace}
          />
        </div>
      </div>

      {/* 装饰信息 */}
      <Decorations userSpace={userSpace} />

      {/* 图表 */}
      <div className="space-y-6">
        <FollowerChart data={historyData || []} isLoading={isLoadingHistory} />
        <FollowingChart data={historyData || []} isLoading={isLoadingHistory} />
      </div>
    </div>
  );
}
