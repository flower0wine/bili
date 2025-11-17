export class TaskExecutionVo {
  id!: string;
  taskName!: string;
  triggerSource!: string;
  triggerName?: string;
  params?: any;
  status!: string;
  result?: any;
  error?: string;
  retryCount!: number;
  maxRetries!: number;
  startedAt!: Date;
  finishedAt?: Date;
  duration?: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class TaskExecutionListVo {
  data!: TaskExecutionVo[];
  total!: number;
  page!: number;
  pageSize!: number;
  totalPages!: number;
}

export class TaskInfoVo {
  name!: string;
  description?: string;
  options!: object;
}

export class ExecuteTaskResultVo {
  executionId!: string;
  success!: boolean;
  data?: any;
  error?: string;
  startedAt!: Date;
  finishedAt!: Date;
  duration!: number;
  retryCount!: number;
  cancelled?: boolean;
}