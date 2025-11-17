import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put
} from "@nestjs/common";
import { PrismaService } from "@/services/common/prisma.service";
import { DatabaseConfigProvider } from "./config/database.provider";
import { ConfigSource } from "./config/trigger-config-loader.service";
import { CreateTriggerDto, UpdateTriggerDto } from "./dto/trigger.dto";

/**
 * 触发器 API 控制器
 * 管理 Cron 触发器的 CRUD 操作
 */
@Controller("triggers/cron")
export class TriggerController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly databaseConfigProvider: DatabaseConfigProvider
  ) {}

  /**
   * 获取所有触发器
   */
  @Get()
  async getAllTriggers() {
    return await this.prisma.cronTrigger.findMany({
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * 创建触发器（绑定已存在的任务）
   */
  @Post()
  async createTrigger(@Body() data: CreateTriggerDto) {
    const trigger = await this.prisma.cronTrigger.create({
      data: {
        name: data.name,
        taskName: data.taskName,
        cron: data.cron,
        params: data.params || {},
        description: data.description,
        enabled: data.enabled ?? true,
        source: ConfigSource.DATABASE
      }
    });

    // 通知配置变更，触发自动重新加载
    await this.databaseConfigProvider.notifyChange();

    return trigger;
  }

  /**
   * 更新触发器
   */
  @Put(":id")
  async updateTrigger(@Param("id") id: string, @Body() data: UpdateTriggerDto) {
    const trigger = await this.prisma.cronTrigger.update({
      where: { id: parseInt(id) },
      data
    });

    // 通知配置变更，触发自动重新加载
    await this.databaseConfigProvider.notifyChange();

    return trigger;
  }

  /**
   * 删除触发器
   */
  @Delete(":id")
  async deleteTrigger(@Param("id") id: string) {
    await this.prisma.cronTrigger.delete({
      where: { id: parseInt(id) }
    });

    // 通知配置变更，触发自动重新加载
    await this.databaseConfigProvider.notifyChange();

    return { success: true };
  }

  /**
   * 启用/禁用触发器
   */
  @Post(":id/toggle")
  async toggleTrigger(@Param("id") id: string) {
    const trigger = await this.prisma.cronTrigger.findUnique({
      where: { id: parseInt(id) }
    });

    if (!trigger) {
      throw new Error("Trigger not found");
    }

    const updated = await this.prisma.cronTrigger.update({
      where: { id: parseInt(id) },
      data: { enabled: !trigger.enabled }
    });

    // 通知配置变更，触发自动重新加载
    await this.databaseConfigProvider.notifyChange();

    return updated;
  }
}
