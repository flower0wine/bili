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
  if (!date || date === "undefined")
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

/**
 * 将对象字符串转换为对象
 * 支持 JSON 和 JavaScript 对象字面量格式
 * @param str 对象字符串
 * @returns 解析后的对象
 * @throws 如果字符串不是有效的对象格式或解析失败
 */
export function parseObjectString(str: string): Record<string, unknown> {
  if (!str.trim()) {
    return {};
  }

  try {
    // eslint-disable-next-line no-eval
    const parsed = eval(`(${str})`);

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("参数必须是一个有效的对象");
    }

    return parsed as Record<string, unknown>;
  }
  catch (error) {
    if (error instanceof Error && error.message === "参数必须是一个有效的对象") {
      throw error;
    }
    throw new Error("参数必须是一个有效的对象");
  }
}
