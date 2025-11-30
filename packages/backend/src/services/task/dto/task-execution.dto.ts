import { IsDateString, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "@/dto/pagination-query.dto";

export class TaskExecutionQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString({ message: "任务名称必须是字符串" })
  taskName?: string;

  @IsOptional()
  @IsString({ message: "执行状态必须是字符串" })
  status?: string;

  @IsOptional()
  @IsString({ message: "触发来源必须是字符串" })
  triggerSource?: string;

  @IsOptional()
  @IsString({ message: "触发器名称必须是字符串" })
  triggerName?: string;

  @IsOptional()
  @IsDateString({}, { message: "开始日期格式不正确" })
  startedAt?: string;

  @IsOptional()
  @IsDateString({}, { message: "结束日期格式不正确" })
  finishedAt?: string;
}

export class ExecuteTaskDto {
  @IsOptional()
  params?: any;
}
