import { ApiProperty } from "@nestjs/swagger";

export class UserCardStatsVo {
  @ApiProperty({
    description: "总记录数",
    example: 1500
  })
  totalRecords!: number;

  @ApiProperty({
    description: "唯一用户数",
    example: 50
  })
  uniqueUsers!: number;

  @ApiProperty({
    description: "最新记录时间",
    example: "2024-01-15T10:30:00.000Z"
  })
  latestRecord!: string | null;
}