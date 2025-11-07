// 触发器系统导出
export * from "./cron-trigger.service";
export * from "./trigger.module";

export interface TriggerConfig {
  /**
   * 触发器唯一名称
   */
  name: string;

  /**
   * 要执行的任务名称（必须是已注册的任务）
   */
  taskName: string;

  /**
   * Cron 表达式
   */
  cron: string;

  /**
   * 任务参数
   */
  params?: Record<string, any>;

  /**
   * 是否启用
   */
  enabled: boolean;

  /**
   * 触发器描述
   */
  description?: string;
}
