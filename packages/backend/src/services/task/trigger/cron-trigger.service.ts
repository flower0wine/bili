import { createHash } from "crypto";
import { CronJob, validateCronExpression } from "cron";
import dayjs from "dayjs";
import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { toError } from "@/utils/error.util";
import { TaskExecutorService } from "../task-executor.service";
import {
  ConfigSource,
  TriggerConfigLoaderService,
  TriggerConfigSource
} from "./config/trigger-config-loader.service";

export interface CronTriggerConfig {
  id: string; // 唯一标识符(UUID) - 必填
  name: string;
  taskName: string;
  cron: string;
  enabled: boolean;
  params?: any;
  description?: string;
  source: ConfigSource;
}

/**
 * Cron 触发器服务
 * 负责基于时间调度触发任务执行，与任务逻辑完全解耦
 */
@Injectable()
export class CronTriggerService implements OnModuleDestroy {
  private readonly logger = new Logger(CronTriggerService.name);
  private configHash = ""; // 配置哈希,用于变更检测

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly taskExecutor: TaskExecutorService,
    private readonly configLoader: TriggerConfigLoaderService
  ) {}

  /**
   * 初始化触发器服务
   * 从配置源加载初始配置，并注册变更监听器
   */
  async initialize() {
    this.logger.log("初始化触发器服务...");

    // 加载初始配置
    await this.loadAndSyncTriggers();

    // 注册配置变更监听器
    this.configLoader.setConfigChangeListener(async () => {
      this.logger.log("检测到配置源变更,开始重新加载配置...");
      await this.loadAndSyncTriggers();
    });

    this.logger.log("触发器服务初始化完成");
  }

  async onModuleDestroy() {
    this.logger.log("正在清理触发器服务...");

    // 停止所有 Cron 任务,防止内存泄漏
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

    this.logger.log("触发器服务清理完成");
  }

  /**
   * 从所有配置源加载并同步触发器配置
   * 支持变更检测，只有配置变更时才重新注册
   */
  private async loadAndSyncTriggers() {
    const startTime = dayjs().valueOf();

    try {
      // 使用配置加载器加载所有配置
      const configs = await this.configLoader.loadAllConfigs();

      // 计算配置哈希,检测变更
      const newConfigHash = this.computeConfigHash(configs);
      if (newConfigHash === this.configHash) {
        this.logger.debug("配置未变更,跳过同步");
        return;
      }

      this.logger.log("检测到配置变更,开始同步触发器");
      this.configHash = newConfigHash;

      // 只注册启用的触发器
      const enabledConfigs = configs.filter((c) => c.enabled);

      for (const config of enabledConfigs) {
        await this.registerTrigger({
          id: config.id,
          name: config.name,
          taskName: config.taskName,
          cron: config.cron,
          enabled: config.enabled,
          params: config.params,
          description: config.description,
          source: config.source
        });
      }

      // 移除不再存在的触发器
      this.removeObsoleteTriggers(configs.map((c) => c.id));

      const elapsed = dayjs().valueOf() - startTime;
      this.logger.log(
        `触发器同步完成,耗时 ${elapsed}ms,当前注册 ${enabledConfigs.length} 个触发器`
      );
    } catch (e) {
      const error = toError(e);
      this.logger.error(
        `从配置源加载触发器失败: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * 计算配置哈希,用于变更检测
   */
  private computeConfigHash(configs: TriggerConfigSource[]) {
    const configStr = JSON.stringify(
      configs.map((c) => ({
        id: c.id,
        name: c.name,
        taskName: c.taskName,
        cron: c.cron,
        enabled: c.enabled,
        params: c.params
      }))
    );
    return createHash("sha256").update(configStr).digest("hex");
  }

  /**
   * 移除已经不再配置中的触发器
   * 统一使用 ID 作为键,确保准确匹配
   */
  removeObsoleteTriggers(currentTriggerIds: string[]) {
    const registeredTriggers = this.schedulerRegistry.getCronJobs();
    const registeredJobNames = Array.from(registeredTriggers.keys());

    // 收集需要删除的触发器ID
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
   * 1. 强制要求 ID 存在
   * 2. 验证 Cron 表达式合法性
   * 3. 检测 Cron 表达式变更,完全重建 CronJob
   * 4. 防止内存泄漏
   */
  async registerTrigger(config: CronTriggerConfig) {
    try {
      // 强制要求 ID 存在
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

        // CronJob 不支持运行时修改 cron 表达式,必须重建
        // 比较现有 cron 表达式和新的是否相同
        const existingCronTime = existingJob.cronTime;
        const existingCronPattern = existingCronTime.source;

        let pattern: string | null = null;

        if (typeof existingCronPattern !== "string") {
          pattern = existingCronPattern.toISO();
        }

        if (pattern && pattern !== config.cron) {
          this.logger.debug(
            `触发器 ${config.name} (ID: ${config.id}) 的 Cron 表达式已变更 (${pattern} -> ${config.cron}),需要重建`
          );
          needsRecreate = true;
        }
      } else {
        needsRecreate = true;
      }

      // 需要重建时,先完全删除旧任务
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
          false, // start: false, 稍后手动启动
          null, // timeZone
          null, // context
          false // runOnInit: false, 不立即执行
        );

        // 注册到调度器
        this.schedulerRegistry.addCronJob(triggerName, cronJob);
        cronJob.start();

        this.logger.log(
          `✅ Cron 触发器已注册: ${config.name} (Source: ${config.source}, ID: ${config.id}) -> 任务: ${config.taskName} | Cron: ${config.cron}`
        );
      } else {
        this.logger.debug(
          `触发器 ${config.name} (ID: ${config.id}) 配置未变更,跳过重建`
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
   * 确保先停止任务,再删除,防止内存泄漏
   */
  async removeTrigger(triggerId: string) {
    const fullName = `cron_${triggerId}`;
    if (this.schedulerRegistry.doesExist("cron", fullName)) {
      try {
        const job = this.schedulerRegistry.getCronJob(fullName);
        await job.stop(); // 先停止定时器
        this.schedulerRegistry.deleteCronJob(fullName);
        this.logger.log(`✅ 触发器已停止并移除: ${triggerId}`);
      } catch (e) {
        const error = toError(e);
        this.logger.error(
          `❌ 移除触发器失败: ${triggerId}, 错误: ${error.message}`,
          error.stack
        );
      }
    } else {
      this.logger.debug(`触发器不存在,无需移除: ${triggerId}`);
    }
  }

  /**
   * 处理触发器触发事件
   * 触发器只负责触发任务,不等待任务执行完成
   * 任务异步执行,触发器立即返回
   */
  private handleTrigger(config: CronTriggerConfig) {
    this.logger.log({
      triggerId: config.id,
      triggerName: config.name,
      taskName: config.taskName,
      message: "触发器触发,异步执行任务"
    });

    // 异步执行任务,不等待结果
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
