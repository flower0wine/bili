import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class UserCardRequestDto {
  @IsNumber({}, { message: "用户ID必须是数字" })
  @IsNotEmpty({ message: "用户ID不能为空" })
  mid!: number;

  @IsBoolean({ message: "photo参数必须是布尔值" })
  @IsOptional()
  photo?: boolean;
}