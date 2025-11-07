import dayjs from "dayjs";
import { Logger } from "nestjs-pino";
import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "@/services/common/prisma.service";
import { TaskContext, TaskResult } from "../interfaces/task.interface";
import { TaskMiddleware } from "./task-middleware.interface";

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
          status: "running",
          maxRetries: context.maxRetries || 0,
          startedAt: context.startedAt || dayjs().toDate()
        }
      });

      this.logger.debug({
        event: "task_execution.created",
        executionId: context.executionId,
        taskName: context.taskName
      });
    } catch (error) {
      this.logger.error(
        {
          event: "task_execution.create_failed",
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
          status: result.success ? "success" : "failed",
          result: result.data || {},
          error: result.error,
          retryCount: result.retryCount || 0,
          finishedAt: result.finishedAt,
          duration: result.duration
        }
      });

      this.logger.debug({
        event: "task_execution.updated",
        executionId: context.executionId,
        taskName: context.taskName,
        success: result.success
      });
    } catch (error) {
      this.logger.error(
        {
          event: "task_execution.update_failed",
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
          status: "failed",
          error: error.message || String(error),
          retryCount: context.retryCount || 0,
          finishedAt: dayjs().toDate(),
          duration: dayjs().diff(dayjs(context.startedAt))
        }
      });

      this.logger.debug({
        event: "task_execution.error_saved",
        executionId: context.executionId,
        taskName: context.taskName
      });
    } catch (err) {
      this.logger.error(
        {
          event: "task_execution.error_save_failed",
          executionId: context.executionId,
          taskName: context.taskName,
          error: err instanceof Error ? err.message : String(err)
        },
        err instanceof Error ? err.stack : undefined
      );
    }
  }
}
