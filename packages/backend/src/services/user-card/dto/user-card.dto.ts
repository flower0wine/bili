import { ApiProperty } from "@nestjs/swagger";

export class UserCardRequestDto {
  @ApiProperty({
    description: "用户ID",
    example: 2
  })
  mid!: number;

  @ApiProperty({
    description: "是否请求用户主页头图",
    example: true,
    required: false
  })
  photo?: boolean;
}
