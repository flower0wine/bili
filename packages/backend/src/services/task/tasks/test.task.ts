import { Logger } from "nestjs-pino";
import { Inject, Injectable } from "@nestjs/common";
import { toError } from "@/utils/error.util";
import { Task } from "../decorators/task.decorator";
import { TaskCancelledError } from "../interfaces/task.interface";

/**
 * 测试任务参数类型
 */
interface TestParams {
  message?: string;
}

/**
 * 测试任务返回结果类型
 */
interface TestResult {
  message: string;
  startTime: string;
  endTime: string;
  duration: number;
}

/**
 * 测试任务
 * 用于测试任务执行系统，一分钟后结束
 */
@Injectable()
export class TestTask {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

  @Task({
    name: "test-task",
    description: "测试任务，一分钟后结束",
    timeout: 70000, // 70秒超时（留10秒余量）
    retries: 0
  })
  async execute(
    params?: TestParams,
    signal?: AbortSignal
  ): Promise<TestResult> {
    const startTime = new Date();
    const message = params?.message || "测试任务执行中...";

    this.logger.log({
      event: "test_task.started",
      message,
      startTime: startTime.toISOString()
    });

    try {
      // 每5秒检查一次取消信号，共检查12次（60秒）
      for (let i = 0; i < 12; i++) {
        // 检查是否被取消
        if (signal?.aborted) {
          throw new TaskCancelledError("test-task", "unknown");
        }

        // 等待5秒
        await new Promise((resolve) => setTimeout(resolve, 5000));

        this.logger.log({
          event: "test_task.progress",
          elapsed: (i + 1) * 5,
          message: `已运行 ${(i + 1) * 5} 秒`
        });
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      this.logger.log({
        event: "test_task.completed",
        message: "测试任务完成",
        endTime: endTime.toISOString(),
        duration
      });

      return {
        message: "测试任务成功完成",
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration
      };
    } catch (e) {
      const error = toError(e);
      this.logger.error({
        event: "test_task.failed",
        error: error.message
      });
      throw error;
    }
  }
}
