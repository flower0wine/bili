import { CronJob, validateCronExpression } from "cron";
import dayjs from "dayjs";
import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { TaskExecutorService } from "@/services/task/task-executor.service";
import {
  ConfigChangeEvent,
  ConfigManager
} from "@/services/task/trigger/config/config.manager";
import { TriggerConfig } from "@/services/task/trigger/config/trigger.schema";
import { ConfigChangeEventType } from "@/services/task/trigger/config/types";
import { toError } from "@/utils/error.util";

/**
 * 基于 ConfigManager 的 Cron 触发器服务
 *
 * 职责：
 * 1. 从 ConfigManager 读取触发器配置
 * 2. 注册启用的触发器到 SchedulerRegistry
 * 3. 处理触发器触发事件，执行关联的任务
 * 4. 管理触发器的生命周期（启动、停止、清理）
 *
 * 设计原则：
 * - 所有触发器都通过 ID 唯一标识，不可注册同一 ID
 * - 只注册启用的触发器
 * - 支持配置变更时自动重新加载和同步
 * - 防止内存泄漏，确保清理资源
 */
@Injectable()
export class CronTriggerManagerService implements OnModuleDestroy {
  private readonly logger = new Logger(CronTriggerManagerService.name);
  private triggerMetadata = new Map<
    string,
    { name: string; taskName: string; source: string }
  >(); // 存储触发器元数据
  private unsubscribe: (() => void) | null = null; // 配置变更监听取消函数

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly taskExecutor: TaskExecutorService,
    private readonly configManager: ConfigManager
  ) {}

  /**
   * 初始化触发器服务
   *
   * 流程：
   * 1. 加载初始配置并同步触发器
   * 2. 注册配置变更监听器（通过 ConfigManager）
   * 3. 当配置变更时自动重新加载和同步
   */
  async initialize(): Promise<void> {
    this.logger.log("初始化 Cron 触发器管理服务...");

    // 加载初始配置
    await this.loadAndSyncTriggers();

    // 注册配置变更监听器
    this.unsubscribe = this.configManager.onConfigChange(
      this.handleConfigChange.bind(this)
    );

    this.logger.log("✅ Cron 触发器管理服务初始化完成");
  }

  /**
   * 模块销毁时的清理
   *
   * 确保所有 Cron 任务都被正确停止和清理，防止内存泄漏
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log("正在清理 Cron 触发器管理服务...");

    // 取消配置变更监听
    if (this.unsubscribe) {
      this.unsubscribe();
      this.logger.debug("已取消配置变更监听");
    }

    // 停止所有 Cron 任务，防止内存泄漏
    try {
      const cronJobs = this.schedulerRegistry.getCronJobs();
      const jobNames = Array.from(cronJobs.keys());

      for (const jobName of jobNames) {
        try {
          const job = this.schedulerRegistry.getCronJob(jobName);
          await job.stop(); // 停止任务
          this.schedulerRegistry.deleteCronJob(jobName);
        } catch (e) {
          const error = toError(e);
          this.logger.warn(`清理任务失败: ${jobName}, 错误: ${error.message}`);
        }
      }

      this.logger.log(`已停止并清理 ${jobNames.length} 个 Cron 任务`);
    } catch (e) {
      const error = toError(e);
      this.logger.error(`清理 Cron 任务失败: ${error.message}`, error.stack);
    }

    this.logger.log("✅ Cron 触发器管理服务清理完成");
  }

  /**
   * 从 ConfigManager 加载并同步触发器配置
   *
   * 流程：
   * 1. 从 ConfigManager 获取所有配置
   * 2. 注册启用的触发器
   * 3. 移除不再存在的触发器
   * 4. 记录同步统计信息
   */
  private async loadAndSyncTriggers(): Promise<void> {
    const startTime = dayjs().valueOf();

    try {
      // 从 ConfigManager 获取所有配置
      this.logger.debug("开始从 ConfigManager 加载触发器配置...");

      await this.configManager.loadAndInitialize();

      const configs = this.configManager.getLoadedConfigs();

      if (configs.length === 0) {
        this.logger.warn("未从 ConfigManager 加载到任何配置");
        return;
      }

      this.logger.log("开始同步触发器");

      // 只注册启用的触发器
      const enabledConfigs = configs.filter((c) => c.enabled);

      const results = await Promise.allSettled(
        enabledConfigs.map((config) => this.registerTrigger(config))
      );

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          this.logger.error(
            `${enabledConfigs[index].name} 注册失败，${result.reason}`
          );
        } else {
          this.logger.debug(`${enabledConfigs[index].name} 注册成功`);
        }
      });

      // 移除不再存在的触发器
      this.removeObsoleteTriggers(configs.map((c) => c.id));

      const elapsed = dayjs().valueOf() - startTime;
      this.logger.log(
        `✅ 触发器同步完成，耗时 ${elapsed}ms，当前注册 ${enabledConfigs.length} 个触发器`
      );
    } catch (e) {
      const error = toError(e);
      this.logger.error(
        `从 ConfigManager 加载触发器失败: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * 处理配置变更事件
   *
   * 当配置发生变更时，重新加载并同步触发器
   *
   * @param event 配置变更事件
   */
  private async handleConfigChange(event: ConfigChangeEvent): Promise<void> {
    const {
      type,
      entry: { config }
    } = event;
    this.logger.log(
      `检测到配置变更事件 (${event.type})，重新加载触发器配置...`
    );

    // 根据变更类型处理
    switch (type) {
      case ConfigChangeEventType.ADD:
        if (config.enabled) {
          await this.registerTrigger(config);
        }
        break;

      case ConfigChangeEventType.UPDATE:
        if (config) {
          await this.registerTrigger(config);
        }
        break;

      case ConfigChangeEventType.DELETE:
        if (config?.id) {
          await this.removeTrigger(config.id);
        }
        break;

      default:
        // 对于其他事件类型，重新加载所有配置
        await this.loadAndSyncTriggers();
    }
  }

  /**
   * 移除已经不再配置中的触发器
   *
   * 流程：
   * 1. 获取当前注册的所有触发器
   * 2. 找出不在配置中的触发器
   * 3. 删除这些触发器
   *
   * @param currentTriggerIds 当前配置中的所有触发器 ID
   */
  private removeObsoleteTriggers(currentTriggerIds: string[]): void {
    const registeredTriggers = this.schedulerRegistry.getCronJobs();
    const registeredJobNames = Array.from(registeredTriggers.keys());

    // 收集需要删除的触发器 ID
    const toRemove: string[] = [];
    for (const jobName of registeredJobNames) {
      // jobName 格式为 "cron_{id}"
      if (jobName.startsWith("cron_")) {
        const triggerId = jobName.substring(5); // 移除 "cron_" 前缀

        if (!currentTriggerIds.includes(triggerId)) {
          toRemove.push(triggerId);
        }
      }
    }

    // 统一删除
    if (toRemove.length > 0) {
      for (const triggerId of toRemove) {
        void this.removeTrigger(triggerId);
      }
      this.logger.log(`移除 ${toRemove.length} 个已废弃的触发器`);
    }
  }

  /**
   * 注册 Cron 触发器
   *
   * 流程：
   * 1. 验证配置的 ID 存在
   * 2. 验证 Cron 表达式合法性
   * 3. 检测 Cron 表达式是否变更，如需要则重建
   * 4. 创建并启动 CronJob
   * 5. 记录触发器元数据
   *
   * 注意：
   * - CronJob 不支持运行时修改 cron 表达式，必须重建
   * - 防止内存泄漏，旧任务必须先停止再删除
   *
   * @param config 规范化的触发器配置
   */
  private async registerTrigger(config: TriggerConfig): Promise<void> {
    try {
      // 验证 ID 存在
      if (!config.id) {
        this.logger.error(
          `触发器配置缺少必填字段 id: ${JSON.stringify(config)}`
        );
        return;
      }

      // 验证 Cron 表达式合法性
      if (!validateCronExpression(config.cron).valid) {
        this.logger.error(
          `触发器 ${config.name} (ID: ${config.id}) 的 Cron 表达式非法: ${config.cron}`
        );
        return;
      }

      const triggerName = `cron_${config.id}`;
      let needsRecreate = false;

      // 检查触发器是否已存在
      if (this.schedulerRegistry.doesExist("cron", triggerName)) {
        const existingJob = this.schedulerRegistry.getCronJob(triggerName);

        // CronJob 不支持运行时修改 cron 表达式，必须重建
        // 比较现有 cron 表达式和新的是否相同
        const existingCronTime = existingJob.cronTime;
        const existingCronPattern = existingCronTime.source;

        let pattern: string | null = null;

        if (typeof existingCronPattern !== "string") {
          pattern = existingCronPattern.toISO();
        }

        if (pattern && pattern !== config.cron) {
          this.logger.debug(
            `触发器 ${config.name} (ID: ${config.id}) 的 Cron 表达式已变更 (${pattern} -> ${config.cron})，需要重建`
          );
          needsRecreate = true;
        }
      } else {
        needsRecreate = true;
      }

      // 需要重建时，先完全删除旧任务
      if (needsRecreate) {
        if (this.schedulerRegistry.doesExist("cron", triggerName)) {
          try {
            const existingJob = this.schedulerRegistry.getCronJob(triggerName);
            await existingJob.stop(); // 停止旧任务
            this.schedulerRegistry.deleteCronJob(triggerName); // 从注册表删除
            this.logger.debug(
              `已停止并删除旧触发器: ${config.name} (ID: ${config.id})`
            );
          } catch (e) {
            const error = toError(e);
            this.logger.warn(
              `删除旧触发器失败: ${config.name} (ID: ${config.id}), 错误: ${error.message}`
            );
          }
        }

        // 创建全新的 CronJob 实例
        const cronJob = new CronJob(
          config.cron,
          () => {
            this.handleTrigger(config);
          },
          null, // onComplete
          false, // start: false，稍后手动启动
          null, // timeZone
          null, // context
          false // runOnInit: false，不立即执行
        );

        // 注册到调度器
        this.schedulerRegistry.addCronJob(triggerName, cronJob);
        cronJob.start();

        // 记录触发器元数据
        this.triggerMetadata.set(config.id, {
          name: config.name,
          taskName: config.taskName,
          source: config.source
        });

        this.logger.log(
          `✅ Cron 触发器已注册: ${config.name} (Source: ${config.source}, ID: ${config.id}) -> 任务: ${config.taskName} | Cron: ${config.cron}`
        );
      } else {
        this.logger.debug(
          `触发器 ${config.name} (ID: ${config.id}) 配置未变更，跳过重建`
        );
      }
    } catch (e) {
      const error = toError(e);
      this.logger.error(
        `❌ 注册触发器失败: ${config.name} (ID: ${config.id}), 错误: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * 移除触发器
   *
   * 流程：
   * 1. 检查触发器是否存在
   * 2. 停止定时器
   * 3. 从注册表删除
   * 4. 清理元数据
   *
   * 注意：
   * - 必须先停止任务，再删除，防止内存泄漏
   *
   * @param triggerId 触发器 ID
   */
  private async removeTrigger(triggerId: string): Promise<void> {
    const fullName = `cron_${triggerId}`;
    if (this.schedulerRegistry.doesExist("cron", fullName)) {
      try {
        const job = this.schedulerRegistry.getCronJob(fullName);
        await job.stop(); // 先停止定时器
        this.schedulerRegistry.deleteCronJob(fullName);

        // 清理元数据
        this.triggerMetadata.delete(triggerId);

        this.logger.log(`✅ 触发器已停止并移除: ${triggerId}`);
      } catch (e) {
        const error = toError(e);
        this.logger.error(
          `❌ 移除触发器失败: ${triggerId}, 错误: ${error.message}`,
          error.stack
        );
      }
    } else {
      this.logger.debug(`触发器不存在，无需移除: ${triggerId}`);
    }
  }

  /**
   * 获取所有触发器配置（包括启用和禁用的）
   *
   * 从 ConfigManager 获取所有配置，而不仅仅是已注册的触发器
   * 这用于 API 返回完整的触发器列表给前端
   *
   * @returns 规范化的触发器配置列表
   */
  getAllTriggerConfigs(): TriggerConfig[] {
    return this.configManager.getLoadedConfigs();
  }

  /**
   * 处理触发器触发事件
   *
   * 流程：
   * 1. 记录触发事件日志
   * 2. 异步执行任务
   * 3. 捕获错误避免未处理的 Promise rejection
   *
   * 注意：
   * - 触发器只负责触发任务，不等待任务执行完成
   * - 任务异步执行，触发器立即返回
   *
   * @param config 触发器配置
   */
  private handleTrigger(config: TriggerConfig): void {
    this.logger.log({
      triggerId: config.id,
      triggerName: config.name,
      taskName: config.taskName,
      message: "触发器触发，异步执行任务"
    });

    // 异步执行任务，不等待结果
    this.taskExecutor
      .execute(config.taskName, config.params, "cron", config.name)
      .catch((e) => {
        const error = toError(e);
        // 捕获错误避免未处理的 Promise rejection
        this.logger.error({
          triggerId: config.id,
          triggerName: config.name,
          taskName: config.taskName,
          error: error.message,
          message: "异步任务执行失败"
        });
      });
  }
}
