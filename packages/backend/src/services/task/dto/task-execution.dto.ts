import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class TaskExecutionQueryDto {
  @ApiPropertyOptional({
    description: "任务名称过滤",
    example: "user-space-sync"
  })
  taskName?: string;

  @ApiPropertyOptional({
    description: "执行状态过滤",
    enum: ["running", "success", "failed", "cancelled"],
    example: "success"
  })
  status?: string;

  @ApiPropertyOptional({
    description: "触发源过滤",
    enum: ["cron", "api", "manual"],
    example: "cron"
  })
  triggerSource?: string;

  @ApiPropertyOptional({
    description: "触发器名称过滤",
    example: "daily-sync"
  })
  triggerName?: string;

  @ApiPropertyOptional({
    description: "开始时间（ISO 8601 格式）",
    example: "2025-11-08T00:00:00Z"
  })
  startDate?: string;

  @ApiPropertyOptional({
    description: "结束时间（ISO 8601 格式）",
    example: "2025-11-09T23:59:59Z"
  })
  endDate?: string;

  @ApiPropertyOptional({
    description: "页码（从1开始）",
    example: 1,
    default: 1
  })
  page?: number;

  @ApiPropertyOptional({
    description: "每页数量",
    example: 20,
    default: 20
  })
  pageSize?: number;
}

export class ExecuteTaskDto {
  @ApiPropertyOptional({
    description: "任务参数（JSON 格式）",
    example: { mid: 12345 }
  })
  params?: any;
}
