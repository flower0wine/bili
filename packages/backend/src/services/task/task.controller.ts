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
import { TaskService } from "./task.service";

/**
 * 任务 API 控制器
 * 提供手动执行任务、查询任务列表、任务执行历史等功能
 */
@Controller("tasks")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * 获取所有已注册的任务
   */
  @Get()
  getAllTasks() {
    return this.taskService.getAllTasks();
  }

  /**
   * 手动执行任务
   */
  @Post(":taskName/execute/manual")
  @HttpCode(HttpStatus.OK)
  async executeTaskManually(
    @Param("taskName") taskName: string,
    @Body() body: ExecuteTaskDto
  ) {
    return await this.taskService.executeTaskManually(taskName, body);
  }

  /**
   * 通过 API 调用执行任务
   */
  @Post(":taskName/execute/api")
  @HttpCode(HttpStatus.OK)
  async executeTaskViaAPI(
    @Param("taskName") taskName: string,
    @Body() body: ExecuteTaskDto
  ) {
    return await this.taskService.executeTaskViaAPI(taskName, body);
  }

  /**
   * 获取任务详情
   */
  @Get(":taskName")
  getTask(@Param("taskName") taskName: string) {
    return this.taskService.getTask(taskName);
  }

  /**
   * 获取任务执行历史（支持分页和过滤）
   */
  @Get("executions/history")
  async getTaskExecutions(@Query() query: TaskExecutionQueryDto) {
    return await this.taskService.getTaskExecutions(query);
  }

  /**
   * 获取单个任务执行记录详情
   */
  @Get("executions/:id")
  async getTaskExecution(@Param("id") id: string) {
    return await this.taskService.getTaskExecution(id);
  }
}
