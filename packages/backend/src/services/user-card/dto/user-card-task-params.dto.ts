import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from "class-validator";

/**
 * 用户名片任务参数
 */
export class UserCardTaskParams {
  @IsNumber({}, { message: "用户ID必须是数字" })
  @IsNotEmpty({ message: "用户ID不能为空" })
  mid!: number;

  @IsBoolean({ message: "photo参数必须是布尔值" })
  @IsOptional()
  photo?: boolean;

  @IsString({ message: "Cookie必须是字符串" })
  @IsNotEmpty({ message: "Cookie不能为空" })
  cookie!: string;
}