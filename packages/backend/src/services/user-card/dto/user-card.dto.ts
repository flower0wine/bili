import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UserCardRequestDto {
  @ApiProperty({
    description: "用户ID",
    example: 2
  })
  @IsNumber({}, { message: "用户ID必须是数字" })
  @IsNotEmpty({ message: "用户ID不能为空" })
  mid!: number;

  @ApiProperty({
    description: "是否请求用户主页头图",
    example: true,
    required: false
  })
  @IsBoolean({ message: "photo参数必须是布尔值" })
  @IsOptional()
  photo?: boolean;
}
