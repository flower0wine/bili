import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class TaskExecutionVo {
  @ApiProperty({
    description: "执行记录ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id!: string;

  @ApiProperty({
    description: "任务名称",
    example: "user-space-sync"
  })
  taskName!: string;

  @ApiProperty({
    description: "触发源",
    enum: ["cron", "api", "manual"],
    example: "cron"
  })
  triggerSource!: string;

  @ApiPropertyOptional({
    description: "触发器名称",
    example: "daily-sync"
  })
  triggerName?: string;

  @ApiPropertyOptional({
    description: "任务参数",
    example: { mid: 12345 }
  })
  params?: any;

  @ApiProperty({
    description: "执行状态",
    enum: ["running", "success", "failed", "cancelled"],
    example: "success"
  })
  status!: string;

  @ApiPropertyOptional({
    description: "执行结果",
    example: { processed: 100 }
  })
  result?: any;

  @ApiPropertyOptional({
    description: "错误信息",
    example: "Task execution timeout"
  })
  error?: string;

  @ApiProperty({
    description: "重试次数",
    example: 0
  })
  retryCount!: number;

  @ApiProperty({
    description: "最大重试次数",
    example: 3
  })
  maxRetries!: number;

  @ApiProperty({
    description: "开始时间",
    example: "2025-11-09T10:00:00Z"
  })
  startedAt!: Date;

  @ApiPropertyOptional({
    description: "结束时间",
    example: "2025-11-09T10:05:30Z"
  })
  finishedAt?: Date;

  @ApiPropertyOptional({
    description: "执行时长（毫秒）",
    example: 330000
  })
  duration?: number;

  @ApiProperty({
    description: "创建时间",
    example: "2025-11-09T10:00:00Z"
  })
  createdAt!: Date;

  @ApiProperty({
    description: "更新时间",
    example: "2025-11-09T10:05:30Z"
  })
  updatedAt!: Date;
}

export class TaskExecutionListVo {
  @ApiProperty({
    description: "执行记录列表",
    type: [TaskExecutionVo]
  })
  data!: TaskExecutionVo[];

  @ApiProperty({
    description: "总记录数",
    example: 150
  })
  total!: number;

  @ApiProperty({
    description: "当前页码",
    example: 1
  })
  page!: number;

  @ApiProperty({
    description: "每页数量",
    example: 20
  })
  pageSize!: number;

  @ApiProperty({
    description: "总页数",
    example: 8
  })
  totalPages!: number;
}

export class TaskInfoVo {
  @ApiProperty({
    description: "任务名称",
    example: "user-space-sync"
  })
  name!: string;

  @ApiPropertyOptional({
    description: "任务描述",
    example: "同步用户空间数据到数据库"
  })
  description?: string;

  @ApiProperty({
    description: "任务配置选项",
    example: { retries: 3, timeout: 300000 }
  })
  options!: object;
}

export class ExecuteTaskResultVo {
  @ApiProperty({
    description: "执行ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  executionId!: string;

  @ApiProperty({
    description: "执行是否成功",
    example: true
  })
  success!: boolean;

  @ApiPropertyOptional({
    description: "执行结果数据",
    example: { processed: 100 }
  })
  data?: any;

  @ApiPropertyOptional({
    description: "错误信息",
    example: "Task execution failed"
  })
  error?: string;

  @ApiProperty({
    description: "开始时间",
    example: "2025-11-09T10:00:00Z"
  })
  startedAt!: Date;

  @ApiProperty({
    description: "结束时间",
    example: "2025-11-09T10:05:30Z"
  })
  finishedAt!: Date;

  @ApiProperty({
    description: "执行时长（毫秒）",
    example: 330000
  })
  duration!: number;

  @ApiProperty({
    description: "重试次数",
    example: 0
  })
  retryCount!: number;

  @ApiPropertyOptional({
    description: "是否被取消",
    example: false
  })
  cancelled?: boolean;
}
