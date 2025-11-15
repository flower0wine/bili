"use client";

import dayjs from "dayjs";

interface BasicDetailsProps {
  userCard: {
    sex?: string;
  } | null;
  userSpace: {
    birthday?: string;
    jointime?: number;
    email_status?: number;
    tel_status?: number;
  } | null;
}

export function BasicDetails({ userCard, userSpace }: BasicDetailsProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">性别</span>
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {userCard?.sex === "男"
            ? "男"
            : userCard?.sex === "女"
              ? "女"
              : "未知"}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">生日</span>
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {userSpace?.birthday || "未设置"}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          注册时间
        </span>
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {userSpace?.jointime
            ? dayjs(userSpace.jointime * 1000).format("YYYY年MM月DD日")
            : "未知"}
          {userSpace?.jointime && (
            <span className="ml-2 text-xs">
              (
              {dayjs(userSpace.jointime * 1000).fromNow()}
              )
            </span>
          )}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          邮箱状态
        </span>
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {userSpace?.email_status === 1 ? "已绑定" : "未绑定"}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          手机状态
        </span>
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {userSpace?.tel_status === 1 ? "已绑定" : "未绑定"}
        </span>
      </div>
    </div>
  );
}
