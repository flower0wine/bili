import dayjs from "dayjs";
import { Logger } from "nestjs-pino";
import { Inject, Injectable } from "@nestjs/common";
import { TaskContext, TaskResult } from "../interfaces/task.interface";
import { TaskMiddleware } from "./task-middleware.interface";

/**
 * 日志事件名称常量
 */
const LogEvent = {
  TASK_STARTED: "task.started",
  TASK_COMPLETED: "task.completed",
  TASK_FAILED: "task.failed",
  TASK_ERROR: "task.error"
} as const;

/**
 * 日志中间件 - 记录任务执行日志（结构化）
 */
@Injectable()
export class LoggingMiddleware implements TaskMiddleware {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

  async before<P>(context: TaskContext<P>): Promise<void> {
    this.logger.log({
      event: LogEvent.TASK_STARTED,
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
        event: LogEvent.TASK_COMPLETED,
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
        event: LogEvent.TASK_FAILED,
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
      event: LogEvent.TASK_ERROR,
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
