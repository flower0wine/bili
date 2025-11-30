/**
 * 用户空间类型定义 - 对应后端IUserSpace接口
 */

import type {
  BaseUserInfo,
  LiveRoomInfo,
  UserConfig
} from "./common";

/**
 * 用户空间信息 - 对应后端IUserSpace
 */
export interface UserSpaceVO extends BaseUserInfo, UserConfig {
  faceNft: number;
  birthday: string;

  // 社交状态
  fansBadge: boolean;
  isFollowed: boolean;
  topPhoto: string;

  // 扩展信息
  liveRoom: LiveRoomInfo;
  tags: string[];
  isSeniorMember: number;
}
