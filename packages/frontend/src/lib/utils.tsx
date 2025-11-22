import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss.SSS
 */
export function formatDateTime(date: string | Date | undefined): string {
  if (!date)
    return "-";
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss.SSS");
}

/**
 * 智能显示执行时长
 * 根据时间大小自动选择合适的单位：毫秒、秒、分钟、小时、天
 * @param ms 毫秒数
 * @returns 格式化后的时长字符串
 */
export function formatDuration(ms: number | undefined): string {
  if (!ms || ms < 0)
    return "-";

  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  }

  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`;
  }

  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${minutes.toFixed(2)}min`;
  }

  const hours = minutes / 60;
  if (hours < 24) {
    return `${hours.toFixed(2)}h`;
  }

  const days = hours / 24;
  return `${days.toFixed(2)}d`;
}
