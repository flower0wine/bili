import { IsNumber, IsOptional, IsString, IsNotEmpty, IsInt, Min, Max, MaxLength } from "class-validator";
import { Type } from "class-transformer";
import { PaginationQueryDto } from "@/dto/pagination-query.dto";

/**
 * 用户空间等级范围查询DTO
 */
export class UserSpaceLevelRangeQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "最小等级必须是整数" })
  @Min(0, { message: "最小等级不能小于0" })
  @Max(60, { message: "最小等级不能大于60" })
  minLevel?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "最大等级必须是整数" })
  @Min(0, { message: "最大等级不能小于0" })
  @Max(60, { message: "最大等级不能大于60" })
  maxLevel?: number;
}

/**
 * 用户空间搜索查询DTO
 */
export class UserSpaceSearchQueryDto extends PaginationQueryDto {
  @IsString({ message: "搜索关键词必须是字符串" })
  @IsNotEmpty({ message: "搜索关键词不能为空" })
  @MaxLength(100, { message: "搜索关键词长度不能超过100个字符" })
  keyword!: string;
}

/**
 * 用户空间统计查询DTO
 */
export class UserSpaceStatsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "用户ID必须是数字" })
  @Min(1, { message: "用户ID必须大于0" })
  mid?: number;
}

