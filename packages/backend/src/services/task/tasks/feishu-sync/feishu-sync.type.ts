/**
 * 任务参数类型
 */
export interface SyncParams {
  mids?: number[]; // 指定同步的用户ID列表
}

/**
 * 任务返回结果类型
 */
export interface SyncResult {
  total: number;
  success: number;
  failed: number;
  results: Array<{
    mid: number;
    name: string;
    success: boolean;
    error?: string;
  }>;
}
