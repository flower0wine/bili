import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "@/services/common/prisma.service";
import {
  UserSpaceData,
  UserSpaceService
} from "@/services/user-space/user-space.service";

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userSpaceService: UserSpaceService
  ) {}

  /**
   * 定时任务：获取用户空间数据并保存到数据库
   */
  @Cron("0 0 * * *") // 每天凌晨执行
  async handleUserSpaceSync() {
    this.logger.log("开始执行用户空间数据同步任务");

    try {
      // 获取所有启用的用户ID列表（这里示例使用一个固定的ID）
      const userIds = [2]; // 实际应用中应该从数据库或其他配置中获取

      for (const mid of userIds) {
        try {
          // 调用用户空间服务获取数据
          const userData: UserSpaceData =
            await this.userSpaceService.getUserSpaceInfo({ mid });

          // 将数据保存到数据库
          await (this.prisma as any).userSpaceData.upsert({
            where: { mid: userData.mid },
            update: {
              name: userData.name,
              sex: userData.sex,
              level: userData.level,
              face: userData.face,
              sign: userData.sign,
              userStatus: userData.userStatus as any,
              following: userData.following,
              follower: userData.follower,
              updatedAt: new Date()
            },
            create: {
              mid: userData.mid,
              name: userData.name,
              sex: userData.sex,
              level: userData.level,
              face: userData.face,
              sign: userData.sign,
              userStatus: userData.userStatus as any,
              following: userData.following,
              follower: userData.follower
            }
          });

          this.logger.log(`用户 ${mid} 的空间数据已同步`);
        } catch (error) {
          this.logger.error(
            `同步用户 ${mid} 的空间数据失败: ${error.message}`,
            error.stack
          );
        }
      }

      this.logger.log("用户空间数据同步任务执行完成");
    } catch (error) {
      this.logger.error("执行用户空间数据同步任务失败", error.stack);
    }
  }
}
