import { IsNotEmpty, IsNumber } from "class-validator";

export class UserSpaceRequestDto {
  @IsNumber({}, { message: "用户ID必须是数字" })
  @IsNotEmpty({ message: "用户ID不能为空" })
  mid!: number;
}
