import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@/services/common/prisma.service";
import { TaskExecutionQueryDto } from "@/services/task/dto/task-execution.dto";
import {
  TaskExecutionListVo,
  TaskExecutionVo
} from "@/services/task/vo/task-execution.vo";
import { Prisma } from "@prisma/client";

/**
 * 任务执行历史服务
 * 负责查询和管理任务执行记录
 */
@Injectable()
export class TaskExecutionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 查询任务执行历史（分页 + 过滤）
   */
  async getTaskExecutions(
    query: TaskExecutionQueryDto
  ): Promise<TaskExecutionListVo> {
    const {
      taskName,
      status,
      triggerSource,
      triggerName,
      startDate,
      endDate,
      page = 1,
      pageSize = 20
    } = query;

    // 验证分页参数
    if (page < 1 || pageSize < 1) {
      throw new BadRequestException(
        "Page and pageSize must be positive integers"
      );
    }

    // 构建查询条件，使用Prisma类型
    const where: Prisma.TaskExecutionWhereInput = {};

    if (taskName) {
      where.taskName = taskName;
    }

    if (status) {
      where.status = status;
    }

    if (triggerSource) {
      where.triggerSource = triggerSource;
    }

    if (triggerName) {
      where.triggerName = triggerName;
    }

    // 时间范围过滤
    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          throw new BadRequestException("Invalid startDate format");
        }
        where.startedAt.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          throw new BadRequestException("Invalid endDate format");
        }
        where.startedAt.lte = end;
      }
    }

    // 分页参数
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // 查询总数和数据（并行执行以优化）
    const [total, data] = await Promise.all([
      this.prisma.taskExecution.count({ where }),
      this.prisma.taskExecution.findMany({
        where,
        skip,
        take,
        orderBy: { startedAt: "desc" }
      })
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: data.map((item) => this.mapToVo(item)),
      total,
      page,
      pageSize,
      totalPages
    };
  }

  /**
   * 获取单个任务执行记录
   */
  async getTaskExecution(id: string): Promise<TaskExecutionVo | null> {
    const execution = await this.prisma.taskExecution.findUnique({
      where: { id }
    });

    return execution ? this.mapToVo(execution) : null;
  }

  /**
   * 获取任务执行统计信息
   */
  async getTaskExecutionStats(taskName?: string) {
    const where: Prisma.TaskExecutionWhereInput = taskName ? { taskName } : {};

    const [total, running, success, failed, cancelled, avgResult] =
      await Promise.all([
        this.prisma.taskExecution.count({ where }),
        this.prisma.taskExecution.count({
          where: { ...where, status: "running" }
        }),
        this.prisma.taskExecution.count({
          where: { ...where, status: "success" }
        }),
        this.prisma.taskExecution.count({
          where: { ...where, status: "failed" }
        }),
        this.prisma.taskExecution.count({
          where: { ...where, status: "cancelled" }
        }),
        // 使用数据库聚合计算平均时长，优化性能
        this.prisma.taskExecution.aggregate({
          where: {
            ...where,
            status: { in: ["success", "failed", "cancelled"] },
            duration: { not: null }
          },
          _avg: { duration: true }
        })
      ]);

    const avgDuration = avgResult._avg.duration
      ? Math.round(avgResult._avg.duration)
      : 0;

    return {
      total,
      running,
      success,
      failed,
      cancelled,
      avgDuration
    };
  }

  /**
   * 映射数据库模型到 VO
   */
  private mapToVo(
    execution: Prisma.TaskExecutionGetPayload<object>
  ): TaskExecutionVo {
    const {
      id,
      taskName,
      triggerSource,
      triggerName,
      params,
      status,
      result,
      error,
      retryCount,
      maxRetries,
      startedAt,
      finishedAt,
      duration,
      createdAt,
      updatedAt
    } = execution;

    return {
      id,
      taskName,
      triggerSource,
      triggerName: triggerName || undefined,
      params,
      status,
      result,
      error: error || undefined,
      retryCount,
      maxRetries,
      startedAt,
      finishedAt: finishedAt || undefined,
      duration: duration || undefined,
      createdAt,
      updatedAt
    };
  }
}
