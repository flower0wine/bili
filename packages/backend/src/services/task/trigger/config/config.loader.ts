import { Injectable, Logger } from "@nestjs/common";
import { ConfigProviderManager } from "@/services/task/trigger/config/config-provider.manager";
import { validateTriggerConfig } from "@/services/task/trigger/config/trigger.schema";
import {
  ConfigSource,
  ITriggerConfigProvider,
  TriggerConfigEntry
} from "@/services/task/trigger/config/types";
import { toError } from "@/utils/error.util";

/**
 * 配置加载器
 *
 * 职责：
 * - 从配置提供商加载配置
 * - 对加载的配置进行校验
 * - 检测配置冲突
 * - 返回加载结果和错误信息
 *
 * 设计原则：
 * - 单一职责：只负责加载和校验，不负责存储
 * - 无状态：不维护配置状态，每次加载都是独立的
 * - 错误详细：提供详细的错误信息便于调试
 */
@Injectable()
export class ConfigLoader {
  private readonly logger = new Logger(ConfigLoader.name);

  constructor(private readonly providerManager: ConfigProviderManager) {}

  /**
   * 从单个提供商加载配置
   *
   * 流程：
   * 1. 调用提供商的 load() 方法获取配置
   * 2. 对每个配置进行校验
   * 3. 转换为配置条目（包含提供商信息）
   * 4. 返回加载结果
   *
   */
  async loadFromProvider(provider: ITriggerConfigProvider) {
    const providerName = provider.getName();
    const entries: TriggerConfigEntry[] = [];

    try {
      this.logger.debug(`开始从提供商 ${providerName} 加载配置...`);
      const rawConfigs = await provider.load();

      // 对每个配置进行校验
      for (let index = 0; index < rawConfigs.length; index++) {
        const config = rawConfigs[index];

        // 验证配置格式
        const result = validateTriggerConfig(config);
        if (result.success && result.data) {
          entries.push({
            config: result.data,
            providerName,
            source: result.data.source as ConfigSource,
            loadedAt: new Date()
          });
          this.logger.debug(
            `✅ 校验通过: ${result.data.name} (ID: ${result.data.id})`
          );
        } else {
          const errorMsg = `配置校验失败 [${(config as any).id}]: ${result.error}`;
          this.logger.warn(errorMsg);
        }
      }

      this.logger.debug(
        `✅ 从 ${providerName} 加载 ${entries.length} 个有效配置`
      );
    } catch (e) {
      const error = toError(e);
      const errorMsg = `从提供商 ${providerName} 加载配置失败: ${error.message}`;
      this.logger.error(errorMsg, error.stack);
    }

    return { entries };
  }

  /**
   * 从所有提供商加载配置
   *
   * 流程：
   * 1. 获取所有已注册的提供商
   * 2. 并发调用 loadFromProvider 加载配置（已转换为配置条目）
   * 3. 聚合结果
   *
   */
  async loadFromAllProviders(): Promise<{
    allEntries: TriggerConfigEntry[];
  }> {
    const providers = this.providerManager.getProviders();

    if (providers.length === 0) {
      this.logger.warn("没有注册任何配置提供商");
      return { allEntries: [] };
    }

    // 并发加载所有提供商的配置
    const loadPromises = providers.map((provider) =>
      this.loadFromProvider(provider)
    );

    const results = await Promise.allSettled(loadPromises);

    const allEntries: TriggerConfigEntry[] = [];

    // 处理加载结果
    for (let index = 0; index < results.length; index++) {
      const result = results[index];
      const provider = providers[index];

      if (result.status === "fulfilled") {
        allEntries.push(...result.value.entries);
      } else {
        const errorMsg = `提供商 ${provider.getName()} 加载失败: ${result.reason?.message || result.reason}`;
        this.logger.error(errorMsg);
      }
    }

    return { allEntries };
  }
}
