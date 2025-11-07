import { createHash } from "crypto";
import { CronJob } from "cron";
import dayjs from "dayjs";
import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { PrismaService } from "@/services/common/prisma.service";
import { TaskExecutorService } from "../task/task-executor.service";
import { TriggerConfigLoaderService } from "./config/trigger-config-loader.service";

export interface CronTriggerConfig {
  id?: string; // 唯一标识符(UUID)
  name: string;
  taskName: string;
  cron: string;
  enabled: boolean;
  params?: any;
  description?: string;
}

/**
 * Cron 触发器服务
 * 负责基于时间调度触发任务执行，与任务逻辑完全解耦
 */
@Injectable()
export class CronTriggerService implements OnModuleDestroy {
  private readonly logger = new Logger(CronTriggerService.name);
  private checkInterval: NodeJS.Timeout;
  private isLoadingConfigs = false; // 防止并发加载
  private configHash = ""; // 配置哈希,用于变更检测
  private runningTasks = new Map<string, boolean>(); // 任务执行锁

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly taskExecutor: TaskExecutorService,
    private readonly prisma: PrismaService,
    private readonly configLoader: TriggerConfigLoaderService
  ) {}

  /**
   * 启动定时检查（从配置源同步触发器配置）
   */
  async startPeriodicSync(intervalMs: number = 60000) {
    this.logger.log("启动触发器定期同步");
    await this.loadTriggersFromAllSources(); // 立即加载一次

    this.checkInterval = setInterval(async () => {
      await this.loadTriggersFromAllSources();
    }, intervalMs);
  }

  onModuleDestroy() {
    this.logger.log("正在清理触发器服务...");

    // 清理定时同步
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.logger.debug("已清理配置同步定时器");
    }

    // 停止所有 Cron 任务,防止内存泄漏
    try {
      const cronJobs = this.schedulerRegistry.getCronJobs();
      const jobNames = Array.from(cronJobs.keys());

      for (const jobName of jobNames) {
        try {
          const job = this.schedulerRegistry.getCronJob(jobName);
          job.stop(); // 停止任务
          this.schedulerRegistry.deleteCronJob(jobName);
        } catch (err) {
          this.logger.warn(`清理任务失败: ${jobName}, 错误: ${err.message}`);
        }
      }

      this.logger.log(`已停止并清理 ${jobNames.length} 个 Cron 任务`);
    } catch (error) {
      this.logger.error(`清理 Cron 任务失败: ${error.message}`, error.stack);
    }

    // 清理运行状态
    this.runningTasks.clear();
    this.logger.log("触发器服务清理完成");
  }

  /**
   * 从所有配置源加载触发器配置
   * 防止并发执行,支持变更检测
   */
  private async loadTriggersFromAllSources() {
    // 防止并发竞争
    if (this.isLoadingConfigs) {
      this.logger.debug("配置加载正在进行中,跳过本次同步");
      return;
    }

    this.isLoadingConfigs = true;
    const startTime = dayjs().valueOf();

    try {
      // 使用配置加载器加载所有配置
      const configs = await this.configLoader.loadAllConfigs();

      // 计算配置哈希,检测变更
      const newConfigHash = this.computeConfigHash(configs);
      if (newConfigHash === this.configHash) {
        this.logger.debug(
          `配置未变更 (hash: ${newConfigHash.substring(0, 8)}...),跳过同步`
        );
        return;
      }

      this.logger.log(
        `检测到配置变更 (旧: ${this.configHash.substring(0, 8)}... -> 新: ${newConfigHash.substring(0, 8)}...),开始同步触发器`
      );
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
          description: config.description
        });
      }

      // 移除不再存在的触发器
      await this.removeObsoleteTriggers(configs.map((c) => c.id));

      const elapsed = dayjs().valueOf() - startTime;
      this.logger.log(
        `触发器同步完成,耗时 ${elapsed}ms,当前注册 ${enabledConfigs.length} 个触发器`
      );
    } catch (error) {
      this.logger.error(
        `从配置源加载触发器失败: ${error.message}`,
        error.stack
      );
    } finally {
      this.isLoadingConfigs = false;
    }
  }

  /**
   * 计算配置哈希,用于变更检测
   */
  private computeConfigHash(configs: any[]): string {
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
   * 先收集要删除的ID,再统一删除,避免迭代器失效
   */
  private async removeObsoleteTriggers(currentTriggerIds: string[]) {
    const registeredTriggers = this.schedulerRegistry.getCronJobs();
    const registeredIds = Array.from(registeredTriggers.keys());

    // 先收集需要删除的触发器ID
    const toRemove: string[] = [];
    for (const registeredId of registeredIds) {
      // 提取触发器ID（去除 "cron_" 前缀）
      const triggerId = registeredId.replace(/^cron_/, "");

      if (!currentTriggerIds.includes(triggerId)) {
        toRemove.push(triggerId);
      }
    }

    // 统一删除,避免迭代器失效
    if (toRemove.length > 0) {
      this.logger.log(
        `准备移除 ${toRemove.length} 个已废弃的触发器: ${toRemove.join(", ")}`
      );
      for (const triggerId of toRemove) {
        this.removeTrigger(triggerId);
      }
    }
  }

  /**
   * 注册 Cron 触发器
   * 防止内存泄漏,支持安全删除和重新注册
   */
  async registerTrigger(config: CronTriggerConfig) {
    try {
      // 使用 ID 作为触发器唯一标识(如果有),否则使用 name
      const triggerKey = config.id || config.name;
      const triggerName = `cron_${triggerKey}`;

      // 如果触发器已存在,先安全删除
      if (this.schedulerRegistry.doesExist("cron", triggerName)) {
        try {
          const existingJob = this.schedulerRegistry.getCronJob(triggerName);
          existingJob.stop(); // 停止旧任务,防止内存泄漏
          this.schedulerRegistry.deleteCronJob(triggerName);
          this.logger.debug(
            `已停止并删除旧触发器: ${triggerName} (${config.name})`
          );
        } catch (err) {
          this.logger.warn(
            `删除旧触发器失败: ${triggerName}, 错误: ${err.message}`
          );
        }
      }

      // 创建新的 Cron Job
      const cronJob = new CronJob(
        config.cron,
        async () => {
          await this.handleTrigger(config);
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
        `✅ Cron 触发器已注册: ${config.name}${config.id ? ` (ID: ${config.id})` : ""} -> 任务: ${config.taskName} | Cron: ${config.cron}`
      );
    } catch (error) {
      this.logger.error(
        `❌ 注册触发器失败: ${config.name}, 错误: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * 移除触发器
   * 确保先停止任务,再删除,防止内存泄漏
   */
  removeTrigger(triggerId: string) {
    const fullName = `cron_${triggerId}`;
    if (this.schedulerRegistry.doesExist("cron", fullName)) {
      try {
        const job = this.schedulerRegistry.getCronJob(fullName);
        job.stop(); // 先停止定时器
        this.schedulerRegistry.deleteCronJob(fullName);
        this.runningTasks.delete(triggerId); // 清理执行锁
        this.logger.log(`✅ 触发器已停止并移除: ${triggerId}`);
      } catch (error) {
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
   * 支持任务执行锁,防止并发执行导致资源耗尽
   */
  private async handleTrigger(config: CronTriggerConfig) {
    const lockKey = config.id || config.name;

    // 检查任务是否正在执行
    if (this.runningTasks.get(lockKey)) {
      this.logger.warn(
        `⚠ 触发器 ${config.name} (任务: ${config.taskName}) 上次执行尚未完成,跳过本次触发`
      );
      return;
    }

    this.runningTasks.set(lockKey, true);
    const startTime = dayjs().valueOf();

    this.logger.log(
      `⏰ 触发器触发: ${config.name} -> 执行任务: ${config.taskName}${config.id ? ` (ID: ${config.id})` : ""}`
    );

    try {
      // 通过任务执行器执行任务
      await this.taskExecutor.execute(
        config.taskName,
        config.params,
        "cron",
        config.name // 传递触发器名称
      );

      const elapsed = dayjs().valueOf() - startTime;
      this.logger.log(`✅ 触发器执行成功: ${config.name}, 耗时: ${elapsed}ms`);
    } catch (error) {
      const elapsed = dayjs().valueOf() - startTime;
      this.logger.error(
        `❌ 触发器执行失败: ${config.name} (任务: ${config.taskName}), 耗时: ${elapsed}ms, 错误: ${error.message}`,
        error.stack
      );
    } finally {
      this.runningTasks.delete(lockKey);
    }
  }
}
