/**
 * 用户卡片类型定义 - 对应后端IUserCard接口
 */

import type {
  BaseUserInfo,
  UserConfig,
  UserStats
} from "./common";

/**
 * 用户卡片信息 - 对应后端IUserCard
 */
export interface UserCardVO extends BaseUserInfo, UserStats, UserConfig {
  // 社交信息
  following: boolean;
}

export interface UserFansFriendVo {
  /**
   * 粉丝数量
   */
  fans: number;

  /**
   * 关注数量
   */
  friend: number;

  /**
   * 记录时间
   */
  createdAt: string;
}
