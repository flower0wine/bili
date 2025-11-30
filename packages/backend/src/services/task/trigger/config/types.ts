/**
 * 触发器配置管理系统的共享类型定义
 *
 * 此文件包含所有配置管理系统中使用的公共类型、接口和枚举
 * 避免循环依赖，所有其他模块都应该从此文件导入这些类型
 */

import { type TriggerConfig } from "@/services/task/trigger/config/trigger.schema";

/**
 * 配置源枚举
 */
export enum ConfigSource {
  CONFIG_FILE = "config_file",
  DATABASE = "database"
}

/**
 * 触发器配置变更事件类型
 */
export enum ConfigChangeEventType {
  /** 配置新增 */
  ADD = "add",
  /** 配置更新 */
  UPDATE = "update",
  /** 配置删除 */
  DELETE = "delete",
  /** 全量重新加载 */
  RELOAD = "reload"
}

/**
 * 触发器配置变更事件
 */
export interface ConfigChangeEvent {
  /** 变更类型 */
  type: ConfigChangeEventType;
  /** 变更的配置 */
  configs: TriggerConfig[];
  /** 所有配置（用于 RELOAD 事件） */
  allConfigs?: TriggerConfig[];
}

/**
 * 触发器配置变更监听器类型
 */
export type ConfigChangeListener = (event: ConfigChangeEvent) => Promise<void>;

/**
 * 触发器配置提供者接口
 *
 * 职责：
 * - 从特定数据源加载触发器配置
 * - 提供完整的配置（包括 id 和 source）
 * - 不负责管理监听器
 *
 * 设计原则：
 * - 提供者返回的配置必须包含 ID
 * - 提供者返回的配置必须包含 source
 * - 配置加载器负责验证和合并配置
 * - 配置加载器负责管理和通知监听器
 */
export interface ITriggerConfigProvider {
  /**
   * 提供者名称（用于日志和调试）
   */
  getName(): string;

  /**
   * 获取源类别
   */
  getSource(): ConfigSource;

  /**
   * 加载配置
   * @returns 规范化的触发器配置列表
   */
  load(): Promise<TriggerConfig[]>;

  /**
   * 配置变更通知（可选）
   * 提供商可以实现此方法来处理配置变更事件
   * @param eventType 变更事件类型（ADD、UPDATE、DELETE）
   * @param entry 配置条目（DELETE 时为 undefined）
   */
  onConfigChanged?(
    eventType: ConfigChangeEventType,
    entry?: TriggerConfigEntry
  ): Promise<void>;
}

/**
 * 触发器配置条目（包含来源信息）
 */
export interface TriggerConfigEntry {
  /** 触发器配置 */
  config: TriggerConfig;
  /** 配置来自的提供商名称 */
  providerName: string;
  /** 配置源类别 */
  source: ConfigSource;
  /** 配置加载时间 */
  loadedAt: Date;
}
