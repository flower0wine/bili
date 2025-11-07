import dayjs from "dayjs";
import { Logger } from "nestjs-pino";
import { Inject, Injectable } from "@nestjs/common";
import { TaskContext, TaskResult } from "../interfaces/task.interface";
import { TaskMiddleware } from "./task-middleware.interface";

/**
 * 日志中间件 - 记录任务执行日志（结构化）
 */
@Injectable()
export class LoggingMiddleware implements TaskMiddleware {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

  async before<P>(context: TaskContext<P>): Promise<void> {
    this.logger.log({
      event: "task.started",
      executionId: context.executionId,
      taskName: context.taskName,
      source: context.source,
      triggerName: context.triggerName,
      params: context.params,
      maxRetries: context.maxRetries,
      triggeredAt: dayjs(context.triggeredAt).toISOString(),
      startedAt: dayjs(context.startedAt).toISOString()
    });
  }

  async after<P, D>(
    context: TaskContext<P>,
    result: TaskResult<D>
  ): Promise<void> {
    if (result.success) {
      this.logger.log({
        event: "task.completed",
        executionId: context.executionId,
        taskName: context.taskName,
        success: true,
        duration: result.duration,
        retryCount: result.retryCount,
        startedAt: dayjs(result.startedAt).toISOString(),
        finishedAt: dayjs(result.finishedAt).toISOString()
      });
    } else {
      this.logger.error({
        event: "task.failed",
        executionId: context.executionId,
        taskName: context.taskName,
        success: false,
        error: result.error,
        duration: result.duration,
        retryCount: result.retryCount,
        cancelled: result.cancelled,
        startedAt: dayjs(result.startedAt).toISOString(),
        finishedAt: dayjs(result.finishedAt).toISOString()
      });
    }
  }

  async onError<P>(context: TaskContext<P>, error: Error): Promise<void> {
    this.logger.error({
      event: "task.error",
      executionId: context.executionId,
      taskName: context.taskName,
      error: error.message,
      errorName: error.name,
      stack: error.stack,
      retryCount: context.retryCount,
      attemptStartedAt: dayjs(context.attemptStartedAt).toISOString()
    });
  }
}
