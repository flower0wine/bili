"use client";

import { cn } from "@/lib/utils";
import { createLevelInfo } from "./level-config";

interface LevelProgressProps {
  level: number;
  isSeniorMember: boolean;
}

export function LevelProgress({ level, isSeniorMember }: LevelProgressProps) {
  const levelInfo = createLevelInfo(level, isSeniorMember);

  return (
    <div className="mb-6">
      {/* 等级标题 */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">等级</span>
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-8 w-8 flex items-center justify-center rounded-full text-sm text-white font-bold",
              levelInfo.config.bg
            )}
            >
              {levelInfo.level}
            </div>
            {levelInfo.isSenior && (
              <span className="rounded-full bg-yellow-500 px-2 py-1 text-xs text-yellow-400 font-semibold">
                👑
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 分段进度条 */}
      <div className="mb-3">
        <div className="relative overflow-hidden rounded-full">
          <div className="flex">
            {levelInfo.segments.map(segment => (
              <div
                key={segment.index}
                className="group relative flex-1"
              >
                {/* 进度段 */}
                <div
                  className={cn(
                    "h-4 transition-all duration-300 hover:scale-105",
                    // 只有第一个和最后一个段有圆角
                    segment.index === 0 && "rounded-l-full",
                    segment.index === levelInfo.segments.length - 1 && "rounded-r-full",
                    segment.isCompleted
                      ? `${segment.config.bg} shadow-lg`
                      : segment.isActive
                        ? `bg-gray-200 dark:bg-gray-600 ring-2 ring-offset-1 ${levelInfo.config.border}`
                        : `${segment.config.bg} opacity-30`
                  )}
                >
                </div>

                {/* 段位标签 - 直接放在分段中间 */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className={cn(
                    "text-sm font-bold font-mono",
                    segment.isCompleted
                      ? "text-white"
                      : segment.isActive
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-500 dark:text-gray-400"
                  )}
                  >
                    LV
                    {segment.index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 光扫效果 */}
          <div className="pointer-events-none absolute inset-0 animate-light-sweep from-transparent via-white/60 to-transparent bg-gradient-to-r" />
        </div>
      </div>
    </div>
  );
}
