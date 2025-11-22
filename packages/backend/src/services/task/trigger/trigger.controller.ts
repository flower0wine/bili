import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put
} from "@nestjs/common";
import { TriggerConfig } from "./config/trigger.schema";
import { CreateTriggerDto, UpdateTriggerDto } from "./dto/trigger.dto";
import { TriggerService } from "./trigger.service";

/**
 * 触发器 API 控制器
 *
 * 职责：
 * - 处理 HTTP 请求和响应
 * - 参数验证由 NestJS 的 ValidationPipe 处理
 * - 业务逻辑由 TriggerService 处理
 *
 * 设计原则：
 * - Controller 只负责 HTTP 层
 * - 所有业务逻辑由 TriggerService 处理
 * - 所有配置操作通过 ConfigManager 进行
 * - 所有日志由 Service 层处理
 */
@Controller("triggers/cron")
export class TriggerController {
  constructor(private readonly triggerService: TriggerService) {}

  /**
   * 获取所有触发器
   *
   * @returns 触发器配置列表
   */
  @Get()
  getAllTriggers(): TriggerConfig[] {
    return this.triggerService.getAllTriggers();
  }

  /**
   * 创建触发器
   *
   * @param data 创建触发器的数据
   * @returns 创建的触发器配置
   */
  @Post()
  createTrigger(@Body() data: CreateTriggerDto): TriggerConfig {
    return this.triggerService.createTrigger(data);
  }

  /**
   * 更新触发器
   *
   * @param id 触发器 ID
   * @param data 更新的数据
   * @returns 更新后的触发器配置
   */
  @Put(":id")
  updateTrigger(
    @Param("id") id: string,
    @Body() data: UpdateTriggerDto
  ): TriggerConfig {
    return this.triggerService.updateTrigger(id, data);
  }

  /**
   * 删除触发器
   *
   * @param id 触发器 ID
   * @returns 删除结果
   */
  @Delete(":id")
  deleteTrigger(@Param("id") id: string): { success: boolean } {
    return this.triggerService.deleteTrigger(id);
  }

  /**
   * 启用/禁用触发器
   *
   * @param id 触发器 ID
   * @returns 更新后的触发器配置
   */
  @Post(":id/toggle")
  toggleTrigger(@Param("id") id: string): TriggerConfig {
    return this.triggerService.toggleTrigger(id);
  }
}
