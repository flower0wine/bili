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
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from "@nestjs/swagger";
import { getBadRequestContent } from "@/services/swagger.common";
import {
  ExecuteTaskDto,
  TaskExecutionQueryDto
} from "./dto/task-execution.dto";
import { TaskExecutionService } from "./task-execution.service";
import { TaskExecutorService } from "./task-executor.service";
import { TaskRegistryService } from "./task-registry.service";
import {
  ExecuteTaskResultVo,
  TaskExecutionListVo,
  TaskExecutionVo,
  TaskInfoVo
} from "./vo/task-execution.vo";

/**
 * 任务 API 控制器
 * 提供手动执行任务、查询任务列表、任务执行历史等功能
 */
@ApiTags("Tasks")
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
  @ApiOperation({
    summary: "获取所有已注册的任务",
    description: "返回系统中所有已注册任务的基本信息"
  })
  @ApiOkResponse({
    description: "任务列表",
    type: [TaskInfoVo]
  })
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
  @ApiOperation({
    summary: "手动执行指定任务",
    description: "通过 API 手动触发任务执行，可传入自定义参数"
  })
  @ApiParam({
    name: "taskName",
    description: "任务名称",
    example: "user-space-sync"
  })
  @ApiBody({ type: ExecuteTaskDto })
  @ApiOkResponse({
    description: "任务执行结果",
    type: ExecuteTaskResultVo
  })
  @ApiBadRequestResponse({
    description: "任务不存在或执行失败",
    content: getBadRequestContent({
      taskNotFound: {
        summary: "任务不存在",
        value: {
          ok: false,
          code: 1001,
          message: "任务不存在: unknown-task"
        }
      },
      executionFailed: {
        summary: "任务执行失败",
        value: {
          ok: false,
          code: 1,
          message: "任务执行失败"
        }
      }
    })
  })
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
  @ApiOperation({
    summary: "获取任务详细信息",
    description: "根据任务名称获取任务的配置和描述信息"
  })
  @ApiParam({
    name: "taskName",
    description: "任务名称",
    example: "user-space-sync"
  })
  @ApiOkResponse({
    description: "任务详细信息",
    type: TaskInfoVo
  })
  @ApiBadRequestResponse({
    description: "任务不存在",
    content: getBadRequestContent({
      taskNotFound: {
        summary: "任务不存在",
        value: {
          ok: false,
          code: 1001,
          message: "任务不存在: unknown-task"
        }
      }
    })
  })
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
  @ApiOperation({
    summary: "获取任务执行历史",
    description:
      "查询任务执行记录，支持按任务名称、状态、触发源等条件过滤，并支持分页"
  })
  @ApiQuery({ type: TaskExecutionQueryDto })
  @ApiOkResponse({
    description: "任务执行历史列表",
    type: TaskExecutionListVo
  })
  async getTaskExecutions(@Query() query: TaskExecutionQueryDto) {
    return await this.taskExecutionService.getTaskExecutions(query);
  }

  /**
   * 获取单个任务执行记录详情
   */
  @Get("executions/:id")
  @ApiOperation({
    summary: "获取任务执行记录详情",
    description: "根据执行ID获取单条任务执行记录的详细信息"
  })
  @ApiParam({
    name: "id",
    description: "执行记录ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiOkResponse({
    description: "任务执行记录详情",
    type: TaskExecutionVo
  })
  @ApiBadRequestResponse({
    description: "执行记录不存在",
    content: getBadRequestContent({
      notFound: {
        summary: "执行记录不存在",
        value: {
          ok: false,
          code: 1001,
          message: "执行记录不存在"
        }
      }
    })
  })
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

  /**
   * 获取任务执行统计信息
   */
  @Get("stats/summary")
  @ApiOperation({
    summary: "获取任务执行统计信息",
    description: "统计任务执行情况，包括总数、成功数、失败数、平均耗时等"
  })
  @ApiQuery({
    name: "taskName",
    required: false,
    description: "可选，指定任务名称进行统计",
    example: "user-space-sync"
  })
  @ApiOkResponse({
    description: "任务执行统计信息",
    schema: {
      type: "object",
      properties: {
        total: { type: "number", example: 150 },
        running: { type: "number", example: 2 },
        success: { type: "number", example: 120 },
        failed: { type: "number", example: 25 },
        cancelled: { type: "number", example: 3 },
        avgDuration: { type: "number", example: 180000 }
      }
    }
  })
  async getTaskStats(@Query("taskName") taskName?: string) {
    return await this.taskExecutionService.getTaskExecutionStats(taskName);
  }
}
