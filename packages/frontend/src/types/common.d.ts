
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
  type: number; // 会员类型
  status: number; // 会员状态
  due_date?: string; // 到期时间
  label?: {
    text: string; // 会员标签文本
    bg_color?: string;
    text_color?: string;
  };
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
  pid: number; // 头像框ID
  name: string; // 头像框名称
  image?: string;
  expire?: string; // 过期时间
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
 * 脸部勋章信息
 */
export interface FaceMedal {
  show: boolean;
  wear: boolean;
}

/**
 * 观看显示信息
 */
export interface WatchedShow {
  num: number;
  icon: string;
  switch: boolean;
  icon_web: string;
  text_large: string;
  text_small: string;
  icon_location: string;
}

/**
 * 直播间信息
 */
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
 * 完整用户数据（包含所有信息）- 对应后端UserData
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