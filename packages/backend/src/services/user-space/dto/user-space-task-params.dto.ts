import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsNotEmpty, Min, MaxLength, Matches, IsOptional } from "class-validator";

/**
 * 用户空间任务参数
 */
export class UserSpaceTaskParams {
  @ApiProperty({
    description: "用户ID",
    example: 2,
    type: "number"
  })
  @IsNumber({}, { message: "用户ID必须是数字" })
  @IsNotEmpty({ message: "用户ID不能为空" })
  mid!: number;

  @ApiProperty({
    description: "Bilibili Cookie",
    example: "SESSDATA=xxx; bili_jct=xxx;",
    type: "string"
  })
  @IsString({ message: "Cookie必须是字符串" })
  @IsNotEmpty({ message: "Cookie不能为空" })
  cookie!: string;
}