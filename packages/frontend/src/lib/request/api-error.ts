/**
 * 自定义 API 错误类
 * 用于传递更多的错误上下文信息，而不仅仅是消息字符串
 */
export class ApiError<TError> extends Error {
  constructor(
    public message: string,
    public code?: string | number,
    public data?: unknown,
    public error?: TError,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * 创建业务错误（HTTP 200 但 ok=false）
   */
  static businessError<TError>(message: string, code?: string | number, data?: unknown, error?: TError) {
    return new ApiError(message, code, data, error, 200);
  }

  /**
   * 创建网络错误
   */
  static networkError(message: string, statusCode?: number) {
    return new ApiError(message, "NETWORK_ERROR", undefined, statusCode);
  }

  /**
   * 检查是否为 ApiError
   */
  static isApiError<TError>(error: TError) {
    return error instanceof ApiError;
  }

  /**
   * 获取错误信息（用于 UI 展示）
   */
  getDisplayMessage(): string {
    return this.message;
  }

  /**
   * 获取完整的错误信息（用于日志）
   */
  getFullMessage(): string {
    const parts = [this.message];
    if (this.code)
      parts.push(`[${this.code}]`);
    if (this.statusCode)
      parts.push(`HTTP ${this.statusCode}`);
    return parts.join(" ");
  }

  /**
   * 转换为 JSON（便于日志记录）
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      data: this.data,
      error: this.error,
    };
  }
}
