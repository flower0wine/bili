export class TaskExecutionQueryDto {
  taskName?: string;
  status?: string;
  triggerSource?: string;
  triggerName?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export class ExecuteTaskDto {
  params?: any;
}
