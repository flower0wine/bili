/**
 * 任务参数类型
 */
export interface SyncParams {
  mids?: number[]; // 指定同步的用户ID列表
}

/**
 * 任务返回结果类型
 */
export interface SyncResult {
  total: number;
  success: number;
  failed: number;
  results: Array<{
    mid: number;
    name: string;
    success: boolean;
    error?: string;
  }>;
}

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
