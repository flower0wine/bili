import dayjs from "dayjs";
import { Logger } from "nestjs-pino";
import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "@/services/common/prisma.service";
import {
  UserSpaceData,
  UserSpaceService
} from "@/services/user-space/user-space.service";
import { Task } from "../decorators/task.decorator";
import { TaskCancelledError } from "../interfaces/task.interface";

/**
 * 任务参数类型
 */
interface SyncParams {
  mids?: number[];
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
    private readonly userSpaceService: UserSpaceService,
    private readonly prisma: PrismaService,
    @Inject(Logger) private readonly logger: Logger
  ) {}

  @Task({
    name: "user-space-sync",
    description: "同步用户空间数据到数据库",
    timeout: 300000, // 5分钟超时
    retries: 3
  })
  async execute(
    params?: SyncParams,
    signal?: AbortSignal
  ): Promise<SyncResult> {
    const mids = params?.mids || [2]; // 默认用户列表

    const results: SyncResult["results"] = [];

    for (const mid of mids) {
      // 检查是否被取消
      if (signal?.aborted) {
        throw new TaskCancelledError("user-space-sync", "unknown");
      }

      try {
        // 获取用户空间数据
        const userData: UserSpaceData =
          await this.userSpaceService.getUserSpaceInfo({ mid });

        // 再次检查取消状态
        if (signal?.aborted) {
          throw new TaskCancelledError("user-space-sync", "unknown");
        }

        // 保存到数据库
        const saved = await this.prisma.userSpaceData.upsert({
          where: { mid: userData.mid },
          update: {
            name: userData.name,
            sex: userData.sex,
            level: userData.level,
            face: userData.face,
            sign: userData.sign,
            userStatus: userData.userStatus,
            following: userData.following,
            follower: userData.follower,
            updatedAt: dayjs().toDate()
          },
          create: {
            mid: userData.mid,
            name: userData.name,
            sex: userData.sex,
            level: userData.level,
            face: userData.face,
            sign: userData.sign,
            userStatus: userData.userStatus,
            following: userData.following,
            follower: userData.follower
          }
        });

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
}
