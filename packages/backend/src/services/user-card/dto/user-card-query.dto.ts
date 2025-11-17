import { Type } from "class-transformer";
import { IsInt, IsNumber, IsOptional, Max, Min } from "class-validator";
import { PaginationQueryDto } from "@/dto/pagination-query.dto";

/**
 * 用户名片粉丝数范围查询DTO
 */
export class UserCardFansRangeQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "最小粉丝数必须是整数" })
  @Min(0, { message: "最小粉丝数不能小于0" })
  minFans?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "最大粉丝数必须是整数" })
  @Min(0, { message: "最大粉丝数不能小于0" })
  maxFans?: number;
}

/**
 * 用户名片统计查询DTO
 */
export class UserCardStatsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "用户ID必须是数字" })
  @Min(1, { message: "用户ID必须大于0" })
  mid?: number;
}
