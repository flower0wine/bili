import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";

/**
 * 分页查询参数DTO
 */
export class PaginationQueryDto {
  @ApiProperty({
    description: "页码，从1开始",
    example: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "页码必须是整数" })
  @Min(1, { message: "页码必须大于0" })
  page?: number = 1;

  @ApiProperty({
    description: "每页数量，默认10，最大100",
    example: 10,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "每页数量必须是整数" })
  @Min(1, { message: "每页数量必须大于0" })
  @Max(100, { message: "每页数量不能超过100" })
  limit?: number = 10;
}