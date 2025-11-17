import { createHash } from "crypto";
import { ConfigSource } from "@/services/task/trigger/config";

export function string2Object<T>(str: string) {
  try {
    return JSON.parse(str) as T;
  } catch (e) {
    return undefined as T;
  }
}

export function any2Object<T>(obj: any) {
  try {
    return JSON.parse(JSON.stringify(obj)) as T;
  } catch (e) {
    return undefined as T;
  }
}

/**
 * 生成稳定的数据库触发器ID
 */
export function generateStableId(): string {
  // 使用配置源类型 + 数据库ID生成唯一且稳定的ID
  const uniqueKey = `${ConfigSource.DATABASE}`;
  const hash = createHash("sha256").update(uniqueKey).digest("hex");

  // 转换为UUID格式
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32)
  ].join("-");
}
