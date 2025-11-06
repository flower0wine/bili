import { CronJob } from "cron";
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy
} from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { PrismaService } from "@/services/common/prisma.service";
import {
  UserSpaceData,
  UserSpaceService
} from "@/services/user-space/user-space.service";

@Injectable()
export class DynamicSchedulerService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(DynamicSchedulerService.name);
  private intervalId: NodeJS.Timeout;

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly prisma: PrismaService,
    private readonly userSpaceService: UserSpaceService
  ) {}

  async onApplicationBootstrap() {
    // 应用启动时加载数据库中的定时任务
    await this.loadCronJobsFromDatabase();

    // 每分钟检查一次数据库中的任务配置是否有变化
    this.intervalId = setInterval(() => {
      this.loadCronJobsFromDatabase();
    }, 60000); // 1分钟检查一次
  }

  async onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  /**
   * 从数据库加载定时任务配置
   */
  private async loadCronJobsFromDatabase() {
    try {
      const jobs = await (this.prisma as any).cronJob.findMany({
        where: { enabled: true }
      });

      for (const job of jobs) {
        await this.addOrUpdateCronJob(job);
      }
    } catch (error) {
      this.logger.error("从数据库加载定时任务失败", error.stack);
    }
  }

  /**
   * 添加或更新 Cron 任务
   */
  private async addOrUpdateCronJob(job: any) {
    try {
      // 如果任务已存在，则删除旧的任务
      if (this.schedulerRegistry.doesExist("cron", job.name)) {
        this.schedulerRegistry.deleteCronJob(job.name);
      }

      // 创建新的 Cron 任务
      const cronJob = new CronJob(job.cron, () => {
        this.executeJob(job);
      });

      // 注册新的 Cron 任务
      this.schedulerRegistry.addCronJob(job.name, cronJob);

      // 启动任务
      cronJob.start();

      this.logger.log(`定时任务 ${job.name} 已注册并启动`);
    } catch (error) {
      this.logger.error(
        `注册定时任务 ${job.name} 失败: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * 执行具体的任务逻辑
   */
  private async executeJob(job: any) {
    this.logger.log(`开始执行任务: ${job.name}`);

    try {
      switch (job.name) {
        case "user_space_sync":
          await this.handleUserSpaceSync();
          break;
        default:
          this.logger.warn(`未知的任务类型: ${job.name}`);
      }

      // 更新任务的最后执行时间
      await (this.prisma as any).cronJob.update({
        where: { id: job.id },
        data: {
          lastRun: new Date(),
          nextRun: this.calculateNextRun(job.cron)
        }
      });

      this.logger.log(`任务 ${job.name} 执行完成`);
    } catch (error) {
      this.logger.error(
        `执行任务 ${job.name} 失败: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * 计算下次执行时间
   */
  private calculateNextRun(cron: string): Date | null {
    try {
      const job = new CronJob(cron, () => {});
      return job.nextDate().toJSDate();
    } catch (error) {
      this.logger.error(`计算下次执行时间失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 用户空间数据同步任务的具体实现
   */
  private async handleUserSpaceSync() {
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
