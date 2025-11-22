import { Injectable, Logger } from "@nestjs/common";
import { ConfigProviderManager } from "@/services/task/trigger/config/config-provider.manager";
import { ConfigLoader } from "@/services/task/trigger/config/config.loader";
import { TriggerConfig } from "@/services/task/trigger/config/trigger.schema";
import {
  ConfigChangeEventType,
  TriggerConfigEntry
} from "@/services/task/trigger/config/types";
import { toError } from "@/utils/error.util";

/**
 * 配置变更事件类型
 */
export interface ConfigChangeEvent {
  type: ConfigChangeEventType;
  entry: TriggerConfigEntry;
}

/**
 * 配置变更监听器类型
 */
export type ConfigChangeListener = (event: ConfigChangeEvent) => Promise<void>;

/**
 * 配置存储器
 *
 * 职责：
 * - 存储所有加载的配置（TriggerConfigEntry）
 * - 管理配置变更监听器
 * - 接收外部配置变更请求
 * - 检测配置冲突
 * - 通知配置提供商管理器进行变更
 *
 * 设计原则：
 * - 单一职责：只负责存储和变更通知
 * - 冲突检测：在存储前检测 ID 冲突
 * - 错误隔离：监听器异常不影响其他监听器
 * - 事件驱动：通过事件通知外部系统
 */
@Injectable()
export class ConfigManager {
  private readonly logger = new Logger(ConfigManager.name);
  private readonly configMap = new Map<string, TriggerConfigEntry>();
  private readonly changeListeners: ConfigChangeListener[] = [];

  constructor(
    private readonly providerManager: ConfigProviderManager,
    private readonly configLoader: ConfigLoader
  ) {
    this.loadAndInitialize().catch((e) => {
      const error = toError(e);
      this.logger.error(`加载配置失败: ${error.message}`, error.stack);
    });
  }

  /**
   * 从配置加载器加载配置并初始化存储器
   * @throws 如果加载过程中出现错误
   */
  async loadAndInitialize(): Promise<void> {
    this.logger.debug("开始从配置加载器加载配置...");

    // 从所有提供商加载配置（已转换为配置条目）
    const { allEntries } = await this.configLoader.loadFromAllProviders();

    if (allEntries.length === 0) {
      this.logger.warn("未加载到任何配置");
      return;
    }

    // 初始化存储器
    this.initialize(allEntries);
  }

  /**
   * 初始化存储器（加载初始配置）
   * @param entries 初始配置条目列表
   */
  initialize(entries: TriggerConfigEntry[]): void {
    this.configMap.clear();

    for (const entry of entries) {
      // 检测冲突
      if (this.configMap.has(entry.config.id)) {
        const existing = this.configMap.get(entry.config.id)!;
        throw new Error(
          `配置 ID 冲突: ${entry.config.id}，来自 ${entry.providerName} 的配置 "${entry.config.name}" 与来自 ${existing.providerName} 的配置 "${existing.config.name}" 冲突，后者被跳过`
        );
      }

      this.configMap.set(entry.config.id, entry);
    }

    this.logger.debug(`✅ 初始化配置存储，加载 ${this.configMap.size} 个配置`);
  }

  /**
   * 添加配置
   * @param entry 配置条目
   * @throws 如果配置 ID 已存在
   */
  addConfig(entry: TriggerConfigEntry): void {
    if (this.configMap.has(entry.config.id)) {
      const existing = this.configMap.get(entry.config.id)!;
      throw new Error(
        `配置 ID 冲突: ${entry.config.id}，已存在来自 ${existing.providerName} 的配置`
      );
    }

    this.configMap.set(entry.config.id, entry);
    this.logger.debug(
      `✅ 添加配置: ${entry.config.name} (ID: ${entry.config.id})`
    );

    // 通知提供商配置已变更
    this.providerManager.notifyConfigChanged(ConfigChangeEventType.ADD, entry);

    // 发送配置变更事件
    void this.emitConfigChange({
      type: ConfigChangeEventType.ADD,
      entry
    });
  }

  /**
   * 更新配置
   * @param entry 配置条目
   * @throws 如果配置不存在
   */
  updateConfig(entry: TriggerConfigEntry): void {
    if (!this.configMap.has(entry.config.id)) {
      throw new Error(`配置不存在: ${entry.config.id}，无法更新`);
    }

    this.configMap.set(entry.config.id, entry);
    this.logger.debug(
      `✅ 更新配置: ${entry.config.name} (ID: ${entry.config.id})`
    );

    // 通知提供商配置已变更
    this.providerManager.notifyConfigChanged(
      ConfigChangeEventType.UPDATE,
      entry
    );

    // 发送配置变更事件
    void this.emitConfigChange({
      type: ConfigChangeEventType.UPDATE,
      entry
    });
  }

  /**
   * 删除配置
   * @param id 配置 ID
   * @throws 如果配置不存在
   */
  deleteConfig(id: string): void {
    if (!this.configMap.has(id)) {
      throw new Error(`配置不存在: ${id}，无法删除`);
    }

    const entry = this.configMap.get(id)!;
    this.configMap.delete(id);
    this.logger.debug(`✅ 删除配置: ${entry.config.name} (ID: ${id})`);

    // 通知提供商配置已变更
    this.providerManager.notifyConfigChanged(
      ConfigChangeEventType.DELETE,
      entry
    );

    // 发送配置变更事件
    void this.emitConfigChange({
      type: ConfigChangeEventType.DELETE,
      entry
    });
  }

  /**
   * 获取指定 ID 的配置条目
   * @param id 配置 ID
   * @returns 配置条目，如果不存在则返回 undefined
   */
  getConfigEntry(id: string): TriggerConfigEntry | undefined {
    return this.configMap.get(id);
  }

  /**
   * 获取所有已加载的配置
   * @returns 配置列表
   */
  getLoadedConfigs(): TriggerConfig[] {
    return Array.from(this.configMap.values()).map((entry) => entry.config);
  }

  /**
   * 获取所有已加载的配置条目
   * @returns 配置条目列表
   */
  getLoadedConfigEntries(): TriggerConfigEntry[] {
    return Array.from(this.configMap.values());
  }

  /**
   * 获取配置数量
   * @returns 配置数量
   */
  getConfigCount(): number {
    return this.configMap.size;
  }

  /**
   * 清空所有配置
   */
  clear(): void {
    const count = this.configMap.size;
    this.configMap.clear();
    this.logger.debug(`✅ 已清空 ${count} 个配置`);
  }

  /**
   * 订阅配置变更事件
   * @param listener 监听器回调函数
   * @returns 取消订阅函数
   */
  onConfigChange(listener: ConfigChangeListener): () => void {
    this.changeListeners.push(listener);
    this.logger.debug(
      `已注册配置变更监听器，当前监听器数: ${this.changeListeners.length}`
    );

    // 返回取消订阅函数
    return () => {
      const index = this.changeListeners.indexOf(listener);
      if (index > -1) {
        this.changeListeners.splice(index, 1);
        this.logger.debug(
          `已移除配置变更监听器，当前监听器数: ${this.changeListeners.length}`
        );
      }
    };
  }

  /**
   * 取消订阅配置变更事件
   * @param listener 要移除的监听器
   */
  offConfigChange(listener: ConfigChangeListener): void {
    const index = this.changeListeners.indexOf(listener);
    if (index > -1) {
      this.changeListeners.splice(index, 1);
      this.logger.debug(
        `已移除配置变更监听器，当前监听器数: ${this.changeListeners.length}`
      );
    }
  }

  /**
   * 发送配置变更事件给所有监听器
   * @param event 配置变更事件
   */
  private async emitConfigChange(event: ConfigChangeEvent): Promise<void> {
    if (this.changeListeners.length === 0) {
      return;
    }

    this.logger.debug(
      `发送配置变更事件 (${event.type})，通知 ${this.changeListeners.length} 个监听器`
    );

    // 并发执行所有监听器，错误隔离
    const promises = this.changeListeners.map((listener) =>
      Promise.resolve(listener(event)).catch((e) => {
        const error = toError(e);
        this.logger.error(
          `执行配置变更监听器失败: ${error.message}`,
          error.stack
        );
      })
    );

    await Promise.all(promises);
  }
}
