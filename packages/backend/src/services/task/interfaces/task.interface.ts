/**
 * 任务触发来源类型
 */
export enum TaskSource {
  CRON = "cron",
  MANUAL = "manual",
  EVENT = "event",
  API = "api"
}

/**
 * 任务执行状态
 */
// export type TaskExecutionStatus =
//   | "running"
//   | "completed"
//   | "failed"
//   | "cancelled";

export enum TaskExecutionStatus {
  RUNNING = "running",
  SUCCESS = "success",
  FAILED = "failed",
  CANCELED = "cancelled"
}

export enum TaskExecutionLevel {
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  DEBUG = "debug"
}

/**
 * 任务执行日志条目
 */
export interface TaskExecutionLog {
  timestamp: Date;
  level: TaskExecutionLevel;
  message: string;
  data?: any;
}

/**
 * 任务执行上下文
 */
export interface TaskContext {
  /**
   * 任务名称
   */
  taskName: string;

  /**
   * 任务参数
   */
  params?: any;

  /**
   * 触发来源（cron、manual、event 等）
   */
  source: TaskSource;

  /**
   * 执行 ID（用于追踪）
   */
  executionId: string;

  /**
   * 触发时间
   */
  triggeredAt: Date;

  /**
   * 触发器名称（如果是通过触发器触发）
   */
  triggerName?: string;

  /**
   * 当前重试次数
   */
  retryCount: number;

  /**
   * 最大重试次数
   */
  maxRetries: number;

  /**
   * 整个任务生命周期开始时间（不变）
   */
  startedAt: Date;

  /**
   * 当前尝试开始时间（重试时更新）
   */
  attemptStartedAt: Date;

  /**
   * 取消信号（支持外部取消任务）
   */
  signal?: AbortSignal;

  /**
   * 当前执行状态
   */
  status: TaskExecutionStatus;

  /**
   * 执行日志
   */
  logs: TaskExecutionLog[];

  /**
   * 执行结果
   */
  result?: TaskResult<any>;
}

/**
 * 任务执行结果
 */
export interface TaskResult<D> {
  /**
   * 执行 ID
   */
  executionId: string;

  /**
   * 是否成功
   */
  success: boolean;

  /**
   * 返回数据
   */
  data?: D;

  /**
   * 错误信息
   */
  error?: string;

  /**
   * 执行开始时间
   */
  startedAt: Date;

  /**
   * 执行结束时间
   */
  finishedAt: Date;

  /**
   * 执行耗时（毫秒）
   */
  duration: number;

  /**
   * 重试次数
   */
  retryCount: number;

  /**
   * 是否被取消
   */
  cancelled?: boolean;
}

/**
 * 任务处理器函数类型
 */
export type TaskHandler<P, D> = (
  params?: P,
  signal?: AbortSignal
) => Promise<D>;

/**
 * 任务配置选项（在 TaskDefinition 中使用）
 */
export interface TaskExecutionOptions {
  /**
   * 超时时间（毫秒）
   */
  timeout?: number;

  /**
   * 重试次数
   */
  retries?: number;
}

/**
 * 任务定义
 */
export interface TaskDefinition<P, D> {
  /**
   * 任务名称
   */
  name: string;

  /**
   * 任务描述
   */
  description?: string;

  /**
   * 任务执行器（实际的方法）
   */
  handler: TaskHandler<P, D>;

  /**
   * 任务所属的服务实例
   */
  instance: object | null;

  /**
   * 任务选项
   */
  options: TaskExecutionOptions;
}

/**
 * 任务被取消错误
 */
export class TaskCancelledError extends Error {
  constructor(taskName: string, executionId: string) {
    super(`Task ${taskName} [${executionId}] was cancelled`);
    this.name = "TaskCancelledError";
  }
}

/**
 * 任务超时错误
 */
export class TaskTimeoutError extends Error {
  constructor(taskName: string, executionId: string, timeout: number) {
    super(`Task ${taskName} [${executionId}] timed out after ${timeout}ms`);
    this.name = "TaskTimeoutError";
  }
}
