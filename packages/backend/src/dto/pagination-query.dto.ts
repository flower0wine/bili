import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min
} from "class-validator";

/**
 * 分页查询参数DTO
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "页码必须是整数" })
  @Min(1, { message: "页码必须大于0" })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "每页数量必须是整数" })
  @Min(1, { message: "每页数量必须大于0" })
  @Max(100, { message: "每页数量不能超过100" })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: "排序参数必须是字符串" })
  @Matches(/^[a-zA-Z_]+:(asc|desc)$/, {
    message: "排序格式不正确，应为 '字段:asc' 或 '字段:desc'"
  })
  orderBy?: Record<string, "asc" | "desc">;
}
