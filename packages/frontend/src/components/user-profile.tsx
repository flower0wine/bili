"use client";

import { useUserCardInfo, useUserSpaceInfo } from "@/hooks/apis";
import Image from "next/image";

interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const { data: userCard, isLoading: isLoadingCard, error: cardError } = useUserCardInfo({ uid: userId });
  const { data: userSpace, isLoading: isLoadingSpace, error: spaceError } = useUserSpaceInfo({ uid: userId });

  if (isLoadingCard || isLoadingSpace) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-red-800 dark:text-red-200 font-semibold mb-2">加载失败</h2>
          <p className="text-red-600 dark:text-red-400 text-sm">
            {cardError?.message || spaceError?.message || "无法获取用户信息"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 用户基本信息卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="relative px-6 pb-6">
          {/* 头像 */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-100 dark:bg-gray-700">
              {userCard.face ? (
                <Image
                  src={userCard.face}
                  alt={userCard.name || "用户头像"}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* 用户名和认证信息 */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {userCard.name || "未知用户"}
                </h1>
                {userCard.official?.role && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                    认证用户
                  </span>
                )}
                {userCard.vip?.status && (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                    VIP
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                UID: {userSpace.mid}
              </p>
            </div>
          </div>

          {/* 个性签名 */}
          {userCard.sign && (
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              {userCard.sign}
            </p>
          )}

          {/* 等级信息 */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">等级</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {userCard.level || 0}
                </span>
              </div>
            </div>

            {userSpace.is_senior_member && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded">
                硬核会员
              </span>
            )}
          </div>

          {/* 基本统计 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {userCard.rank || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">排名</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {userCard.level || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">等级</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {userSpace.moral || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">节操值</div>
            </div>
          </div>
        </div>
      </div>

      {/* 详细信息卡片 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 基本信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            基本信息
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">性别</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {userCard.sex === "男" ? "男" : userCard.sex === "女" ? "女" : "未知"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">生日</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {userSpace.birthday || "未设置"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">注册时间</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {new Date(userSpace.jointime * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">邮箱状态</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {userSpace.email_status === 1 ? "已绑定" : "未绑定"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">手机状态</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {userSpace.tel_status === 1 ? "已绑定" : "未绑定"}
              </span>
            </div>
          </div>
        </div>

        {/* 会员信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            会员信息
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">VIP 状态</span>
              <span className={`text-sm ${userCard.vip?.status ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-gray-100'}`}>
                {userCard.vip?.status ? "VIP用户" : "普通用户"}
              </span>
            </div>
            {userCard.vip?.due_date && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">VIP到期</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(userCard.vip.due_date * 1000).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">硬核会员</span>
              <span className={`text-sm ${userSpace.is_senior_member ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-gray-100'}`}>
                {userSpace.is_senior_member ? "是" : "否"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">认证信息</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {userCard.official?.title || "无"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 装饰信息 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 徽章 */}
        {userSpace.nameplate && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              徽章信息
            </h3>
            <div className="flex items-center gap-4">
              {userSpace.nameplate.image && (
                <Image
                  src={userSpace.nameplate.image}
                  alt={userSpace.nameplate.name || "徽章"}
                  width={60}
                  height={60}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {userSpace.nameplate.name || "未设置"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {userSpace.nameplate.level || ""}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 挂件 */}
        {userSpace.pendant && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              挂件信息
            </h3>
            <div className="flex items-center gap-4">
              {userSpace.pendant.image && (
                <Image
                  src={userSpace.pendant.image}
                  alt={userSpace.pendant.name || "挂件"}
                  width={60}
                  height={60}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {userSpace.pendant.name || "未设置"}
                </div>
                {userSpace.pendant.expire && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    到期: {new Date(userSpace.pendant.expire * 1000).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}