import { IsNumber, IsNotEmpty, Min } from "class-validator";
import { Type } from "class-transformer";

/**
 * 用户ID路径参数DTO
 */
export class UserIdParamDto {
  @IsNotEmpty({ message: "用户ID不能为空" })
  @Type(() => Number)
  @IsNumber({}, { message: "用户ID必须是数字" })
  @Min(1, { message: "用户ID必须大于0" })
  mid!: number;
}