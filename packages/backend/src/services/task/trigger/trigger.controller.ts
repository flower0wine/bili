import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from "@nestjs/swagger";
import { PrismaService } from "@/services/common/prisma.service";
import { getBadRequestContent } from "@/services/swagger.common";
import { DatabaseConfigProvider } from "./config/database.provider";
import { ConfigSource } from "./config/trigger-config-loader.service";
import { CronTriggerService } from "./cron-trigger.service";
import { CreateTriggerDto, UpdateTriggerDto } from "./dto/trigger.dto";
import { TriggerVo } from "./vo/trigger.vo";

/**
 * 触发器 API 控制器
 * 管理 Cron 触发器的 CRUD 操作
 */
@ApiTags("Triggers")
@Controller("triggers/cron")
export class TriggerController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cronTriggerService: CronTriggerService,
    private readonly databaseConfigProvider: DatabaseConfigProvider
  ) {}

  /**
   * 获取所有触发器
   */
  @Get()
  @ApiOperation({
    summary: "获取所有 Cron 触发器",
    description: "查询数据库中所有的 Cron 触发器配置"
  })
  @ApiOkResponse({
    description: "触发器列表",
    type: [TriggerVo]
  })
  async getAllTriggers() {
    return await (this.prisma as any).cronTrigger.findMany({
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * 创建触发器（绑定已存在的任务）
   */
  @Post()
  @ApiOperation({
    summary: "创建新的 Cron 触发器",
    description: "为已存在的任务创建一个新的 Cron 触发器，配置定时执行规则"
  })
  @ApiBody({ type: CreateTriggerDto })
  @ApiOkResponse({
    description: "创建成功的触发器",
    type: TriggerVo
  })
  @ApiBadRequestResponse({
    description: "创建失败（参数错误或触发器名称已存在）",
    content: getBadRequestContent({
      invalidData: {
        summary: "参数错误",
        value: {
          ok: false,
          code: 1001,
          message: "触发器名称已存在或参数非法"
        }
      }
    })
  })
  async createTrigger(@Body() data: CreateTriggerDto) {
    const trigger = await (this.prisma as any).cronTrigger.create({
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
  @ApiOperation({
    summary: "更新触发器配置",
    description: "修改指定触发器的 Cron 表达式、参数、启用状态等配置"
  })
  @ApiParam({
    name: "id",
    description: "触发器ID",
    example: 1
  })
  @ApiBody({ type: UpdateTriggerDto })
  @ApiOkResponse({
    description: "更新成功的触发器",
    type: TriggerVo
  })
  @ApiBadRequestResponse({
    description: "触发器不存在或更新失败",
    content: getBadRequestContent({
      notFound: {
        summary: "触发器不存在",
        value: {
          ok: false,
          code: 1001,
          message: "触发器不存在"
        }
      }
    })
  })
  async updateTrigger(@Param("id") id: string, @Body() data: UpdateTriggerDto) {
    const trigger = await (this.prisma as any).cronTrigger.update({
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
  @ApiOperation({
    summary: "删除触发器",
    description: "删除指定的 Cron 触发器配置"
  })
  @ApiParam({
    name: "id",
    description: "触发器ID",
    example: 1
  })
  @ApiOkResponse({
    description: "删除成功",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true }
      }
    }
  })
  @ApiBadRequestResponse({
    description: "触发器不存在或删除失败",
    content: getBadRequestContent({
      notFound: {
        summary: "触发器不存在",
        value: {
          ok: false,
          code: 1001,
          message: "触发器不存在"
        }
      }
    })
  })
  async deleteTrigger(@Param("id") id: string) {
    await (this.prisma as any).cronTrigger.delete({
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
  @ApiOperation({
    summary: "切换触发器启用状态",
    description: "快速启用或禁用指定的触发器（状态翻转）"
  })
  @ApiParam({
    name: "id",
    description: "触发器ID",
    example: 1
  })
  @ApiOkResponse({
    description: "更新后的触发器",
    type: TriggerVo
  })
  @ApiBadRequestResponse({
    description: "触发器不存在或操作失败",
    content: getBadRequestContent({
      notFound: {
        summary: "触发器不存在",
        value: {
          ok: false,
          code: 1001,
          message: "触发器不存在"
        }
      }
    })
  })
  async toggleTrigger(@Param("id") id: string) {
    const trigger = await (this.prisma as any).cronTrigger.findUnique({
      where: { id: parseInt(id) }
    });

    const updated = await (this.prisma as any).cronTrigger.update({
      where: { id: parseInt(id) },
      data: { enabled: !trigger.enabled }
    });

    // 通知配置变更，触发自动重新加载
    await this.databaseConfigProvider.notifyChange();

    return updated;
  }
}
