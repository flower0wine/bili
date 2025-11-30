import { randomUUID } from "crypto";
import dayjs from "dayjs";
import { Logger } from "nestjs-pino";
import pRetry, { AbortError } from "p-retry";
import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { toError } from "@/utils/error.util";
import {
  TaskCancelledError,
  TaskContext,
  TaskDefinition,
  TaskExecutionLevel,
  TaskExecutionStatus,
  TaskResult,
  TaskSource,
  TaskTimeoutError
} from "./interfaces/task.interface";
import {
  TaskMiddleware,
  TaskMiddlewareChain
} from "./middleware/task-middleware.interface";
import { TaskRegistryService } from "./task-registry.service";

/**
 * 运行中的任务信息
 */
export interface RunningTaskInfo {
  executionId: string;
  taskName: string;
  controller: AbortController;
  context: TaskContext;
  startedAt: Date;
}

/**
 * 任务执行器
 * 职责：
 * 1. 负责实际执行任务
 * 2. 提供带 AbortSignal 的重试机制
 * 3. 提供可取消的超时控制
 * 4. 管理中间件链
 *
 * 不负责：
 * - 任务执行记录（由 PersistenceMiddleware 处理）
 * - 日志记录（由 LoggingMiddleware 处理）
 */
@Injectable()
export class TaskExecutorService implements OnModuleDestroy {
  private readonly middlewareChain = new TaskMiddlewareChain();
  private readonly runningTasks = new Map<string, RunningTaskInfo>();

  constructor(
    private readonly taskRegistry: TaskRegistryService,
    @Inject(Logger) private readonly logger: Logger
  ) {}

  /**
   * 添加中间件
   */
  use(middleware: TaskMiddleware): void {
    this.middlewareChain.add(middleware);
  }

  /**
   * 执行任务
   */
  async execute<P, D>(
    taskName: string,
    params?: P,
    source: TaskSource = TaskSource.MANUAL,
    triggerName?: string,
    signal?: AbortSignal
  ): Promise<TaskResult<D>> {
    const executionId = randomUUID();
    const triggeredAt = dayjs().toDate();
    const startedAt = dayjs().toDate();

    // 获取任务定义
    const task = this.taskRegistry.getTask<P, D>(taskName);
    if (!task) {
      throw new Error(`任务不存在: ${taskName}`);
    }

    const maxRetries = task.options.retries || 0;

    // 创建统一的 AbortController，用于整个任务生命周期
    const taskAbortController = new AbortController();
    const combinedSignal = this.combineSignals(
      signal,
      taskAbortController.signal
    );

    const context: TaskContext = {
      taskName,
      params,
      source,
      executionId,
      triggeredAt,
      triggerName,
      retryCount: 0,
      maxRetries,
      startedAt,
      attemptStartedAt: startedAt,
      signal: combinedSignal,
      status: TaskExecutionStatus.RUNNING,
      logs: []
    };

    let result: TaskResult<D>;

    // 记录正在运行的任务
    this.runningTasks.set(executionId, {
      executionId,
      taskName,
      controller: taskAbortController,
      context,
      startedAt
    });

    try {
      // 执行前置中间件
      const shouldContinue = await this.middlewareChain.executeBefore(context);
      if (!shouldContinue) {
        result = {
          executionId,
          success: false,
          error: "任务被中间件中止执行",
          startedAt,
          finishedAt: dayjs().toDate(),
          duration: dayjs().diff(dayjs(startedAt)),
          retryCount: 0
        };
        return result;
      }

      // 执行任务（带重试）
      const data = await this.executeWithRetry<P, D>({
        task,
        params,
        context
      });

      const finishedAt = dayjs().toDate();
      context.status = TaskExecutionStatus.SUCCESS;
      result = {
        executionId,
        success: true,
        data,
        startedAt,
        finishedAt,
        duration: dayjs(finishedAt).diff(dayjs(startedAt)),
        retryCount: context.retryCount
      };
      context.result = result;

      // 执行后置中间件
      await this.middlewareChain.executeAfter(context);

      return result;
    } catch (error) {
      const finishedAt = dayjs().toDate();
      const isCancelled = error instanceof TaskCancelledError;

      context.status = isCancelled
        ? TaskExecutionStatus.CANCELED
        : TaskExecutionStatus.FAILED;
      result = {
        executionId,
        success: false,
        error: toError(error).message,
        startedAt,
        finishedAt,
        duration: dayjs(finishedAt).diff(dayjs(startedAt)),
        retryCount: context.retryCount,
        cancelled: isCancelled
      };
      context.result = result;

      // 执行错误中间件
      await this.middlewareChain.executeOnError(context, toError(error));

      return result;
    } finally {
      // 清理资源
      this.runningTasks.delete(executionId);
      taskAbortController.abort();
    }
  }

  /**
   * 模块销毁时的清理工作
   * 取消所有正在运行的任务
   */
  async onModuleDestroy() {
    this.logger.log(`正在取消 ${this.runningTasks.size} 个正在运行的任务...`);

    // 取消所有正在运行的任务
    for (const [executionId, taskInfo] of this.runningTasks.entries()) {
      try {
        taskInfo.controller.abort();
        this.logger.debug(`已取消任务执行: ${executionId}`);
      } catch (error) {
        this.logger.warn(
          `取消任务执行失败: ${executionId}, 错误: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    this.runningTasks.clear();
    this.logger.log("任务执行器清理完成");
  }

  /**
   * 获取正在运行的任务映射表
   */
  getRunningTasks(): Map<string, RunningTaskInfo> {
    return this.runningTasks;
  }

  stopRunningTask(executionId: string) {
    const taskInfo = this.runningTasks.get(executionId);
    if (!taskInfo) {
      throw new Error(`任务不存在: ${executionId}`);
    }

    taskInfo.controller.abort();
    taskInfo.context.status = TaskExecutionStatus.CANCELED;
  }

  /**
   * 带重试的任务执行（使用 p-retry 库 + AbortSignal）
   */
  private async executeWithRetry<P, D>({
    task,
    params,
    context
  }: {
    task: TaskDefinition<P, D>;
    params?: P;
    context: TaskContext;
  }): Promise<D> {
    const maxRetries = task.options.retries || 0;

    if (maxRetries === 0) {
      // 不需要重试，直接执行
      return await this.executeWithTimeout<P, D>({
        task,
        params,
        context
      });
    }

    // 使用 p-retry 进行重试
    return await pRetry(
      async (attemptNumber) => {
        // 检查是否已被取消
        if (context.signal?.aborted) {
          throw new AbortError(
            new TaskCancelledError(context.taskName, context.executionId)
          );
        }

        // 更新上下文
        context.retryCount = attemptNumber - 1;
        context.attemptStartedAt = dayjs().toDate();

        const logMessage = `尝试执行任务 (第 ${attemptNumber}/${maxRetries + 1} 次)`;
        this.logger.debug({
          executionId: context.executionId,
          taskName: context.taskName,
          attemptNumber,
          maxAttempts: maxRetries + 1,
          message: logMessage
        });

        // 记录日志到 context
        context.logs.push({
          timestamp: dayjs().toDate(),
          level: TaskExecutionLevel.INFO,
          message: logMessage
        });

        try {
          return await this.executeWithTimeout<P, D>({
            task,
            params,
            context
          });
        } catch (error) {
          // 如果是取消错误，不重试
          if (error instanceof TaskCancelledError) {
            throw new AbortError(error);
          }
          throw error;
        }
      },
      {
        retries: maxRetries,
        onFailedAttempt: (attemptError) => {
          const errorMessage = `任务执行失败 (第 ${attemptError.attemptNumber}/${maxRetries + 1} 次, 剩余重试次数: ${attemptError.retriesLeft})`;
          const errorDetail =
            attemptError instanceof Error
              ? attemptError.message
              : JSON.stringify(attemptError);
          this.logger.warn({
            executionId: context.executionId,
            taskName: context.taskName,
            attemptNumber: attemptError.attemptNumber,
            maxAttempts: maxRetries + 1,
            retriesLeft: attemptError.retriesLeft,
            message: errorMessage,
            errorDetail
          });

          // 记录日志到 context
          context.logs.push({
            timestamp: dayjs().toDate(),
            level: TaskExecutionLevel.WARN,
            message: errorMessage,
            data: { error: errorDetail }
          });
        },
        // 指数退避策略
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 30000,
        // 支持取消
        signal: context.signal
      }
    );
  }

  /**
   * 带超时控制的任务执行（使用 AbortController 实现真正的取消）
   */
  private async executeWithTimeout<P, D>({
    task,
    params,
    context
  }: {
    task: TaskDefinition<P, D>;
    params?: P;
    context: TaskContext;
  }): Promise<D> {
    const timeout = task.options.timeout;

    if (!timeout) {
      // 没有超时限制，直接执行
      const startLog = `开始执行任务 (无超时限制)`;
      this.logger.debug({
        executionId: context.executionId,
        taskName: context.taskName,
        message: startLog
      });
      context.logs.push({
        timestamp: dayjs().toDate(),
        level: TaskExecutionLevel.INFO,
        message: startLog
      });

      return await task.handler(params, context.signal);
    }

    // 创建专用于超时的 AbortController
    const timeoutAbortController = new AbortController();
    const combinedSignal = this.combineSignals(
      context.signal,
      timeoutAbortController.signal
    );

    let timeoutId: NodeJS.Timeout | undefined;

    const startLog = `开始执行任务 (超时限制: ${timeout}ms)`;
    this.logger.debug({
      executionId: context.executionId,
      taskName: context.taskName,
      timeout,
      message: startLog
    });
    context.logs.push({
      timestamp: dayjs().toDate(),
      level: TaskExecutionLevel.INFO,
      message: startLog
    });

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          timeoutAbortController.abort();
          const timeoutLog = `任务执行超时 (${timeout}ms)`;
          context.logs.push({
            timestamp: dayjs().toDate(),
            level: TaskExecutionLevel.ERROR,
            message: timeoutLog
          });
          reject(
            new TaskTimeoutError(context.taskName, context.executionId, timeout)
          );
        }, timeout);
      });

      // 使用组合的 signal 执行任务
      const result = await Promise.race([
        task.handler(params, combinedSignal),
        timeoutPromise
      ]);

      const successLog = `任务执行成功`;
      this.logger.debug({
        executionId: context.executionId,
        taskName: context.taskName,
        message: successLog
      });
      context.logs.push({
        timestamp: dayjs().toDate(),
        level: TaskExecutionLevel.INFO,
        message: successLog
      });

      return result;
    } catch (error) {
      const errorLog = `任务执行失败: ${error instanceof Error ? error.message : String(error)}`;
      this.logger.error({
        executionId: context.executionId,
        taskName: context.taskName,
        message: errorLog,
        error
      });
      context.logs.push({
        timestamp: dayjs().toDate(),
        level: TaskExecutionLevel.ERROR,
        message: errorLog,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    } finally {
      // 清理资源
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutAbortController.abort();
    }
  }

  /**
   * 组合多个 AbortSignal
   */
  private combineSignals(...signals: (AbortSignal | undefined)[]): AbortSignal {
    const validSignals = signals.filter(
      (s): s is AbortSignal => s !== undefined
    );

    if (validSignals.length === 0) {
      return new AbortController().signal;
    }

    if (validSignals.length === 1) {
      return validSignals[0];
    }

    // 创建一个新的 AbortController，当任何一个 signal 触发时就触发
    const controller = new AbortController();

    for (const signal of validSignals) {
      if (signal.aborted) {
        controller.abort();
        break;
      }

      signal.addEventListener(
        "abort",
        () => {
          controller.abort();
        },
        { once: true }
      );
    }

    return controller.signal;
  }
}
