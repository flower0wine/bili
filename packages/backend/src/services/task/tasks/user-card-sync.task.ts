import dayjs from "dayjs";
import { Logger } from "nestjs-pino";
import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "@/services/common/prisma.service";
import {
  UserCardData,
  UserCardService
} from "@/services/user-card/user-card.service";
import { Task } from "../decorators/task.decorator";
import { TaskCancelledError } from "../interfaces/task.interface";

/**
 * 任务参数类型
 */
interface SyncParams {
  mids?: number[];
  photo?: boolean;
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
 * 用户名片同步任务
 * 这是一个纯粹的任务实现，不包含任何调度逻辑
 */
@Injectable()
export class UserCardSyncTask {
  constructor(
    private readonly userCardService: UserCardService,
    private readonly prisma: PrismaService,
    @Inject(Logger) private readonly logger: Logger
  ) {}

  @Task({
    name: "user-card-sync",
    description: "同步用户名片数据到数据库",
    timeout: 300000, // 5分钟超时
    retries: 3
  })
  async execute(
    params?: SyncParams,
    signal?: AbortSignal
  ): Promise<SyncResult> {
    const mids = params?.mids || [2]; // 默认用户列表
    const photo = params?.photo !== false; // 默认请求头图

    const results: SyncResult["results"] = [];

    for (const mid of mids) {
      // 检查是否被取消
      if (signal?.aborted) {
        throw new TaskCancelledError("user-card-sync", "unknown");
      }

      try {
        // 获取用户名片数据
        const userData: UserCardData =
          await this.userCardService.getUserCardInfo({ mid, photo });

        // 再次检查取消状态
        if (signal?.aborted) {
          throw new TaskCancelledError("user-card-sync", "unknown");
        }

        // 保存到数据库
        const saved = await this.prisma.userCard.upsert({
          where: { mid: userData.mid },
          update: {
            name: userData.name,
            sex: userData.sex,
            face: userData.face,
            sign: userData.sign,
            level: userData.level,

            // 统计信息
            fans: userData.fans,
            friend: userData.friend,
            archiveCount: userData.archiveCount,
            articleCount: userData.articleCount,
            likeNum: userData.likeNum,

            // 认证与会员信息
            official: userData.official,
            vip: userData.vip,
            pendant: userData.pendant,
            nameplate: userData.nameplate,

            // 社交信息
            following: userData.following,
            space: userData.space,

            updatedAt: dayjs().toDate()
          },
          create: {
            mid: userData.mid,
            name: userData.name,
            sex: userData.sex,
            face: userData.face,
            sign: userData.sign,
            level: userData.level,

            // 统计信息
            fans: userData.fans,
            friend: userData.friend,
            archiveCount: userData.archiveCount,
            articleCount: userData.articleCount,
            likeNum: userData.likeNum,

            // 认证与会员信息
            official: userData.official,
            vip: userData.vip,
            pendant: userData.pendant,
            nameplate: userData.nameplate,

            // 社交信息
            following: userData.following,
            space: userData.space
          }
        });

        results.push({ mid, success: true, data: saved });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error({
          event: "user_card_sync.failed",
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
        event: "user_card_sync.partial_failure",
        total: mids.length,
        success: successCount,
        failed: failedCount,
        message: `部分用户同步失败，成功 ${successCount}/${mids.length}`
      });
    }

    return result;
  }
}
