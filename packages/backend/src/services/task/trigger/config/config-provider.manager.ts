import { Injectable, Logger } from "@nestjs/common";
import {
  ConfigChangeEventType,
  ConfigSource,
  ITriggerConfigProvider,
  TriggerConfigEntry
} from "@/services/task/trigger/config/types";
import { toError } from "@/utils/error.util";

/**
 * 配置提供商管理器
 *
 * 职责：
 * - 管理所有配置源提供商的注册和生命周期
 * - 与配置提供商进行交互（加载、变更通知等）
 * - 维护提供商的元数据和状态
 * - 通知提供商配置变更（可选处理）
 *
 * 设计原则：
 * - 单一职责：只负责提供商管理，不负责配置存储或变更通知
 * - 开放扩展：支持动态注册新的提供商
 * - 错误隔离：一个提供商的错误不影响其他提供商
 * - 可选处理：提供商可选择是否处理变更通知
 */
@Injectable()
export class ConfigProviderManager {
  private readonly logger = new Logger(ConfigProviderManager.name);
  private readonly providers: ITriggerConfigProvider[] = [];
  private readonly providerMap = new Map<
    ConfigSource,
    ITriggerConfigProvider
  >();

  /**
   * 注册配置源提供者
   * @param provider 配置提供者实例
   */
  registerProvider(provider: ITriggerConfigProvider): void {
    const source = provider.getSource();
    const name = provider.getName();

    // 检查是否已经注册了相同源的提供商
    if (this.providerMap.has(source)) {
      this.logger.warn(
        `配置源 ${source} 已经注册过提供商，将被新的提供商 ${name} 覆盖`
      );
    }

    this.providers.push(provider);
    this.providerMap.set(source, provider);
    this.logger.debug(`✅ 注册配置源提供者: ${name} (${source})`);
  }

  /**
   * 获取所有已注册的提供商
   * @returns 提供商列表
   */
  getProviders(): ITriggerConfigProvider[] {
    return [...this.providers];
  }

  /**
   * 获取指定源的提供商
   * @param source 配置源
   * @returns 提供商实例，如果不存在则返回 undefined
   */
  getProvider(source: ConfigSource): ITriggerConfigProvider | undefined {
    return this.providerMap.get(source);
  }

  /**
   * 获取提供商数量
   * @returns 提供商数量
   */
  getProviderCount(): number {
    return this.providers.length;
  }

  /**
   * 检查是否存在指定源的提供商
   * @param source 配置源
   * @returns 是否存在
   */
  hasProvider(source: ConfigSource): boolean {
    return this.providerMap.has(source);
  }

  /**
   * 通知提供商配置已变更
   * 提供商可选择是否处理此通知
   * @param eventType 变更事件类型
   * @param entry 配置条目（DELETE 时为 undefined）
   */
  notifyConfigChanged(
    eventType: ConfigChangeEventType,
    entry?: TriggerConfigEntry
  ): void {
    if (!entry) {
      this.logger.warn(`通知配置变更时缺少配置条目`);
      return;
    }

    const provider = this.providerMap.get(entry.source);
    if (!provider) {
      this.logger.warn(`未找到源为 ${entry.source} 的提供商，无法通知配置变更`);
      return;
    }

    provider
      .onConfigChanged?.(eventType, entry)
      .then(() => {
        this.logger.debug(
          `通知提供商 ${provider.getName()} 配置已${this.getEventTypeLabel(eventType)}: ${entry.config.id}`
        );
      })
      .catch((e) => {
        const error = toError(e);
        this.logger.error(
          `通知提供商 ${provider.getName()} 配置变更失败: ${error.message}`
        );
      });
  }

  /**
   * 获取事件类型的中文标签
   * @param eventType 事件类型
   * @returns 中文标签
   */
  private getEventTypeLabel(eventType: ConfigChangeEventType): string {
    switch (eventType) {
      case ConfigChangeEventType.ADD:
        return "添加";
      case ConfigChangeEventType.UPDATE:
        return "更新";
      case ConfigChangeEventType.DELETE:
        return "删除";
      default:
        throw new Error(`未知 ConfigChangeEventType 类型: ${eventType}`);
    }
  }
}
