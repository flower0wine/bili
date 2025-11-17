/**
 * 认证信息类型
 */
export interface OfficialInfo {
  role: number; // 认证类型: 0-个人 1-机构 5-官方 7-企业
  type: number; // 认证级别
  title: string; // 认证名称/职位
  desc?: string; // 认证描述
}

/**
 * 会员信息类型
 */
export interface VipInfo {
  type: number; // 会员类型: 0-非会员 1-月度 2-年度
  status: number; // 会员状态: 0-非会员 1-有效会员
  due_date?: number; // 到期时间(毫秒)
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
  expire?: number; // 过期时间
}

/**
 * 用户状态字段（不常变化）
 */
export interface UserProfileFields {
  mid: number;
  name: string;
  sex: string;
  face: string;
  sign: string;
  level: number;
  birthday?: string;
  // 认证信息 - 使用文本描述
  officialVerify?: string; // 认证信息：如"官方认证 - 央视新闻官方账号"
  // 会员信息 - 使用文本描述
  vipInfo?: string; // 会员信息：如"年度大会员"
  // 勋章信息
  nameplateName?: string;
  nameplateLevel?: string;
  updatedAt: number;
}

/**
 * 用户统计字段（经常变化）
 */
export interface UserStatsFields {
  mid: number;
  fans: number;
  friend: number;
  archiveCount: number;
  articleCount: number;
  likeNum: number;
  isFollowed: boolean;
  following: boolean;
  recordTime: number;
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

export interface IUserCard {
  mid: number;
  name: string;
  sex: string;
  face: string;
  sign: string;
  level: number;

  // 统计信息
  fans: number;
  friend: number;
  archiveCount: number;
  articleCount: number;
  likeNum: number;

  // 认证与会员信息
  official: OfficialInfo;
  vip: VipInfo;
  pendant: PendantInfo;
  nameplate: NameplateInfo;

  // 社交信息
  following: boolean;
}

export interface IUserSpace {
  mid: number;
  name: string;
  sex: string;
  face: string;
  faceNft: number;
  sign: string;
  level: number;
  birthday: string;

  official: OfficialInfo;
  vip: VipInfo;
  pendant: PendantInfo;
  nameplate: NameplateInfo;

  fansBadge: boolean;
  isFollowed: boolean;
  topPhoto: string;

  liveRoom: LiveRoomInfo;
  tags: string[];
  isSeniorMember: number;
}

export interface UserData {
  name: string;
  mid: number;
  sex: string;
  face: string;
  faceNft: number;
  sign: string;
  level: number;
  birthday: string;
  official: OfficialInfo;
  vip: VipInfo;
  pendant: PendantInfo;
  nameplate: NameplateInfo;
  fansBadge: boolean;
  fansMedal: FaceMedal;
  isFollowed: boolean;
  topPhoto: string;
  liveRoom: LiveRoomInfo;
  tags: any;
  sysNotice: any;
  isSeniorMember: number;
  createdAt: Date;

  fans: number;
  friend: number;
  archiveCount: number;
  articleCount: number;
  likeNum: number;
  following: boolean;
}
