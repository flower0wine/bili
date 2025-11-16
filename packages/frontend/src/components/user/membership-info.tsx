"use client";

import dayjs from "dayjs";
import { cn } from "@/lib/utils";

interface MembershipInfoProps {
  userCard: {
    vip?: {
      status?: number;
      due_date?: number;
    };
    official?: {
      title?: string;
    };
  } | null;
  userSpace: {
    is_senior_member: boolean;
  } | null;
}

export function MembershipInfo({
  userCard,
  userSpace,
}: MembershipInfoProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          VIP 状态
        </span>
        <span
          className={cn(
            "text-sm",
            userCard?.vip?.status
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-gray-900 dark:text-gray-100"
          )}
        >
          {userCard?.vip?.status ? "VIP用户" : "普通用户"}
        </span>
      </div>
      {userCard?.vip?.due_date && (
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            VIP到期
          </span>
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {dayjs(userCard.vip.due_date).format("YYYY年MM月DD日")}
            <span className="ml-2 text-xs">
              (
              {dayjs(userCard.vip.due_date).fromNow()}
              )
            </span>
          </span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          硬核会员
        </span>
        <span
          className={cn(
            "text-sm",
            userSpace?.is_senior_member
              ? "text-purple-600 dark:text-purple-400"
              : "text-gray-900 dark:text-gray-100"
          )}
        >
          {userSpace?.is_senior_member ? "是" : "否"}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          认证信息
        </span>
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {userCard?.official?.title || "无"}
        </span>
      </div>
    </div>
  );
}
