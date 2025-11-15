"use client";

import { cn } from "@/lib/utils";
import { createLevelInfo } from "./level-config";

interface StatsCardsProps {
  rank: number;
  moral: number;
  level: number;
  isSeniorMember: boolean;
}

export function StatsCards({ rank, moral, level, isSeniorMember }: StatsCardsProps) {
  const levelInfo = createLevelInfo(level, isSeniorMember);

  return (
    <div className="grid grid-cols-3 mb-6 gap-4">
      {/* 排名 */}
      <div className="border border-gray-200 rounded-lg bg-white p-4 text-center dark:border-gray-600 dark:bg-gray-700">
        <div className="mb-1 text-2xl text-blue-600 font-bold dark:text-blue-400">
          {rank || 0}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">排名</div>
      </div>

      {/* 等级 */}
      <div className="border border-gray-200 rounded-lg bg-white p-4 text-center dark:border-gray-600 dark:bg-gray-700">
        <div className={cn("mb-1 text-2xl font-bold", levelInfo.config.text)}>
          LV
          {levelInfo.level}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          等级
        </div>
      </div>

      {/* 节操值 */}
      <div className="border border-gray-200 rounded-lg bg-white p-4 text-center dark:border-gray-600 dark:bg-gray-700">
        <div className="mb-1 text-2xl text-purple-600 font-bold dark:text-purple-400">
          {moral || 0}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">节操值</div>
      </div>
    </div>
  );
}
