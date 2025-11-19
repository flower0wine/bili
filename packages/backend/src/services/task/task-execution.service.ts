import { Injectable } from "@nestjs/common";
import {
  createPaginatedResponse,
  normalizePagination
} from "@/interfaces/pagination.interface";
import { PrismaService } from "@/services/common/prisma.service";
import { TaskExecutionQueryDto } from "@/services/task/dto/task-execution.dto";
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
  async getTaskExecutions(query: TaskExecutionQueryDto) {
    const {
      taskName,
      status,
      triggerSource,
      triggerName,
      startDate,
      endDate,
      page,
      limit,
      offset,
      orderBy
    } = normalizePagination<TaskExecutionQueryDto>(query);

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

    // 时间范围过滤 (DTO已验证日期格式)
    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) {
        where.startedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.startedAt.lte = new Date(endDate);
      }
    }

    // 使用默认排序，如果orderBy未提供则使用startedAt降序
    const finalOrderBy = orderBy || { startedAt: "desc" };

    // 查询总数和数据（并行执行以优化）
    const [total, data] = await Promise.all([
      this.prisma.taskExecution.count({ where }),
      this.prisma.taskExecution.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: finalOrderBy
      })
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  /**
   * 获取单个任务执行记录
   */
  async getTaskExecution(id: string) {
    const execution = await this.prisma.taskExecution.findUnique({
      where: { id }
    });

    return execution;
  }
}
