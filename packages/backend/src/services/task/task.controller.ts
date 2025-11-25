import {
  Body,
  Controller,
  Delete,
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

  /**
   * 获取所有正在运行的任务
   */
  @Get("running")
  getAllRunningTasks() {
    return this.taskService.getAllRunningTasks();
  }

  /**
   * 通过执行 ID 获取任务执行信息
   */
  @Get("running/execution/:executionId")
  getTaskExecutionById(@Param("executionId") executionId: string) {
    return this.taskService.getTaskExecutionById(executionId);
  }

  /**
   * 通过任务名称查找所有相关的执行信息
   */
  @Get("running/:taskName")
  getTaskExecutionsByName(@Param("taskName") taskName: string) {
    return this.taskService.getTaskExecutionsByName(taskName);
  }

  /**
   * 获取任务详情
   */
  @Get(":taskName")
  getTask(@Param("taskName") taskName: string) {
    return this.taskService.getTask(taskName);
  }

  /**
   * 通过执行 ID 数组取消任务
   */
  @Delete("executions/cancel/ids")
  @HttpCode(HttpStatus.OK)
  cancelExecutionsByIds(
    @Body() body: { executionIds: string[]; failFast?: boolean }
  ) {
    return this.taskService.cancelExecutionsByIds(body.executionIds, {
      failFast: body.failFast
    });
  }

  /**
   * 通过任务名称数组取消所有相关的任务执行
   */
  @Delete("executions/cancel/taskNames")
  @HttpCode(HttpStatus.OK)
  cancelExecutionsByTaskNames(
    @Body() body: { taskNames: string[]; failFast?: boolean }
  ) {
    return this.taskService.cancelExecutionsByTaskNames(body.taskNames, {
      failFast: body.failFast
    });
  }

  /**
   * 取消所有正在运行的任务
   */
  @Delete("executions/cancel/all")
  @HttpCode(HttpStatus.OK)
  cancelAllExecutions(@Body() body?: { failFast?: boolean }) {
    return this.taskService.cancelAllExecutions({
      failFast: body?.failFast
    });
  }
}
