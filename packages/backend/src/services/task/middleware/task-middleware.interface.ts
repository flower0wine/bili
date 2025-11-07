import { TaskContext, TaskResult } from "../interfaces/task.interface";

/**
 * 任务中间件接口
 */
export interface TaskMiddleware {
  /**
   * 任务执行前的钩子
   * @returns false 则中止任务执行
   */
  before?<P>(context: TaskContext<P>): Promise<boolean | void>;

  /**
   * 任务执行后的钩子
   */
  after?<P, D>(context: TaskContext<P>, result: TaskResult<D>): Promise<void>;

  /**
   * 任务执行失败时的钩子
   */
  onError?<P>(context: TaskContext<P>, error: Error): Promise<void>;
}

/**
 * 中间件链执行器
 */
export class TaskMiddlewareChain {
  private middlewares: TaskMiddleware[] = [];

  add(middleware: TaskMiddleware) {
    this.middlewares.push(middleware);
  }

  async executeBefore<P>(context: TaskContext<P>): Promise<boolean> {
    for (const middleware of this.middlewares) {
      if (middleware.before) {
        const result = await middleware.before(context);
        if (result === false) {
          return false; // 中止执行
        }
      }
    }
    return true;
  }

  async executeAfter<P, D>(
    context: TaskContext<P>,
    result: TaskResult<D>
  ): Promise<void> {
    for (const middleware of this.middlewares) {
      if (middleware.after) {
        await middleware.after(context, result);
      }
    }
  }

  async executeOnError<P>(
    context: TaskContext<P>,
    error: Error
  ): Promise<void> {
    for (const middleware of this.middlewares) {
      if (middleware.onError) {
        await middleware.onError(context, error);
      }
    }
  }
}
