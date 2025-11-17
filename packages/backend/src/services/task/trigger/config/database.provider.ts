import { createHash } from "crypto";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/services/common/prisma.service";
import { toError } from "@/utils/error.util";
import {
  ConfigChangeListener,
  ConfigSource,
  ITriggerConfigProvider,
  TriggerConfigSource
} from "./trigger-config-loader.service";

/**
 * 数据库配置提供者 - 从数据库加载配置
 *
 * 支持变更通知：
 * - 可以通过 API 更新数据库配置
 * - 更新后调用 notifyChange() 触发重新加载
 */
@Injectable()
export class DatabaseConfigProvider implements ITriggerConfigProvider {
  private readonly logger = new Logger(DatabaseConfigProvider.name);
  private changeListeners: ConfigChangeListener[] = [];

  constructor(private readonly prisma: PrismaService) {}

  getName(): string {
    return ConfigSource.DATABASE;
  }

  /**
   * 注册配置变更监听器
   */
  onConfigChange(listener: ConfigChangeListener): void {
    this.changeListeners.push(listener);
    this.logger.debug("已注册数据库配置变更监听器");
  }

  /**
   * 移除配置变更监听器
   */
  offConfigChange(listener: ConfigChangeListener): void {
    const index = this.changeListeners.indexOf(listener);
    if (index > -1) {
      this.changeListeners.splice(index, 1);
      this.logger.debug("已移除数据库配置变更监听器");
    }
  }

  /**
   * 通知配置变更
   * 当数据库配置更新后，应调用此方法
   */
  async notifyChange(): Promise<void> {
    if (this.changeListeners.length === 0) {
      return;
    }

    this.logger.log("数据库配置发生变更,通知监听器...");
    const configs = await this.load();

    for (const listener of this.changeListeners) {
      try {
        await listener(configs);
      } catch (e) {
        const error = toError(e);
        this.logger.error(
          `执行配置变更监听器失败: ${error.message}`,
          error.stack
        );
      }
    }
  }

  async load(): Promise<TriggerConfigSource[]> {
    try {
      const triggers = await this.prisma.cronTrigger.findMany({
        where: {
          source: ConfigSource.DATABASE
        }
      });

      // 验证并转换为标准格式
      const validConfigs: TriggerConfigSource[] = [];
      for (let i = 0; i < triggers.length; i++) {
        const trigger = triggers[i];

        // 类型校验
        if (!this.validateConfig(trigger, i)) {
          continue; // 跳过非法配置
        }

        validConfigs.push({
          id: this.generateStableId(trigger.id), // 使用数据库ID生成稳定UUID
          name: trigger.name,
          taskName: trigger.taskName,
          cron: trigger.cron,
          params: trigger.params,
          enabled: trigger.enabled ?? true, // 默认启用
          description: trigger.description ?? undefined,
          source: ConfigSource.DATABASE
        });
      }

      this.logger.log(
        `从数据库加载 ${validConfigs.length}/${triggers.length} 个有效触发器配置`
      );

      return validConfigs;
    } catch (e) {
      const error = toError(e);
      this.logger.error(
        `从数据库加载触发器配置失败: ${error.message}`,
        error.stack
      );
      return [];
    }
  }

  /**
   * 生成稳定的数据库触发器ID
   * 使用配置源 + 数据库ID生成，确保与文件配置不冲突
   */
  private generateStableId(dbId: number): string {
    // 使用配置源类型 + 数据库ID生成唯一且稳定的ID
    const uniqueKey = `${ConfigSource.DATABASE}:${dbId}`;
    const hash = createHash("sha256").update(uniqueKey).digest("hex");

    // 转换为UUID格式
    return [
      hash.substring(0, 8),
      hash.substring(8, 12),
      hash.substring(12, 16),
      hash.substring(16, 20),
      hash.substring(20, 32)
    ].join("-");
  }

  /**
   * 验证配置项是否合法
   */
  private validateConfig(config: TriggerConfigSource, index: number): boolean {
    const requiredFields = ["name", "taskName", "cron"];
    const missingFields = requiredFields.filter(
      (field) => !config[field] || typeof config[field] !== "string"
    );

    if (missingFields.length > 0) {
      this.logger.error(
        `数据库中第 ${index + 1} 条记录 (ID: ${config.id}) 缺少必填字段或类型错误: ${missingFields.join(", ")}`
      );
      return false;
    }

    return true;
  }
}
