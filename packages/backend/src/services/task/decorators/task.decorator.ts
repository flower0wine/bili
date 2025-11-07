import { SetMetadata } from "@nestjs/common";

export const TASK_METADATA = "TASK_METADATA";

/**
 * 任务配置选项
 */
export interface TaskOptions {
  /**
   * 任务唯一标识符
   */
  name: string;

  /**
   * 任务描述
   */
  description?: string;

  /**
   * 任务超时时间（毫秒）
   */
  timeout?: number;

  /**
   * 失败重试次数
   */
  retries?: number;
}

/**
 * Task 装饰器 - 用于标注一个方法为可执行任务
 *
 * @example
 * @Task({ name: 'user-space-sync', description: '用户空间数据同步' })
 * async syncUserSpace(params: { mid: number }) {
 *   // 任务逻辑
 * }
 */
export function Task<T>(options: TaskOptions): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    if (!options.name) {
      throw new Error("Task name is required");
    }

    SetMetadata(TASK_METADATA, options)(target, propertyKey, descriptor);

    // 将任务元数据附加到方法上
    Reflect.defineMetadata(TASK_METADATA, options, descriptor.value);

    return descriptor;
  };
}
