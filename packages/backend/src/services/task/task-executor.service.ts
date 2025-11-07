import { randomUUID } from "crypto";
import dayjs from "dayjs";
import { Logger } from "nestjs-pino";
import pRetry, { AbortError } from "p-retry";
import { Inject, Injectable } from "@nestjs/common";
import {
  TaskCancelledError,
  TaskContext,
  TaskDefinition,
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
export class TaskExecutorService {
  private readonly middlewareChain = new TaskMiddlewareChain();

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
    source: TaskSource = "manual",
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

    const context: TaskContext<P> = {
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
      signal: combinedSignal
    };

    let result: TaskResult<D>;

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
        context,
        taskAbortController
      });

      const finishedAt = dayjs().toDate();
      result = {
        executionId,
        success: true,
        data,
        startedAt,
        finishedAt,
        duration: dayjs(finishedAt).diff(dayjs(startedAt)),
        retryCount: context.retryCount
      };

      // 执行后置中间件
      await this.middlewareChain.executeAfter(context, result);

      return result;
    } catch (error) {
      const finishedAt = dayjs().toDate();
      const isCancelled = error instanceof TaskCancelledError;

      result = {
        executionId,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        startedAt,
        finishedAt,
        duration: dayjs(finishedAt).diff(dayjs(startedAt)),
        retryCount: context.retryCount,
        cancelled: isCancelled
      };

      // 执行错误中间件
      await this.middlewareChain.executeOnError(
        context,
        error instanceof Error ? error : new Error(String(error))
      );

      return result;
    } finally {
      // 清理 AbortController
      taskAbortController.abort();
    }
  }

  /**
   * 带重试的任务执行（使用 p-retry 库 + AbortSignal）
   */
  private async executeWithRetry<P, D>({
    task,
    params,
    context,
    taskAbortController
  }: {
    task: TaskDefinition<P, D>;
    params?: P;
    context: TaskContext<P>;
    taskAbortController: AbortController;
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

        this.logger.debug({
          executionId: context.executionId,
          taskName: context.taskName,
          attemptNumber,
          maxAttempts: maxRetries + 1,
          message: "尝试执行任务"
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
        onFailedAttempt: (error) => {
          this.logger.warn({
            executionId: context.executionId,
            taskName: context.taskName,
            attemptNumber: error.attemptNumber,
            maxAttempts: maxRetries + 1,
            retriesLeft: error.retriesLeft,
            message: "任务执行失败"
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
    context: TaskContext<P>;
  }): Promise<D> {
    const timeout = task.options.timeout;

    if (!timeout) {
      // 没有超时限制，直接执行
      return await task.handler(params, context.signal);
    }

    // 创建专用于超时的 AbortController
    const timeoutAbortController = new AbortController();
    const combinedSignal = this.combineSignals(
      context.signal,
      timeoutAbortController.signal
    );

    let timeoutId: NodeJS.Timeout | undefined;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          timeoutAbortController.abort();
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

      return result;
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
