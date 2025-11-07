import { Injectable, Logger } from "@nestjs/common";

/**
 * 配置源枚举
 */
export enum ConfigSource {
  CONFIG_FILE = "config_file",
  DATABASE = "database"
}

export interface TriggerConfigSource {
  id: string; // 唯一标识符（UUID）
  name: string;
  taskName: string;
  cron: string;
  params?: any;
  enabled: boolean;
  description?: string;
  source: ConfigSource; // 配置来源标识
}

/**
 * 配置变更监听器类型
 */
export type ConfigChangeListener = (
  configs: TriggerConfigSource[]
) => void | Promise<void>;

/**
 * 配置源接口 - 对数据来源开放
 */
export interface ITriggerConfigProvider {
  /**
   * 提供者名称（用于日志和调试）
   */
  getName(): string;

  /**
   * 加载配置
   */
  load(): Promise<TriggerConfigSource[]>;

  /**
   * 注册配置变更监听器（可选）
   * 配置源可以选择性实现此方法，当配置变更时主动通知
   * 如果不实现，则配置源不支持自动更新
   */
  onConfigChange?(listener: ConfigChangeListener): void;

  /**
   * 移除配置变更监听器（可选）
   */
  offConfigChange?(listener: ConfigChangeListener): void;
}

/**
 * 触发器配置加载器
 *
 * 职责：
 * 1. 管理多个配置源提供者
 * 2. 合并来自不同配置源的配置
 * 3. 支持配置源主动推送变更（基于 Hook）
 *
 * 设计原则：
 * - 对数据来源开放，不关心数据从哪里来
 * - 支持配置源可选的变更通知机制
 * - 不进行定期轮询，由配置源决定何时推送变更
 */
@Injectable()
export class TriggerConfigLoaderService {
  private readonly logger = new Logger(TriggerConfigLoaderService.name);
  private readonly providers: ITriggerConfigProvider[] = [];
  private configChangeListener: ConfigChangeListener | null = null;

  /**
   * 注册配置源提供者
   */
  registerProvider(provider: ITriggerConfigProvider) {
    this.providers.push(provider);
    this.logger.log(`注册配置源提供者: ${provider.getName()}`);

    // 如果提供者支持变更通知，注册监听器
    if (provider.onConfigChange && this.configChangeListener) {
      provider.onConfigChange(this.configChangeListener);
      this.logger.debug(`已为配置源 ${provider.getName()} 注册变更监听器`);
    }
  }

  /**
   * 设置配置变更监听器
   * 当任何配置源发生变更时，会触发此回调
   */
  setConfigChangeListener(listener: ConfigChangeListener) {
    this.configChangeListener = listener;

    // 为已注册的提供者注册监听器
    for (const provider of this.providers) {
      if (provider.onConfigChange) {
        provider.onConfigChange(listener);
        this.logger.debug(`已为配置源 ${provider.getName()} 注册变更监听器`);
      }
    }
  }

  /**
   * 加载所有触发器配置
   *
   * 从各个配置源加载，不同来源的同名触发器可以共存，通过UUID区分
   */
  async loadAllConfigs(): Promise<TriggerConfigSource[]> {
    const configMap = new Map<string, TriggerConfigSource>();
    const loadStats: Record<string, number> = {};

    // 从各个配置源加载配置
    for (const provider of this.providers) {
      try {
        const providerName = provider.getName();
        const configs = await provider.load();
        loadStats[providerName] = configs.length;

        for (const config of configs) {
          // 使用UUID作为唯一键，允许同名但来源不同的触发器共存
          if (!configMap.has(config.id)) {
            configMap.set(config.id, config);
            this.logger.debug(
              `加载触发器: ${config.name} (ID: ${config.id}, 来源: ${config.source})`
            );
          } else {
            this.logger.warn(
              `触发器ID冲突: ${config.id}，触发器 ${config.name} 来自 ${providerName} 被跳过`
            );
          }
        }
      } catch (error) {
        this.logger.error(
          `从配置源 ${provider.getName()} 加载配置失败: ${error.message}`,
          error.stack
        );
      }
    }

    const result = Array.from(configMap.values());

    this.logger.log(
      `加载触发器配置完成: ${Object.entries(loadStats)
        .map(([name, count]) => `${name} ${count}个`)
        .join(", ")}, 总计 ${result.length} 个`
    );

    return result;
  }
}
