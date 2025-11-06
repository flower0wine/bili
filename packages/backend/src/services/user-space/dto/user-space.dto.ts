import { ApiProperty } from "@nestjs/swagger";

export class UserSpaceRequestDto {
  @ApiProperty({
    description: "用户ID",
    example: 2
  })
  mid!: number;
}
