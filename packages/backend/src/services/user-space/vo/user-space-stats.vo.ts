import { ApiProperty } from "@nestjs/swagger";

export class UserSpaceStatsVo {
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

  @ApiProperty({
    description: "等级分布",
    example: {
      "0": 10,
      "1": 15,
      "2": 20,
      "3": 25,
      "4": 30,
      "5": 35,
      "6": 40
    }
  })
  levelDistribution!: Record<number, number>;
}