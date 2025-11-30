export class UserSpaceStatsVo {
  totalRecords!: number;
  uniqueUsers!: number;
  latestRecord!: string | null;
  levelDistribution!: Record<number, number>;
}
