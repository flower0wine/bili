import dayjs from "dayjs";
import { Logger } from "nestjs-pino";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "@/services/common/prisma.service";
import { toError } from "@/utils/error.util";
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
export class PersistenceMiddleware implements TaskMiddleware, OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(Logger) private readonly logger: Logger
  ) {}

  /**
   * 模块初始化时清理孤儿任务
   * 将所有 running 状态的任务标记为失败(服务异常关闭导致)
   */
  async onModuleInit() {
    try {
      const result = await this.prisma.taskExecution.updateMany({
        where: {
          status: TaskExecutionStatus.RUNNING
        },
        data: {
          status: TaskExecutionStatus.FAILED,
          error: "服务异常关闭,任务被强制终止",
          finishedAt: dayjs().toDate(),
          updatedAt: dayjs().toDate()
        }
      });

      if (result.count > 0) {
        this.logger.warn(
          `服务启动时检测到 ${result.count} 个孤儿任务(状态为 running),已标记为失败`
        );
      } else {
        this.logger.log("未检测到孤儿任务,数据库状态正常");
      }
    } catch (error) {
      this.logger.error(
        `清理孤儿任务失败: ${toError(error).message}`,
        toError(error).stack
      );
    }
  }

  async before(context: TaskContext): Promise<void> {
    try {
      // 创建任务执行记录
      await this.prisma.taskExecution.create({
        data: {
          id: context.executionId,
          taskName: context.taskName,
          triggerSource: context.source,
          triggerName: context.triggerName,
          params: context.params,
          status: context.status,
          maxRetries: context.maxRetries,
          startedAt: context.startedAt
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
          error: toError(error).message
        },
        toError(error).stack
      );
      // 不中断任务执行
    }
  }

  async after(context: TaskContext): Promise<void> {
    const result = context.result!;
    try {
      // 更新任务执行记录为成功
      await this.prisma.taskExecution.update({
        where: { id: result.executionId },
        data: {
          status: context.status,
          result: result.data || {},
          error: result.error,
          retryCount: result.retryCount,
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
          error: toError(error).message
        },
        toError(error).stack
      );
    }
  }

  async onError(context: TaskContext, error: Error): Promise<void> {
    try {
      // 更新任务执行记录为失败
      await this.prisma.taskExecution.update({
        where: { id: context.executionId },
        data: {
          status: context.status,
          error: error.message,
          retryCount: context.retryCount,
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
          error: toError(err).message
        },
        toError(err).stack
      );
    }
  }
}
