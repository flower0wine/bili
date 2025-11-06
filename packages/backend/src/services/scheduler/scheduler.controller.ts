import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put
} from "@nestjs/common";
import { PrismaService } from "@/services/common/prisma.service";
import { SchedulerService } from "@/services/scheduler/scheduler.service";

@Controller("scheduler")
export class SchedulerController {
  private readonly logger = new Logger(SchedulerController.name);

  constructor(
    private readonly schedulerService: SchedulerService,
    private readonly prisma: PrismaService
  ) {}

  @Get("jobs")
  async getAllJobs() {
    return await (this.prisma as any).cronJob.findMany();
  }

  @Post("jobs")
  async createJob(
    @Body() jobData: { name: string; cron: string; description?: string }
  ) {
    return await (this.prisma as any).cronJob.create({
      data: {
        name: jobData.name,
        cron: jobData.cron,
        description: jobData.description,
        enabled: true
      }
    });
  }

  @Put("jobs/:id")
  async updateJob(
    @Param("id") id: string,
    @Body() jobData: { cron?: string; enabled?: boolean }
  ) {
    return await (this.prisma as any).cronJob.update({
      where: { id: parseInt(id) },
      data: jobData
    });
  }

  @Delete("jobs/:id")
  async deleteJob(@Param("id") id: string) {
    return await (this.prisma as any).cronJob.delete({
      where: { id: parseInt(id) }
    });
  }

  @Post("jobs/:id/run")
  async runJob(@Param("id") id: string) {
    // 这里可以触发特定的任务执行
    this.logger.log(`手动触发任务 ${id}`);
    return { message: `任务 ${id} 已触发` };
  }
}
