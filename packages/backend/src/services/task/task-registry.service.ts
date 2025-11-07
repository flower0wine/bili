import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { DiscoveryService, MetadataScanner } from "@nestjs/core";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { TASK_METADATA, TaskOptions } from "./decorators/task.decorator";
import { TaskDefinition } from "./interfaces/task.interface";

/**
 * 任务元数据（内部存储结构）
 * 存储实例和方法名，避免 bind 导致元数据丢失
 */
interface TaskMetadata<T> {
  /**
   * 任务所属的服务实例
   */
  instance: object;

  /**
   * 任务方法名
   */
  methodName: string;

  /**
   * 任务配置（从装饰器读取）
   */
  options: TaskOptions;
}

/**
 * 任务注册中心
 * 负责发现、注册和管理所有任务
 *
 * 修复说明：
 * 1. 正确读取元数据（从 descriptor.value 而非 instance[methodName]）
 * 2. 存储 instance + methodName，避免 bind 破坏元数据
 * 3. 扫描所有实例方法（包括继承的）
 * 4. 禁止任务名冲突（抛出异常而非覆盖）
 * 5. onModuleInit 异常捕获和友好日志
 * 6. 移除动态任务注册（任务必须预先定义）
 */
@Injectable()
export class TaskRegistryService implements OnModuleInit {
  private readonly logger = new Logger(TaskRegistryService.name);
  /**
   * 内部存储：任务名 -> 任务元数据
   */
  private readonly taskMetadata = new Map<string, TaskMetadata<any>>();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner
  ) {}

  async onModuleInit() {
    try {
      await this.discoverTasks();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `任务发现失败: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined
      );
      throw error; // 重新抛出，让应用启动失败（任务系统是核心功能）
    }
  }

  /**
   * 自动发现所有使用 @Task 装饰器的方法
   *
   * 修复点：
   * 1. 正确读取元数据（从原型链上的原始方法读取）
   * 2. 扫描完整原型链（包括继承的方法）
   * 3. 存储 instance + methodName，而非 bind 后的函数
   */
  private async discoverTasks(): Promise<void> {
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();
    let discoveredCount = 0;

    for (const wrapper of providers) {
      const { instance } = wrapper;
      if (!instance || typeof instance === "string") {
        continue;
      }

      // 扫描完整原型链（包括继承的方法）
      const tasksInInstance = this.scanInstanceForTasks(instance);
      discoveredCount += tasksInInstance;
    }

    this.logger.log(`已发现并注册 ${this.taskMetadata.size} 个任务`);
  }

  /**
   * 扫描一个实例上的所有任务方法
   * @returns 发现的任务数量
   */
  private scanInstanceForTasks(instance: object): number {
    let count = 0;
    let prototype = Object.getPrototypeOf(instance);

    // 遍历原型链（直到 Object.prototype）
    while (prototype && prototype !== Object.prototype) {
      const methodNames = this.metadataScanner.getAllMethodNames(prototype);

      for (const methodName of methodNames) {
        // 从原型上获取原始方法（而非从 instance 获取，避免 bind）
        const method = prototype[methodName];
        if (typeof method !== "function") {
          continue;
        }

        // 关键修复：从 descriptor.value 读取元数据（装饰器附加位置）
        const metadata = Reflect.getMetadata(TASK_METADATA, method);

        if (metadata) {
          try {
            this.registerTaskMetadata(instance, methodName, metadata);
            count++;
          } catch (error) {
            // 任务名冲突等错误会抛出，记录后继续扫描
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            this.logger.error(`注册任务失败 [${methodName}]: ${errorMessage}`);
            throw error; // 冲突是严重错误，应该中断启动
          }
        }
      }

      // 继续扫描父类
      prototype = Object.getPrototypeOf(prototype);
    }

    return count;
  }

  /**
   * 注册任务元数据（内部方法）
   *
   * 修复点：
   * 1. 禁止任务名冲突（抛异常而非覆盖）
   * 2. 存储 instance + methodName，避免 bind
   */
  private registerTaskMetadata(
    instance: object,
    methodName: string,
    options: TaskOptions
  ): void {
    const taskName = options.name;

    // 严格禁止任务名冲突
    if (this.taskMetadata.has(taskName)) {
      const existing = this.taskMetadata.get(taskName)!;
      throw new Error(
        `任务名冲突: "${taskName}" 已在 ${existing.instance.constructor.name}.${existing.methodName} 中注册，` +
          `无法在 ${instance.constructor.name}.${methodName} 中重复注册`
      );
    }

    // 存储元数据（不 bind，保留原始引用）
    this.taskMetadata.set(taskName, {
      instance,
      methodName,
      options
    });

    this.logger.log(
      `任务已注册: ${taskName} [${instance.constructor.name}.${methodName}]`
    );
  }

  /**
   * 获取任务定义
   *
   * 修复点：
   * 1. 动态构造 handler（每次调用时才 bind，保留元数据）
   * 2. 返回完整的 TaskDefinition 供执行器使用
   */
  getTask<P, D>(name: string): TaskDefinition<P, D> | undefined {
    const metadata = this.taskMetadata.get(name);
    if (!metadata) {
      return undefined;
    }

    const { instance, methodName, options } = metadata;

    // 动态获取方法（确保获取最新版本）
    const method = (instance as Record<string, unknown>)[methodName];
    if (typeof method !== "function") {
      this.logger.error(
        `任务方法不存在或不是函数: ${name} [${instance.constructor.name}.${methodName}]`
      );
      return undefined;
    }

    // 构造 TaskDefinition（handler 在此时 bind，不影响元数据）
    return {
      name: options.name,
      description: options.description,
      handler: method.bind(instance), // 执行时才 bind，保证 this 正确
      instance,
      options: {
        timeout: options.timeout,
        retries: options.retries
      }
    };
  }

  /**
   * 获取所有任务定义
   */
  getAllTasks<P, D, T>(): TaskDefinition<P, D>[] {
    return Array.from(this.taskMetadata.keys()).map(
      (name) => this.getTask(name)!
    );
  }

  /**
   * 获取任务元信息（不含 handler）
   * 用于 API 查询等场景，避免序列化函数
   */
  getTaskInfo<P, D>(
    name: string
  ): Omit<TaskDefinition<P, D>, "handler"> | undefined {
    const metadata = this.taskMetadata.get(name);
    if (!metadata) {
      return undefined;
    }

    return {
      name: metadata.options.name,
      description: metadata.options.description,
      instance: metadata.instance,
      options: {
        timeout: metadata.options.timeout,
        retries: metadata.options.retries
      }
    };
  }

  /**
   * 获取所有任务的元信息列表
   */
  getAllTaskInfos<P, D>(): Array<Omit<TaskDefinition<P, D>, "handler">> {
    return Array.from(this.taskMetadata.keys())
      .map((name) => this.getTaskInfo<P, D>(name)!)
      .filter(Boolean);
  }

  /**
   * 检查任务是否存在
   */
  hasTask(name: string): boolean {
    return this.taskMetadata.has(name);
  }

  /**
   * 移除任务（谨慎使用，可能导致触发器失效）
   */
  removeTask(name: string): boolean {
    const result = this.taskMetadata.delete(name);
    if (result) {
      this.logger.warn(`任务已移除: ${name}（请确保没有触发器依赖此任务）`);
    }
    return result;
  }
}
