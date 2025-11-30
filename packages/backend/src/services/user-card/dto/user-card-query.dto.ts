import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional, Min } from "class-validator";
import { PaginationQueryDto } from "@/dto/pagination-query.dto";

/**
 * 用户名片查询DTO
 */
export class UserCardQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "用户ID必须是数字" })
  @Min(1, { message: "用户ID必须大于0" })
  mid?: number;
}

/**
 * 用户粉丝关注历史查询DTO
 */
export class UserFansFriendQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "用户ID必须是数字" })
  @Min(1, { message: "用户ID必须大于0" })
  mid?: number;

  @IsOptional()
  @IsDateString({}, { message: "开始日期格式不正确" })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: "结束日期格式不正确" })
  endDate?: string;
}
