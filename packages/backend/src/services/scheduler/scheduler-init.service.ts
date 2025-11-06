import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "@/services/common/prisma.service";

@Injectable()
export class SchedulerInitService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerInitService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.initializeDefaultCronJobs();
  }

  private async initializeDefaultCronJobs() {
    this.logger.log("初始化默认定时任务配置");

    try {
      // 检查是否已存在用户空间同步任务配置
      const existingJob = await (this.prisma as any).cronJob.findUnique({
        where: { name: "user_space_sync" }
      });

      if (!existingJob) {
        // 创建默认的用户空间同步任务配置
        await (this.prisma as any).cronJob.create({
          data: {
            name: "user_space_sync",
            cron: "0 0 * * *", // 每天凌晨执行
            description: "定时同步用户空间数据",
            enabled: true
          }
        });

        this.logger.log("默认定时任务配置已创建");
      } else {
        this.logger.log("默认定时任务配置已存在");
      }
    } catch (error) {
      this.logger.error("初始化默认定时任务配置失败", error.stack);
    }
  }
}
