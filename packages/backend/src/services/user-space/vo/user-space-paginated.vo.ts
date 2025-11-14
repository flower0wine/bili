import { ApiProperty } from "@nestjs/swagger";
import { UserSpaceResponseVo } from "./user-space.vo";

export class UserSpacePaginatedResponseVo {
  @ApiProperty({
    description: "用户空间数据列表",
    type: [UserSpaceResponseVo]
  })
  items!: UserSpaceResponseVo[];

  @ApiProperty({
    description: "总记录数",
    example: 1000
  })
  total!: number;

  @ApiProperty({
    description: "总页数",
    example: 50
  })
  totalPages!: number;

  @ApiProperty({
    description: "当前页码",
    example: 1
  })
  page!: number;

  @ApiProperty({
    description: "每页数量",
    example: 20
  })
  limit!: number;
}