import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { v4 as uuidv4 } from "uuid";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigManager } from "@/services/task/trigger/config/config.manager";
import { TriggerConfig } from "@/services/task/trigger/config/trigger.schema";
import { ConfigSource } from "@/services/task/trigger/config/types";
import {
  CreateTriggerDto,
  UpdateTriggerDto
} from "@/services/task/trigger/dto/trigger.dto";

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class TriggerService {
  private readonly logger = new Logger(TriggerService.name);

  constructor(private readonly configManager: ConfigManager) {}

  /**
   * 获取所有触发器
   *
   * @returns 触发器配置列表
   */
  getAllTriggers() {
    return this.configManager.getLoadedConfigs();
  }

  /**
   * 创建触发器
   *
   * 流程：
   * 1. 生成 UUID
   * 2. 构建触发器配置
   * 3. 通过 ConfigManager 添加配置
   * 4. 配置变更事件自动触发触发器同步
   *
   * @param data 创建触发器的数据
   * @returns 创建的触发器配置
   */
  createTrigger(data: CreateTriggerDto) {
    // 生成触发器 ID (UUID)
    const triggerId = uuidv4();

    // 获取当前时间（带时区）
    const now = dayjs().tz();

    // 构建触发器配置
    const triggerConfig: TriggerConfig = {
      id: triggerId,
      name: data.name,
      taskName: data.taskName,
      cron: data.cron,
      enabled: data.enabled ?? true,
      description: data.description || null,
      params: data.params || {},
      source: ConfigSource.DATABASE
    };

    // 通过 ConfigManager 添加配置，自动触发变更事件
    this.configManager.addConfig({
      config: triggerConfig,
      providerName: "database",
      source: ConfigSource.DATABASE,
      loadedAt: now.toDate()
    });

    this.logger.log(`✅ 触发器已创建: ${data.name} (ID: ${triggerId})`);
    return triggerConfig;
  }

  /**
   * 更新触发器
   *
   * 流程：
   * 1. 验证触发器是否存在
   * 2. 构建更新后的配置
   * 3. 通过 ConfigManager 更新配置
   * 4. 配置变更事件自动触发触发器同步
   *
   * @param id 触发器 ID
   * @param data 更新的数据
   * @returns 更新后的触发器配置
   */
  updateTrigger(id: string, data: UpdateTriggerDto) {
    // 检查触发器是否存在
    const existing = this.configManager.getConfigEntry(id);
    if (!existing) {
      throw new NotFoundException(`触发器不存在: ${id}`);
    }

    // 获取当前时间（带时区）
    const now = dayjs().tz();

    // 构建更新后的配置
    const triggerConfig: TriggerConfig = {
      id: existing.config.id,
      name: existing.config.name,
      taskName: existing.config.taskName,
      cron: data.cron ?? existing.config.cron,
      enabled: data.enabled ?? existing.config.enabled,
      description: data.description ?? existing.config.description,
      params: data.params ?? existing.config.params,
      source: ConfigSource.DATABASE
    };

    // 通过 ConfigManager 更新配置，自动触发变更事件
    this.configManager.updateConfig({
      config: triggerConfig,
      providerName: existing.providerName,
      source: ConfigSource.DATABASE,
      loadedAt: now.toDate()
    });

    this.logger.log(`✅ 触发器已更新: ${triggerConfig.name} (ID: ${id})`);
    return triggerConfig;
  }

  /**
   * 删除触发器
   *
   * 流程：
   * 1. 验证触发器是否存在
   * 2. 通过 ConfigManager 删除配置
   * 3. 配置变更事件自动触发触发器同步
   *
   * @param id 触发器 ID
   * @returns 删除结果
   */
  deleteTrigger(id: string) {
    // 检查触发器是否存在
    const existing = this.configManager.getConfigEntry(id);
    if (!existing) {
      throw new NotFoundException(`触发器不存在: ${id}`);
    }

    // 通过 ConfigManager 删除配置，自动触发变更事件
    this.configManager.deleteConfig(id);

    this.logger.log(`✅ 触发器已删除: ${existing.config.name} (ID: ${id})`);
    return { success: true };
  }

  /**
   * 启用/禁用触发器
   *
   * 流程：
   * 1. 验证触发器是否存在
   * 2. 切换触发器的启用状态
   * 3. 通过 ConfigManager 更新配置
   * 4. 配置变更事件自动触发触发器同步
   *
   * @param id 触发器 ID
   * @returns 更新后的触发器配置
   */
  toggleTrigger(id: string) {
    // 检查触发器是否存在
    const existing = this.configManager.getConfigEntry(id);
    if (!existing) {
      throw new NotFoundException(`触发器不存在: ${id}`);
    }

    // 获取当前时间（带时区）
    const now = dayjs().tz();

    // 切换启用状态
    const newEnabled = !existing.config.enabled;
    const triggerConfig: TriggerConfig = {
      ...existing.config,
      enabled: newEnabled
    };

    // 通过 ConfigManager 更新配置，自动触发变更事件
    this.configManager.updateConfig({
      config: triggerConfig,
      providerName: existing.providerName,
      source: ConfigSource.DATABASE,
      loadedAt: now.toDate()
    });

    const status = newEnabled ? "启用" : "禁用";
    this.logger.log(
      `✅ 触发器已${status}: ${existing.config.name} (ID: ${id})`
    );
    return triggerConfig;
  }
}
