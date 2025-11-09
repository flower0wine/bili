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
  getUsersData,
  syncUserData
} from "@/services/task/tasks/feishu-sync/feishu-sync.util";

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
  async execute(
    params?: SyncParams,
    signal?: AbortSignal
  ): Promise<SyncResult> {
    const results: SyncResult["results"] = [];

    try {
      // 1. 确保bili根文件夹存在
      const biliFolderToken = await this.feishuService.ensureFolder("bili");
      this.logger.log(`bili文件夹Token: ${biliFolderToken}`);

      // 2. 获取需要同步的用户列表
      const mids = params?.mids;
      const users = await getUsersData.call(this, mids);

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
          await syncUserData.call(this, user, biliFolderToken, signal);
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
      this.logger.error(`飞书同步任务失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}
