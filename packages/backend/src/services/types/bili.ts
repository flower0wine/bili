/**
 * 认证信息类型
 */
export interface OfficialInfo {
  role: number; // 认证类型
  type: number; // 认证级别
  title: string; // 认证名称/职位
  desc?: string; // 认证描述
}

/**
 * 会员信息类型
 */
export interface VipInfo {
  type: number;
  status: number;
  due_date: number;
  vipStatus: number;
  vipStatusDue: number;
  theme_type: number;
  label: {
    path: string;
    text: string;
    label_theme: string;
  };
  avatar_subscript: number;
  nickname_color: string;
}

/**
 * 勋章信息类型
 */
export interface NameplateInfo {
  nid: number; // 勋章ID
  name: string; // 勋章名称
  level?: string; // 勋章等级
  condition?: string; // 获取条件
  image?: string; // 勋章图片
}

/**
 * 头像框信息类型
 */
export interface PendantInfo {
  pid: number;
  name: string;
  image: string;
  image_small: string;
  image_mid: string;
  image_large: string;
}

/**
 * 基础用户信息
 */
export interface BaseUserInfo {
  mid: number;
  name: string;
  sex: string;
  face: string;
  sign: string;
  level: number;
}

/**
 * 用户统计信息
 */
export interface UserStats {
  fans: number;
  friend: number;
  archiveCount: number;
  articleCount: number;
  likeNum: number;
}

/**
 * 用户配置信息
 */
export interface UserConfig {
  official: OfficialInfo;
  vip: VipInfo;
  pendant: PendantInfo;
  nameplate: NameplateInfo;
}

/**
 * 用户状态字段（不常变化）
 */
export interface UserProfileFields extends BaseUserInfo {
  birthday?: string;
  // 认证信息 - 使用文本描述
  officialVerify?: string; // 认证信息：如"官方认证 - 央视新闻官方账号"
  // 会员信息 - 使用文本描述
  vipInfo?: string; // 会员信息：如"年度大会员"
  // 勋章信息
  nameplateName?: string;
  nameplateLevel?: string;
  updatedAt: string;
}

export interface FaceMedal {
  show: boolean;
  wear: boolean;
}

export interface WatchedShow {
  num: number;
  icon: string;
  switch: boolean;
  icon_web: string;
  text_large: string;
  text_small: string;
  icon_location: string;
}

export interface LiveRoomInfo {
  url: string;
  cover: string;
  title: string;
  roomid: number;
  liveStatus: number;
  roomStatus: number;
  roundStatus: number;
  watched_show: WatchedShow;
  broadcast_type: number;
}

/**
 * 用户卡片信息
 */
export interface IUserCard extends BaseUserInfo, UserStats, UserConfig {
  // 社交信息
  following: boolean;
}

/**
 * 用户空间信息
 */
export interface IUserSpace extends BaseUserInfo, UserConfig {
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

/**
 * 完整用户数据（包含所有信息）
 */
export interface UserData extends BaseUserInfo, UserStats, UserConfig {
  faceNft: number;
  birthday: string;

  // 社交状态
  fansBadge: boolean;
  fansMedal: FaceMedal;
  isFollowed: boolean;
  following: boolean;
  topPhoto: string;

  // 扩展信息
  liveRoom: LiveRoomInfo;
  tags: string[];
  isSeniorMember: number;

  // 系统字段
  createdAt: string;
}
