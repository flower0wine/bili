/**
 * 任务执行异常类
 * 用于替代 HttpException，专门用于任务执行过程中的错误处理
 */
export class TaskException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskException';

    // 确保堆栈跟踪正确
    Error.captureStackTrace(this, TaskException);
  }
}