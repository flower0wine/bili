import { Injectable, Logger } from "@nestjs/common";
import { toError } from "@/utils/error.util";
import {
  ExecuteTaskDto,
  TaskExecutionQueryDto
} from "./dto/task-execution.dto";
import { TaskExecutionStatus, TaskSource } from "./interfaces/task.interface";
import { TaskExecutionService } from "./task-execution.service";
import { RunningTaskInfo, TaskExecutorService } from "./task-executor.service";
import { TaskRegistryService } from "./task-registry.service";

/**
 * 任务业务逻辑服务
 * 负责任务的执行、查询和管理
 * 作为 Controller 和底层 Service 之间的中间层
 */
@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly taskRegistry: TaskRegistryService,
    private readonly taskExecutor: TaskExecutorService,
    private readonly taskExecutionService: TaskExecutionService
  ) {}

  /**
   * 获取所有已注册的任务列表
   */
  getAllTasks() {
    const tasks = this.taskRegistry.getAllTaskInfos();
    return tasks.map((task) => ({
      name: task.name,
      description: task.description,
      options: task.options
    }));
  }

  /**
   * 获取单个任务的详情
   */
  getTask(taskName: string) {
    const task = this.taskRegistry.getTaskInfo(taskName);
    if (!task) {
      return {
        success: false,
        message: `任务不存在: ${taskName}`
      };
    }

    return {
      name: task.name,
      description: task.description,
      options: task.options
    };
  }

  /**
   * 手动执行任务
   */
  async executeTaskManually(taskName: string, data: ExecuteTaskDto) {
    this.taskExecutor
      .execute(taskName, data.params, TaskSource.MANUAL)
      .catch((e) => {
        const error = toError(e);
        this.logger.error(`任务执行错误，原因：${error.message}`);
      });
  }

  /**
   * 通过 API 调用执行任务
   */
  async executeTaskViaAPI(taskName: string, data: ExecuteTaskDto) {
    this.taskExecutor
      .execute(taskName, data.params, TaskSource.API)
      .catch((e) => {
        const error = toError(e);
        this.logger.error(`任务执行错误，原因：${error.message}`);
      });
  }

  /**
   * 通过任务名称查找所有相关的执行信息
   */
  getTaskExecutionsByName(taskName: string) {
    const runningTasks = this.taskExecutor.getRunningTasks();
    return Array.from(runningTasks.values())
      .filter((taskInfo) => taskInfo.taskName === taskName)
      .map((taskInfo) => this.transformTaskInfo(taskInfo));
  }

  /**
   * 通过执行 ID 获取任务执行信息
   */
  getTaskExecutionById(executionId: string) {
    const runningTasks = this.taskExecutor.getRunningTasks();
    const taskInfo = runningTasks.get(executionId);

    if (!taskInfo) {
      return null;
    }

    return this.transformTaskInfo(taskInfo);
  }

  transformTaskInfo(taskInfo: RunningTaskInfo) {
    return {
      executionId: taskInfo.executionId,
      taskName: taskInfo.taskName,
      triggerName: taskInfo.context.triggerName,
      triggeredAt: taskInfo.context.triggeredAt,
      status: taskInfo.context.status,
      logs: taskInfo.context.logs,
      startedAt: taskInfo.startedAt,
      retryCount: taskInfo.context.retryCount,
      maxRetries: taskInfo.context.maxRetries,
      attemptStartedAt: taskInfo.context.attemptStartedAt,
      source: taskInfo.context.source,
      params: taskInfo.context.params
    };
  }

  /**
   * 获取所有正在运行的任务统计（按任务名称分组）
   * @returns 返回按任务名称分组的运行任务统计
   */
  getAllRunningTasks() {
    const runningTasks = this.taskExecutor.getRunningTasks();
    const taskStats = new Map<string, number>();

    for (const taskInfo of runningTasks.values()) {
      const count = taskStats.get(taskInfo.taskName) || 0;
      taskStats.set(taskInfo.taskName, count + 1);
    }

    const stats = Array.from(taskStats.entries()).map(([taskName, count]) => ({
      taskName,
      count
    }));

    return {
      total: runningTasks.size,
      stats
    };
  }

  /**
   * 执行取消操作的内部方法
   * @param taskInfos 要取消的任务信息数组
   * @param failFast 是否在第一个失败时停止
   * @returns 返回取消结果
   */
  private performCancelTasks(
    taskInfos: Array<{ executionId: string; taskInfo: RunningTaskInfo }>,
    failFast: boolean
  ): {
    cancelled: string[];
    failed: Array<{ executionId: string; error: string }>;
  } {
    const cancelled: string[] = [];
    const failed: Array<{ executionId: string; error: string }> = [];

    for (const { executionId, taskInfo } of taskInfos) {
      try {
        this.taskExecutor.stopRunningTask(executionId);
        cancelled.push(executionId);
        this.logger.debug(`已取消任务执行: ${executionId}`);
      } catch (e) {
        const error = toError(e);
        const errorMsg = `取消任务执行失败: ${executionId}, 错误: ${error.message}`;
        this.logger.error(errorMsg);
        failed.push({ executionId, error: error.message });
        if (failFast) {
          throw new Error(errorMsg);
        }
      }
    }

    return { cancelled, failed };
  }

  /**
   * 通过执行 ID 数组取消任务
   * @param executionIds 执行 ID 数组
   * @param options.failFast 如果为 true，任何失败都会抛出异常；如果为 false，继续处理其他任务（默认 false）
   * @returns 返回取消结果和失败信息
   */
  cancelExecutionsByIds(
    executionIds: string[],
    options?: { failFast?: boolean }
  ) {
    const runningTasks = this.taskExecutor.getRunningTasks();
    const notFound: string[] = [];
    const failFast = options?.failFast ?? false;
    const taskInfos: Array<{
      executionId: string;
      taskInfo: RunningTaskInfo;
    }> = [];

    for (const executionId of executionIds) {
      const taskInfo = runningTasks.get(executionId);
      if (!taskInfo) {
        notFound.push(executionId);
        if (failFast) {
          throw new Error(`任务执行不存在: ${executionId}`);
        }
      } else {
        taskInfos.push({ executionId, taskInfo });
      }
    }

    const { cancelled, failed } = this.performCancelTasks(taskInfos, failFast);
    return { cancelled, notFound, failed };
  }

  /**
   * 通过任务名称数组取消所有相关的任务执行
   * @param taskNames 任务名称数组
   * @param options.failFast 如果为 true，任何失败都会抛出异常；如果为 false，继续处理其他任务（默认 false）
   * @returns 返回取消结果和失败信息
   */
  cancelExecutionsByTaskNames(
    taskNames: string[],
    options?: { failFast?: boolean }
  ) {
    const runningTasks = this.taskExecutor.getRunningTasks();
    const taskNotFound: string[] = [];
    const failFast = options?.failFast ?? false;
    const taskInfos: Array<{
      executionId: string;
      taskInfo: RunningTaskInfo;
    }> = [];

    for (const taskName of taskNames) {
      let found = false;

      for (const taskInfo of runningTasks.values()) {
        if (taskInfo.taskName === taskName) {
          found = true;
          taskInfos.push({ executionId: taskInfo.executionId, taskInfo });
        }
      }

      if (!found) {
        taskNotFound.push(taskName);
        if (failFast) {
          throw new Error(`任务不存在: ${taskName}`);
        }
      }
    }

    const { cancelled, failed } = this.performCancelTasks(taskInfos, failFast);
    return { cancelled, taskNotFound, failed };
  }

  /**
   * 取消所有正在运行的任务
   * @param options.failFast 如果为 true，任何失败都会抛出异常；如果为 false，继续处理其他任务（默认 false）
   * @returns 返回取消结果
   */
  cancelAllExecutions(options?: { failFast?: boolean }) {
    const runningTasks = this.taskExecutor.getRunningTasks();
    const failFast = options?.failFast ?? false;
    const taskInfos: Array<{
      executionId: string;
      taskInfo: RunningTaskInfo;
    }> = [];

    for (const taskInfo of runningTasks.values()) {
      taskInfos.push({ executionId: taskInfo.executionId, taskInfo });
    }

    const { cancelled, failed } = this.performCancelTasks(taskInfos, failFast);
    return { count: cancelled.length, cancelled, failed };
  }

  /**
   * 获取任务执行历史（分页 + 过滤）
   */
  async getTaskExecutions(query: TaskExecutionQueryDto) {
    return await this.taskExecutionService.getTaskExecutions(query);
  }

  /**
   * 获取单个任务执行记录详情
   */
  async getTaskExecution(id: string) {
    const execution = await this.taskExecutionService.getTaskExecution(id);
    if (!execution) {
      throw new Error(`任务执行记录不存在: ${id}`);
    }
    return execution;
  }
}
