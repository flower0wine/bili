import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query
} from "@nestjs/common";
import {
  ExecuteTaskDto,
  TaskExecutionQueryDto
} from "./dto/task-execution.dto";
import { TaskExecutionService } from "./task-execution.service";
import { TaskExecutorService } from "./task-executor.service";
import { TaskRegistryService } from "./task-registry.service";

/**
 * 任务 API 控制器
 * 提供手动执行任务、查询任务列表、任务执行历史等功能
 */
@Controller("tasks")
export class TaskController {
  constructor(
    private readonly taskRegistry: TaskRegistryService,
    private readonly taskExecutor: TaskExecutorService,
    private readonly taskExecutionService: TaskExecutionService
  ) {}

  /**
   * 获取所有已注册的任务
   * 使用 getAllTaskInfos() 而非 getAllTasks()，避免序列化 handler 函数
   */
  @Get()
  getAllTasks() {
    const tasks = this.taskRegistry.getAllTaskInfos();
    return tasks.map((task) => ({
      name: task.name,
      description: task.description,
      options: task.options
    }));
  }

  /**
   * 手动执行任务
   */
  @Post(":taskName/execute")
  @HttpCode(HttpStatus.OK)
  async executeTask(
    @Param("taskName") taskName: string,
    @Body() body: ExecuteTaskDto
  ) {
    const result = await this.taskExecutor.execute(
      taskName,
      body.params,
      "api"
    );

    return result;
  }

  /**
   * 获取任务详情
   * 使用 getTaskInfo() 而非 getTask()，避免序列化 handler 函数
   */
  @Get(":taskName")
  getTask(@Param("taskName") taskName: string) {
    const task = this.taskRegistry.getTaskInfo(taskName);
    if (!task) {
      return {
        success: false,
        message: `任务不存在: ${taskName}`
      };
    }

    return {
      success: true,
      data: {
        name: task.name,
        description: task.description,
        options: task.options
      }
    };
  }

  /**
   * 获取任务执行历史（支持分页和过滤）
   */
  @Get("executions/history")
  async getTaskExecutions(@Query() query: TaskExecutionQueryDto) {
    return await this.taskExecutionService.getTaskExecutions(query);
  }

  /**
   * 获取单个任务执行记录详情
   */
  @Get("executions/:id")
  async getTaskExecution(@Param("id") id: string) {
    const execution = await this.taskExecutionService.getTaskExecution(id);
    if (!execution) {
      return {
        success: false,
        message: "执行记录不存在"
      };
    }
    return execution;
  }
}
