import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 用户名片任务参数
 */
export class UserCardTaskParams {
  @ApiProperty({
    description: "用户ID",
    example: 2,
    type: "number"
  })
  @IsNumber({}, { message: "用户ID必须是数字" })
  @IsNotEmpty({ message: "用户ID不能为空" })
  mid!: number;

  @ApiProperty({
    description: "是否请求用户主页头图",
    example: true,
    required: false,
    type: "boolean"
  })
  @IsBoolean({ message: "photo参数必须是布尔值" })
  @IsOptional()
  photo?: boolean;

  @ApiProperty({
    description: "Bilibili Cookie",
    example: "SESSDATA=xxx; bili_jct=xxx;",
    type: "string"
  })
  @IsString({ message: "Cookie必须是字符串" })
  @IsNotEmpty({ message: "Cookie不能为空" })
  cookie!: string;
}
