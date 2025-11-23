import { Inject, Injectable, Logger } from "@nestjs/common";
import { toError } from "@/utils/error.util";
import {
  ExecuteTaskDto,
  TaskExecutionQueryDto
} from "./dto/task-execution.dto";
import { TaskExecutionService } from "./task-execution.service";
import { TaskExecutorService } from "./task-executor.service";
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
    this.taskExecutor.execute(taskName, data.params, "manual").catch((e) => {
      const error = toError(e);
      this.logger.error(`任务执行错误，原因：${error.message}`);
    });
  }

  /**
   * 通过 API 调用执行任务
   */
  async executeTaskViaAPI(taskName: string, data: ExecuteTaskDto) {
    this.taskExecutor.execute(taskName, data.params, "api").catch((e) => {
      const error = toError(e);
      this.logger.error(`任务执行错误，原因：${error.message}`);
    });
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
