/**
 * 用户粉丝关注历史数据VO
 */
export class UserFansFriendVo {
  /**
   * 粉丝数量
   */
  fans!: number;

  /**
   * 关注数量
   */
  friend!: number;

  /**
   * 记录时间
   */
  createdAt!: string;
}
