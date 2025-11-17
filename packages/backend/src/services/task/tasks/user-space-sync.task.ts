import { Logger } from "nestjs-pino";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@/services/common/prisma.service";
import { UserSpaceTaskParams } from "@/services/user-space/dto/user-space-task-params.dto";
import { UserSpaceTask } from "@/services/user-space/user-space.task";
import { Prisma } from "@prisma/client";
import { Task } from "../decorators/task.decorator";
import { TaskCancelledError } from "../interfaces/task.interface";

/**
 * 任务参数类型
 */
interface SyncParams {
  mids?: number[];
  cookie?: string; // 可选的cookie，如果不提供则使用配置中的cookie
}

/**
 * 任务返回结果类型
 */
interface SyncResult {
  total: number;
  success: number;
  failed: number;
  results: Array<{
    mid: number;
    success: boolean;
    data?: unknown;
    error?: string;
  }>;
}

/**
 * 用户空间同步任务
 * 这是一个纯粹的任务实现，不包含任何调度逻辑
 */
@Injectable()
export class UserSpaceSyncTask {
  constructor(
    private readonly userSpaceTask: UserSpaceTask,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(Logger) private readonly logger: Logger
  ) {}

  @Task({
    name: "user-space-sync",
    description: "同步用户空间数据到数据库（检测变化后插入新记录）",
    timeout: 300000, // 5分钟超时
    retries: 3
  })
  async execute(
    params?: SyncParams,
    signal?: AbortSignal
  ): Promise<SyncResult> {
    const mids = params?.mids; // 默认用户列表

    if (!mids || mids.length === 0) {
      throw new Error("用户列表为空");
    }

    // 获取cookie，优先使用传入的cookie，否则从环境变量获取
    const cookie =
      params?.cookie || this.configService.get<string>("BILIBILI_COOKIE");
    if (!cookie) {
      throw new Error("未配置BILIBILI_COOKIE环境变量且未提供cookie参数");
    }

    const results: SyncResult["results"] = [];

    for (const mid of mids) {
      // 检查是否被取消
      if (signal?.aborted) {
        throw new TaskCancelledError("user-space-sync", "unknown");
      }

      try {
        // 构造任务参数
        const taskParams: UserSpaceTaskParams = { mid, cookie };

        // 获取用户空间数据
        const userData =
          await this.userSpaceTask.executeGetUserSpaceInfo(taskParams);

        // 再次检查取消状态
        if (signal?.aborted) {
          throw new TaskCancelledError("user-space-sync", "unknown");
        }

        // 获取最新的一条记录进行对比
        const latestRecord = await this.prisma.userSpaceData.findFirst({
          where: { mid },
          orderBy: { createdAt: "desc" }
        });

        // 检查数据是否有变化
        let hasChanged = false;
        if (latestRecord) {
          hasChanged = this.hasDataChanged(latestRecord, userData);
        }

        let saved: any;
        if (hasChanged) {
          // 有变化，插入新记录
          saved = await this.prisma.userSpaceData.create({
            data: {
              mid: userData.mid,
              name: userData.name,
              sex: userData.sex,
              face: userData.face,
              faceNft: userData.faceNft,
              sign: userData.sign,
              level: userData.level,
              birthday: userData.birthday,

              // 认证与会员信息
              official: {
                ...userData.official
              },
              vip: {
                ...userData.vip
              },
              pendant: {
                ...userData.pendant
              },
              nameplate: {
                ...userData.nameplate
              },

              // 社交信息
              fansBadge: userData.fansBadge,
              isFollowed: userData.isFollowed,
              topPhoto: userData.topPhoto,

              // 其他展示信息
              liveRoom: {
                ...userData.liveRoom,
                watched_show: {
                  ...userData.liveRoom?.watched_show
                }
              },
              tags: userData.tags === null ? Prisma.JsonNull : userData.tags,
              isSeniorMember: userData.isSeniorMember
            }
          });

          this.logger.log({
            event: "user_space_sync.data_changed",
            mid,
            message: "检测到数据变化，插入新记录"
          });
        } else {
          this.logger.log({
            event: "user_space_sync.data_unchanged",
            mid,
            message: "数据无变化，跳过插入"
          });
        }

        results.push({ mid, success: true, data: saved });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error({
          event: "user_space_sync.failed",
          mid,
          error: errorMessage
        });
        results.push({ mid, success: false, error: errorMessage });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    const result: SyncResult = {
      total: mids.length,
      success: successCount,
      failed: failedCount,
      results
    };

    // 如果所有用户都失败，抛出错误触发重试
    if (successCount === 0 && failedCount > 0) {
      const firstError = results.find((r) => !r.success)?.error;
      throw new Error(`所有用户同步失败: ${firstError}`);
    }

    // 记录部分失败的情况
    if (failedCount > 0) {
      this.logger.warn({
        event: "user_space_sync.partial_failure",
        total: mids.length,
        success: successCount,
        failed: failedCount,
        message: `部分用户同步失败，成功 ${successCount}/${mids.length}`
      });
    }

    return result;
  }

  /**
   * 检查用户空间数据是否有变化
   * @param oldData 数据库中的最新记录
   * @param newData 从API获取的新数据
   * @returns true表示有变化，false表示无变化
   */
  private hasDataChanged(oldData: object, newData: object): boolean {
    // 如果没有历史记录，说明是新用户，需要插入
    if (!oldData) {
      return true;
    }

    // 需要比较的字段列表（不包括时间戳字段）
    const fieldsToCompare = [
      "name",
      "sex",
      "face",
      "faceNft",
      "sign",
      "level",
      "birthday",
      "fansBadge",
      "isFollowed",
      "topPhoto",
      "isSeniorMember"
    ];

    // 比较基本字段
    for (const field of fieldsToCompare) {
      if (oldData[field] !== newData[field]) {
        this.logger.debug({
          event: "user_space_sync.field_changed",
          field,
          oldValue: JSON.stringify(oldData[field]),
          newValue: JSON.stringify(newData[field])
        });
        return true;
      }
    }

    // 比较JSON字段（需要深度比较）
    const jsonFields = [
      "official",
      "vip",
      "pendant",
      "nameplate",
      "fansMedal",
      "liveRoom",
      "tags",
      "sysNotice"
    ];

    for (const field of jsonFields) {
      const oldValue = JSON.stringify(oldData[field]);
      const newValue = JSON.stringify(newData[field]);
      if (oldValue !== newValue) {
        this.logger.debug({
          event: "user_space_sync.json_field_changed",
          field
        });
        return true;
      }
    }

    return false;
  }
}
