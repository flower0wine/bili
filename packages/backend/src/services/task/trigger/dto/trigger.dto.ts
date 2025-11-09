import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTriggerDto {
  @ApiProperty({
    description: "触发器名称（唯一标识）",
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
    description: "任务参数（JSON 格式）",
    example: { mid: 12345 }
  })
  params?: any;

  @ApiPropertyOptional({
    description: "触发器描述",
    example: "每天凌晨同步用户空间数据"
  })
  description?: string;

  @ApiPropertyOptional({
    description: "是否启用",
    example: true,
    default: true
  })
  enabled?: boolean;
}

export class UpdateTriggerDto {
  @ApiPropertyOptional({
    description: "Cron 表达式",
    example: "0 2 * * *"
  })
  cron?: string;

  @ApiPropertyOptional({
    description: "任务参数（JSON 格式）",
    example: { mid: 12345 }
  })
  params?: any;

  @ApiPropertyOptional({
    description: "是否启用",
    example: false
  })
  enabled?: boolean;

  @ApiPropertyOptional({
    description: "触发器描述",
    example: "每天凌晨2点同步用户空间数据"
  })
  description?: string;
}
