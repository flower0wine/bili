import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/services/common/prisma.service";
import {
  TriggerConfig,
  validateTriggerConfig
} from "@/services/task/trigger/config/trigger.schema";
import {
  ConfigSource,
  ITriggerConfigProvider
} from "@/services/task/trigger/config/types";
import { toError } from "@/utils/error.util";

/**
 * 数据库配置提供者
 *
 * 职责：
 * - 从数据库加载触发器配置
 * - 验证配置格式
 * - 提供完整的配置（包括 id 和 source）
 *
 * 设计原则：
 * - 所有配置都必须包含 ID（来自数据库的 id 字段）
 * - 如果配置缺少 ID，报错并提供充分的错误信息
 * - 使用 Zod 进行运行时验证
 * - 不负责管理监听器，由加载器负责
 * - 不负责数据库的增删改查（由 Controller 负责）
 */
@Injectable()
export class DatabaseConfigProviderRefactored
  implements ITriggerConfigProvider
{
  private readonly logger = new Logger(DatabaseConfigProviderRefactored.name);

  constructor(private readonly prisma: PrismaService) {}

  getName() {
    return "database";
  }

  getSource() {
    return ConfigSource.DATABASE;
  }

  /**
   * 加载数据库中的触发器配置
   *
   * 流程：
   * 1. 从数据库查询所有触发器配置
   * 2. 对每个配置进行验证
   * 3. 检查是否包含 ID，缺少 ID 则报错
   * 4. 返回规范化的配置列表
   *
   * @returns 规范化的触发器配置列表
   */
  async load(): Promise<TriggerConfig[]> {
    try {
      this.logger.debug("开始从数据库加载触发器配置...");

      // 从数据库查询所有触发器
      const dbTriggers = await this.prisma.cronTrigger.findMany({
        where: {
          source: ConfigSource.DATABASE
        }
      });

      // 验证并加载配置
      const configs: TriggerConfig[] = [];
      for (let index = 0; index < dbTriggers.length; index++) {
        const dbTrigger = dbTriggers[index];

        // 检查是否有 ID
        if (!dbTrigger.id) {
          const errorMsg = `数据库中第 ${index + 1} 条记录缺少 ID，触发器: ${dbTrigger.name}`;
          this.logger.error(errorMsg);
          continue;
        }

        // 构建完整的配置（包含 id 和 source）
        const fullConfig = {
          id: dbTrigger.id,
          name: dbTrigger.name,
          taskName: dbTrigger.taskName,
          cron: dbTrigger.cron,
          enabled: dbTrigger.enabled,
          description: dbTrigger.description,
          params: dbTrigger.params,
          source: ConfigSource.DATABASE
        };

        // 验证完整配置格式
        const validation = validateTriggerConfig(fullConfig);

        if (!validation.success) {
          const errorMsg = `数据库中第 ${index + 1} 条记录 (ID: ${dbTrigger.id}) 验证失败: ${validation.error}`;
          this.logger.error(errorMsg);
          continue;
        }

        const config = validation.data!;
        configs.push(config);
        this.logger.debug(
          `✅ 加载触发器: ${config.name} (ID: ${dbTrigger.id}, 来源: ${ConfigSource.DATABASE})`
        );
      }

      this.logger.log(
        `从数据库加载 ${configs.length}/${dbTriggers.length} 个有效触发器配置`
      );

      return configs;
    } catch (e) {
      const error = toError(e);
      this.logger.error(
        `从数据库加载触发器配置失败: ${error.message}`,
        error.stack
      );
      return [];
    }
  }
}
