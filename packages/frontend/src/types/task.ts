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
