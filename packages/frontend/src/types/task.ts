export interface TaskVO {
  name: string;
  description: string;
  options: Record<string, unknown>;
}

export interface ExecuteTaskDTO {
  params?: Record<string, unknown>;
}

export enum TaskStatus {
  RUNNING = "running",
  FAILED = "failed",
  CANCELLED = "cancelled",
  SUCCESS = "success",
}

export enum TriggerSource {
  MANUAL = "manual",
  CRON = "cron",
  API = "api",
}

export interface ExecuteTaskVO {
  taskId: string;
  status: TaskStatus;
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  result?: unknown;
  error?: string;
}

export interface TaskExecutionVO {
  id: string;
  taskName: string;
  triggerSource: TriggerSource;
  triggerName: string;
  params: Record<string, unknown>;
  status: TaskStatus;
  result?: unknown;
  error?: string | null;
  retryCount: number;
  maxRetries: number;
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskExecutionQueryDTO {
  taskName?: string;
  status?: TaskStatus;
  triggerSource?: TriggerSource;
  startedAt?: string;
  finishedAt?: string;
}

export interface TaskExecutionListVO {
  items: TaskExecutionVO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TaskStatsVO {
  total: number;
  running: number;
  success: number;
  failed: number;
  cancelled: number;
  avgDuration: number;
}

export enum TaskExecutionLevel {
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  DEBUG = "debug"
}

/**
 * 任务执行日志
 */
export interface TaskExecutionLogVO {
  timestamp: string;
  level: TaskExecutionLevel;
  message: string;
  data?: unknown;
}

/**
 * 正在运行的任务执行信息
 */
export interface RunningTaskExecutionVO {
  executionId: string;
  taskName?: string;
  triggerName: string;
  triggeredAt: string;
  status: TaskStatus;
  logs: TaskExecutionLogVO[];
  startedAt: string;
  retryCount: number;
  maxRetries: number;
  attemptStartedAt: string;
  source: TriggerSource;
  params: Record<string, unknown>;
}

/**
 * 取消失败的任务信息
 */
export interface FailedTaskVO {
  executionId: string;
  error: string;
}

/**
 * 通过 ID 取消任务的结果
 */
export interface CancelByIdsResultVO {
  cancelled: string[];
  notFound: string[];
  failed: FailedTaskVO[];
}

/**
 * 通过任务名称取消任务的结果
 */
export interface CancelByTaskNamesResultVO {
  cancelled: string[];
  taskNotFound: string[];
  failed: FailedTaskVO[];
}

/**
 * 取消所有任务的结果
 */
export interface CancelAllResultVO {
  count: number;
  cancelled: string[];
  failed: FailedTaskVO[];
}

/**
 * 任务运行统计（按任务名称分组）
 */
export interface TaskRunningStatVO {
  taskName: string;
  count: number;
}

/**
 * 所有正在运行的任务统计
 */
export interface AllRunningTasksStatsVO {
  total: number;
  stats: TaskRunningStatVO[];
}
