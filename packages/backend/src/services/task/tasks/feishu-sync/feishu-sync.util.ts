import dayjs from "dayjs";
import { TaskCancelledError } from "@/services/task/interfaces/task.interface";
import {
  NameplateInfo,
  OfficialInfo,
  UserProfileFields,
  VipInfo
} from "@/services/task/tasks/feishu-sync/feishu-sync.type";

/**
 * 获取用户数据（合并UserSpaceData和UserCard）
 */
export async function getUsersData(mids?: number[]) {
  const whereClause = mids && mids.length > 0 ? { mid: { in: mids } } : {};

  const [spaceData, cardData] = await Promise.all([
    this.prisma.userSpaceData.findMany({ where: whereClause }),
    this.prisma.userCard.findMany({ where: whereClause })
  ]);

  // 合并数据
  const userMap = new Map<string, any>();

  spaceData.forEach((space) => {
    userMap.set(space.mid, {
      mid: space.mid,
      name: space.name,
      sex: space.sex,
      face: space.face,
      sign: space.sign,
      level: space.level,
      birthday: space.birthday,
      official: space.official,
      vip: space.vip,
      pendant: space.pendant,
      nameplate: space.nameplate,
      isFollowed: space.isFollowed,
      spaceUpdatedAt: space.updatedAt
    });
  });

  cardData.forEach((card) => {
    const existing = userMap.get(card.mid) || {};
    userMap.set(card.mid, {
      ...existing,
      mid: card.mid,
      name: card.name || existing.name,
      sex: card.sex || existing.sex,
      face: card.face || existing.face,
      sign: card.sign || existing.sign,
      level: card.level || existing.level,
      fans: card.fans,
      friend: card.friend,
      archiveCount: card.archiveCount,
      articleCount: card.articleCount,
      likeNum: card.likeNum,
      following: card.following,
      cardUpdatedAt: card.updatedAt
    });
  });

  return Array.from(userMap.values());
}

/**
 * 同步单个用户的数据
 */
export async function syncUserData(
  user: any,
  biliFolderToken: string,
  signal?: AbortSignal
) {
  // 1. 确保用户子文件夹存在
  const userFolderToken = await this.feishuService.ensureFolder(
    user.name,
    biliFolderToken
  );
  this.logger.log(`用户文件夹 ${user.name} Token: ${userFolderToken}`);

  if (signal?.aborted) {
    throw new TaskCancelledError("feishu-bitable-sync", "unknown");
  }

  // 2. 确保多维表格存在
  const bitableToken = await this.feishuService.ensureBitable(
    `${user.name}的数据`,
    userFolderToken
  );
  this.logger.log(`多维表格Token: ${bitableToken}`);

  if (signal?.aborted) {
    throw new TaskCancelledError("feishu-bitable-sync", "unknown");
  }

  // 3. 确保用户状态表存在
  const profileTableId = await this.feishuService.ensureTable(
    bitableToken,
    "用户状态",
    getProfileTableFields()
  );

  // 4. 确保用户统计表存在
  const statsTableId = await this.feishuService.ensureTable(
    bitableToken,
    "用户统计",
    getStatsTableFields()
  );

  if (signal?.aborted) {
    throw new TaskCancelledError("feishu-bitable-sync", "unknown");
  }

  // 5. 同步用户状态数据（需要对比最新记录）
  await syncProfileData.call(this, bitableToken, profileTableId, user);

  // 6. 同步用户统计数据（直接插入）
  await syncStatsData.call(this, bitableToken, statsTableId, user);

  this.logger.log(`成功同步用户 ${user.name}(${user.mid}) 的数据`);
}

/**
 * 同步用户状态数据（对比后决定是否插入）
 */
export async function syncProfileData(
  appToken: string,
  tableId: string,
  user: any
) {
  // 获取最新的一条记录
  const latestRecords = await this.feishuService.getRecords(
    appToken,
    tableId,
    1,
    [{ field_name: "更新时间", desc: true }]
  );

  // 提取认证信息重要字段
  const official = user.official as OfficialInfo | null;
  const vip = user.vip as VipInfo | null;
  const nameplate = user.nameplate as NameplateInfo | null;

  // 转换认证信息为文本描述
  const officialVerify = formatOfficialInfo.call(this, official);
  // 转换会员信息为文本描述
  const vipInfo = formatVipInfo.call(this, vip);

  const newProfile: UserProfileFields = {
    mid: user.mid,
    name: user.name,
    sex: user.sex,
    face: user.face,
    sign: user.sign,
    level: user.level,
    birthday: user.birthday || "",
    officialVerify,
    vipInfo,
    nameplateName: nameplate?.name || "",
    nameplateLevel: nameplate?.level || "",
    updatedAt: dayjs().valueOf() // 使用dayjs获取毫秒级时间戳
  };

  // 如果没有记录或数据有变化，则插入新记录
  if (
    latestRecords.length === 0 ||
    hasProfileChanged.call(this, latestRecords[0].fields, newProfile)
  ) {
    await this.feishuService.addRecord(appToken, tableId, {
      用户ID: user.mid,
      用户名: user.name,
      性别: user.sex,
      头像: {
        link: user.face,
        text: user.name
      },
      签名: user.sign,
      等级: user.level,
      生日: user.birthday || "",
      认证信息: officialVerify,
      会员信息: vipInfo,
      勋章名称: nameplate?.name || "",
      勋章等级: nameplate?.level || "",
      更新时间: dayjs().valueOf()
    });
    this.logger.log(`插入用户状态记录: ${user.name}`);
  } else {
    this.logger.log(`用户状态无变化，跳过插入: ${user.name}`);
  }
}

/**
 * 同步用户统计数据（直接插入）
 */
export async function syncStatsData(
  appToken: string,
  tableId: string,
  user: any
) {
  await this.feishuService.addRecord(appToken, tableId, {
    用户ID: user.mid,
    粉丝数: user.fans || 0,
    关注数: user.friend || 0,
    稿件数: user.archiveCount || 0,
    专栏数: user.articleCount || 0,
    点赞数: user.likeNum || 0,
    被关注: user.isFollowed || false,
    已关注: user.following || false,
    记录时间: dayjs().valueOf() // 使用dayjs获取毫秒级时间戳
  });

  this.logger.log(`插入用户统计记录: ${user.name}`);
}

/**
 * 格式化认证信息为文本描述
 */
export function formatOfficialInfo(official: OfficialInfo | null): string {
  if (!official || !official.title) {
    return "未认证";
  }

  const roleMap: Record<number, string> = {
    0: "个人认证",
    1: "机构认证",
    5: "官方认证",
    7: "企业认证"
  };

  const roleText = roleMap[official.role] || "认证";
  return `${roleText} - ${official.title}`;
}

/**
 * 格式化会员信息为文本描述
 */
export function formatVipInfo(vip: VipInfo | null): string {
  if (!vip || vip.status === 0) {
    return "非会员";
  }

  // 优先使用label.text，如果没有则根据type生成
  if (vip.label?.text) {
    return vip.label.text;
  }

  const typeMap: Record<number, string> = {
    0: "非会员",
    1: "月度大会员",
    2: "年度大会员"
  };

  return typeMap[vip.type] || "会员";
}

/**
 * 判断用户状态是否有变化
 * 只比较重要字段：用户名、性别、签名、等级、认证信息、会员信息、勋章
 */
export function hasProfileChanged(
  oldFields: any,
  newProfile: UserProfileFields
): boolean {
  // 重要字段对比
  const importantFields: Array<{
    fieldName: string;
    oldValue: any;
    newValue: any;
  }> = [
    {
      fieldName: "用户名",
      oldValue: oldFields["用户名"],
      newValue: newProfile.name
    },
    {
      fieldName: "性别",
      oldValue: oldFields["性别"],
      newValue: newProfile.sex
    },
    {
      fieldName: "签名",
      oldValue: oldFields["签名"],
      newValue: newProfile.sign
    },
    {
      fieldName: "等级",
      oldValue: oldFields["等级"],
      newValue: newProfile.level
    },
    {
      fieldName: "生日",
      oldValue: oldFields["生日"],
      newValue: newProfile.birthday
    },
    // 认证信息
    {
      fieldName: "认证信息",
      oldValue: oldFields["认证信息"],
      newValue: newProfile.officialVerify
    },
    // 会员信息
    {
      fieldName: "会员信息",
      oldValue: oldFields["会员信息"],
      newValue: newProfile.vipInfo
    },
    // 勋章信息
    {
      fieldName: "勋章名称",
      oldValue: oldFields["勋章名称"],
      newValue: newProfile.nameplateName
    }
  ];

  for (const field of importantFields) {
    if (field.oldValue !== field.newValue) {
      this.logger.debug(
        `字段变化: ${field.fieldName}, 旧值: ${field.oldValue}, 新值: ${field.newValue}`
      );
      return true;
    }
  }

  return false;
}

/**
 * 获取用户状态表字段定义
 */
export function getProfileTableFields() {
  return [
    { field_name: "用户ID", type: 2 }, // 数字
    { field_name: "用户名", type: 1 }, // 文本
    { field_name: "性别", type: 1 }, // 文本
    { field_name: "头像", type: 15 }, // URL
    { field_name: "签名", type: 1 }, // 文本
    { field_name: "等级", type: 2 }, // 数字
    { field_name: "生日", type: 1 }, // 文本
    { field_name: "认证信息", type: 1 }, // 文本：如"官方认证 - 央视新闻官方账号"
    { field_name: "会员信息", type: 1 }, // 文本：如"年度大会员"
    { field_name: "勋章名称", type: 1 }, // 文本
    { field_name: "勋章等级", type: 1 }, // 文本
    { field_name: "更新时间", type: 5 } // 日期
  ];
}

/**
 * 获取用户统计表字段定义
 */
export function getStatsTableFields() {
  return [
    { field_name: "用户ID", type: 2 },
    { field_name: "粉丝数", type: 2 },
    { field_name: "关注数", type: 2 },
    { field_name: "稿件数", type: 2 },
    { field_name: "专栏数", type: 2 },
    { field_name: "点赞数", type: 2 },
    { field_name: "被关注", type: 7 }, // 复选框
    { field_name: "已关注", type: 7 },
    { field_name: "记录时间", type: 5 }
  ];
}
