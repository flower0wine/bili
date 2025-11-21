declare namespace Task {
  export interface TaskVO {
    name: string;
    description: string;
    options: Record<string, unknown>;
  }

  export interface ExecuteTaskDTO {
    params?: Record<string, unknown>;
  }

  export interface ExecuteTaskVO {
    taskId: string;
    status: "running" | "completed" | "failed" | "cancelled";
    startTime: string;
    endTime?: string;
    duration?: number;
    result?: unknown;
    error?: string;
  }

  export interface TaskExecutionVO {
    id: string;
    taskName: string;
    status: "running" | "completed" | "failed" | "cancelled";
    triggerSource: "manual" | "cron" | "api";
    startTime: string;
    endTime?: string;
    duration?: number;
    result?: unknown;
    error?: string;
    params: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  }

  export interface TaskExecutionQueryDTO {
    taskName?: string;
    status?: "running" | "completed" | "failed" | "cancelled";
    triggerSource?: "manual" | "cron" | "api";
    startTime?: string;
    endTime?: string;
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
}
