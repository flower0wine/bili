import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class TriggerVo {
  @ApiProperty({
    description: "触发器ID",
    example: 1
  })
  id!: number;

  @ApiProperty({
    description: "触发器名称",
    example: "daily-user-sync"
  })
  name!: string;

  @ApiProperty({
    description: "关联的任务名称",
    example: "user-space-sync"
  })
  taskName!: string;

  @ApiProperty({
    description: "Cron 表达式",
    example: "0 0 * * *"
  })
  cron!: string;

  @ApiPropertyOptional({
    description: "任务参数",
    example: { mid: 12345 }
  })
  params?: any;

  @ApiProperty({
    description: "是否启用",
    example: true
  })
  enabled!: boolean;

  @ApiPropertyOptional({
    description: "触发器描述",
    example: "每天凌晨同步用户空间数据"
  })
  description?: string;

  @ApiProperty({
    description: "配置来源",
    enum: ["database", "file"],
    example: "database"
  })
  source!: string;

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
