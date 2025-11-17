import { IsNumber, IsString, IsNotEmpty, Min, MaxLength, Matches, IsOptional } from "class-validator";

/**
 * 用户空间任务参数
 */
export class UserSpaceTaskParams {
  @IsNumber({}, { message: "用户ID必须是数字" })
  @IsNotEmpty({ message: "用户ID不能为空" })
  mid!: number;

  @IsString({ message: "Cookie必须是字符串" })
  @IsNotEmpty({ message: "Cookie不能为空" })
  cookie!: string;
}