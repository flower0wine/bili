import dayjs from "dayjs";
import { Logger } from "nestjs-pino";
import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "@/services/common/prisma.service";
import { FeishuSyncService } from "@/services/feishu-sync/feishu-sync.service";
import { Task } from "@/services/task/decorators/task.decorator";
import { TaskCancelledError } from "@/services/task/interfaces/task.interface";
import {
  SyncParams,
  SyncResult
} from "@/services/task/tasks/feishu-sync/feishu-sync.type";
import {
  NameplateInfo,
  OfficialInfo,
  PendantInfo,
  UserData,
  UserProfileFields,
  VipInfo
} from "@/services/types/bili";
import { any2Object } from "@/utils";

/**
 * 飞书多维表格同步任务
 * 将用户数据同步到飞书多维表格
 */
@Injectable()
export class FeishuBitableSyncTask {
  constructor(
    private readonly feishuService: FeishuSyncService,
    private readonly prisma: PrismaService,
    @Inject(Logger) private readonly logger: Logger
  ) {}

  @Task({
    name: "feishu-bitable-sync",
    description: "同步用户数据到飞书多维表格",
    timeout: 600000, // 10分钟超时
    retries: 3
  })
  async execute(params?: SyncParams, signal?: AbortSignal) {
    const results: SyncResult["results"] = [];

    try {
      // 1. 确保bili根文件夹存在
      const biliFolderToken = await this.feishuService.ensureFolder("bili");
      this.logger.log(`bili文件夹Token: ${biliFolderToken}`);

      // 2. 获取需要同步的用户列表
      const mids = params?.mids;
      const users = await this.getUsersData(mids);

      if (users.length === 0) {
        this.logger.warn("没有找到需要同步的用户数据");
        return { total: 0, success: 0, failed: 0, results: [] };
      }

      // 3. 遍历每个用户，创建对应的子文件夹和多维表格
      for (const user of users) {
        if (signal?.aborted) {
          throw new TaskCancelledError("feishu-bitable-sync", "unknown");
        }

        try {
          await this.syncUserData(user, biliFolderToken, signal);
          results.push({
            mid: user.mid,
            name: user.name,
            success: true
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error({
            event: "feishu_sync.user_failed",
            mid: user.mid,
            name: user.name,
            error: errorMessage
          });
          results.push({
            mid: user.mid,
            name: user.name,
            success: false,
            error: errorMessage
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const failedCount = results.filter((r) => !r.success).length;

      const result: SyncResult = {
        total: users.length,
        success: successCount,
        failed: failedCount,
        results
      };

      if (successCount === 0 && failedCount > 0) {
        const firstError = results.find((r) => !r.success)?.error;
        throw new Error(`所有用户同步失败: ${firstError}`);
      }

      if (failedCount > 0) {
        this.logger.warn({
          event: "feishu_sync.partial_failure",
          total: users.length,
          success: successCount,
          failed: failedCount
        });
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`飞书同步任务失败: ${error.message}`, error.stack);
      }
      throw error;
    }
  }

  async getUsersData(mids?: number[]) {
    const whereClause = mids && mids.length > 0 ? { mid: { in: mids } } : {};

    const [spaceData, cardData] = await Promise.all([
      this.prisma.userSpaceData.findMany({ where: whereClause }),
      this.prisma.userCard.findMany({ where: whereClause })
    ]);

    // 合并数据
    const userMap = new Map<number, UserData>();

    spaceData.forEach((space) => {
      userMap.set(space.mid, {
        mid: space.mid,
        name: space.name,
        sex: space.sex,
        face: space.face,
        sign: space.sign,
        level: space.level,
        birthday: space.birthday || "",
        official: any2Object<OfficialInfo>(space.official),
        vip: any2Object<VipInfo>(space.vip),
        pendant: any2Object<PendantInfo>(space.pendant),
        nameplate: any2Object<NameplateInfo>(space.nameplate),
        isFollowed: space.isFollowed
      } as UserData);
    });

    cardData.forEach((card) => {
      const existing = userMap.get(card.mid);

      if (existing) {
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
          createdAt: dayjs(card.createdAt).format("YYYY-MM-DD HH:mm:ss")
        });
      }
    });

    return Array.from(userMap.values());
  }

  async syncUserData(
    user: UserData,
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
      this.getProfileTableFields()
    );

    // 4. 确保用户统计表存在
    const statsTableId = await this.feishuService.ensureTable(
      bitableToken,
      "用户统计",
      this.getStatsTableFields()
    );

    if (signal?.aborted) {
      throw new TaskCancelledError("feishu-bitable-sync", "unknown");
    }

    // 5. 同步用户状态数据（需要对比最新记录）
    await this.syncProfileData(bitableToken, profileTableId, user);

    // 6. 同步用户统计数据（直接插入）
    await this.syncStatsData(bitableToken, statsTableId, user);

    this.logger.log(`成功同步用户 ${user.name}(${user.mid}) 的数据`);
  }

  async syncProfileData(appToken: string, tableId: string, user: UserData) {
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
    const officialVerify = this.formatOfficialInfo(official);
    // 转换会员信息为文本描述
    const vipInfo = this.formatVipInfo(vip);

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
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss")
    };

    // 如果没有记录或数据有变化，则插入新记录
    if (
      latestRecords.length === 0 ||
      this.hasProfileChanged(
        latestRecords[0].fields as unknown as Record<string, string>,
        newProfile
      )
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

  async syncStatsData(appToken: string, tableId: string, user: UserData) {
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

  formatOfficialInfo(official: OfficialInfo | null): string {
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

  formatVipInfo(vip: VipInfo | null) {
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

  hasProfileChanged(
    oldFields: Record<string, string>,
    newProfile: UserProfileFields
  ) {
    // 重要字段对比
    const importantFields = [
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

  getProfileTableFields() {
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
  getStatsTableFields() {
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
}
