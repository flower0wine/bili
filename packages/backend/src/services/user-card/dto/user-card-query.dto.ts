import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { PaginationQueryDto } from "@/dto/pagination-query.dto";

/**
 * 用户名片粉丝数范围查询DTO
 */
export class UserCardFansRangeQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: "最小粉丝数",
    example: 10000,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "最小粉丝数必须是整数" })
  @Min(0, { message: "最小粉丝数不能小于0" })
  minFans?: number;

  @ApiProperty({
    description: "最大粉丝数",
    example: 1000000,
    required: false
  })
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
  @ApiProperty({
    description: "用户ID（可选，不提供则返回全局统计）",
    example: 2,
    required: false,
    type: "number"
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "用户ID必须是数字" })
  @Min(1, { message: "用户ID必须大于0" })
  mid?: number;
}