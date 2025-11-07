import dayjs from "dayjs";
import { Logger } from "nestjs-pino";
import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "@/services/common/prisma.service";
import { TaskContext, TaskResult } from "../interfaces/task.interface";
import { TaskMiddleware } from "./task-middleware.interface";

/**
 * 任务执行状态常量
 */
const TaskExecutionStatus = {
  RUNNING: "running",
  SUCCESS: "success",
  FAILED: "failed"
} as const;

/**
 * 持久化事件名称常量
 */
const PersistenceEvent = {
  EXECUTION_CREATED: "task_execution.created",
  EXECUTION_CREATE_FAILED: "task_execution.create_failed",
  EXECUTION_UPDATED: "task_execution.updated",
  EXECUTION_UPDATE_FAILED: "task_execution.update_failed",
  EXECUTION_ERROR_SAVED: "task_execution.error_saved",
  EXECUTION_ERROR_SAVE_FAILED: "task_execution.error_save_failed"
} as const;

/**
 * 持久化中间件 - 记录任务执行历史到数据库
 *
 * 职责：
 * - 在任务执行前创建执行记录
 * - 在任务执行后更新执行结果
 * - 在任务失败时记录错误信息
 */
@Injectable()
export class PersistenceMiddleware implements TaskMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(Logger) private readonly logger: Logger
  ) {}

  async before<P>(context: TaskContext<P>): Promise<void> {
    try {
      // 创建任务执行记录
      await (this.prisma as any).taskExecution.create({
        data: {
          id: context.executionId,
          taskName: context.taskName,
          triggerSource: context.source,
          triggerName: context.triggerName,
          params: context.params || {},
          status: TaskExecutionStatus.RUNNING,
          maxRetries: context.maxRetries || 0,
          startedAt: context.startedAt || dayjs().toDate()
        }
      });

      this.logger.debug({
        event: PersistenceEvent.EXECUTION_CREATED,
        executionId: context.executionId,
        taskName: context.taskName
      });
    } catch (error) {
      this.logger.error(
        {
          event: PersistenceEvent.EXECUTION_CREATE_FAILED,
          executionId: context.executionId,
          taskName: context.taskName,
          error: error instanceof Error ? error.message : String(error)
        },
        error instanceof Error ? error.stack : undefined
      );
      // 不中断任务执行
    }
  }

  async after<P, D>(
    context: TaskContext<P>,
    result: TaskResult<D>
  ): Promise<void> {
    try {
      // 更新任务执行记录为成功
      await (this.prisma as any).taskExecution.update({
        where: { id: result.executionId },
        data: {
          status: result.success
            ? TaskExecutionStatus.SUCCESS
            : TaskExecutionStatus.FAILED,
          result: result.data || {},
          error: result.error,
          retryCount: result.retryCount || 0,
          finishedAt: result.finishedAt,
          duration: result.duration
        }
      });

      this.logger.debug({
        event: PersistenceEvent.EXECUTION_UPDATED,
        executionId: context.executionId,
        taskName: context.taskName,
        success: result.success
      });
    } catch (error) {
      this.logger.error(
        {
          event: PersistenceEvent.EXECUTION_UPDATE_FAILED,
          executionId: context.executionId,
          taskName: context.taskName,
          error: error instanceof Error ? error.message : String(error)
        },
        error instanceof Error ? error.stack : undefined
      );
    }
  }

  async onError<P>(context: TaskContext<P>, error: Error): Promise<void> {
    try {
      // 更新任务执行记录为失败
      await (this.prisma as any).taskExecution.update({
        where: { id: context.executionId },
        data: {
          status: TaskExecutionStatus.FAILED,
          error: error.message || String(error),
          retryCount: context.retryCount || 0,
          finishedAt: dayjs().toDate(),
          duration: dayjs().diff(dayjs(context.startedAt))
        }
      });

      this.logger.debug({
        event: PersistenceEvent.EXECUTION_ERROR_SAVED,
        executionId: context.executionId,
        taskName: context.taskName
      });
    } catch (err) {
      this.logger.error(
        {
          event: PersistenceEvent.EXECUTION_ERROR_SAVE_FAILED,
          executionId: context.executionId,
          taskName: context.taskName,
          error: err instanceof Error ? err.message : String(err)
        },
        err instanceof Error ? err.stack : undefined
      );
    }
  }
}
