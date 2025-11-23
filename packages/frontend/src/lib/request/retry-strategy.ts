import { ApiError } from "./api-error";

/**
 * React Query 重试策略
 * 根据错误类型和错误代码决定是否重试
 */
export class RetryStrategy {
  /**
   * 判断是否应该重试
   * @param failureCount 失败次数
   * @param error 错误对象
   * @returns true 表示应该重试，false 表示不应该重试
   */
  static shouldRetry(failureCount: number, error: unknown): boolean {
    // 如果已经重试了 3 次，就不再重试
    if (failureCount > 3) {
      return false;
    }

    if (ApiError.isApiError(error)) {
      // 不应该重试的错误代码（客户端错误）
      const noRetryErrorCodes = [
        "INVALID_PARAMS", // 参数验证失败
        "VALIDATION_ERROR", // 验证错误
        "BAD_REQUEST", // 400 Bad Request
        "UNAUTHORIZED", // 401 未授权
        "FORBIDDEN", // 403 禁止访问
        "NOT_FOUND", // 404 未找到
        "CONFLICT", // 409 冲突（如资源已存在）
        "UNPROCESSABLE_ENTITY", // 422 无法处理的实体
      ];

      // 如果错误代码在不重试列表中，就不重试
      if (noRetryErrorCodes.includes(String(error.code))) {
        return false;
      }

      // 根据 HTTP 状态码判断
      if (error.statusCode) {
        // 4xx 错误（客户端错误）通常不应该重试
        if (error.statusCode >= 400 && error.statusCode < 500) {
          return false;
        }

        // 5xx 错误（服务器错误）应该重试
        if (error.statusCode >= 500) {
          return true;
        }
      }

      // 网络错误应该重试
      if (error.code === "NETWORK_ERROR") {
        return true;
      }

      // 其他业务错误（HTTP 200 但 ok=false）默认不重试
      return false;
    }

    // 未知错误，不重试
    return false;
  }

  /**
   * 计算重试延迟时间（毫秒）
   * 使用指数退避算法：1s, 2s, 4s, 8s...
   * @param failureCount 失败次数（从 1 开始）
   * @returns 延迟时间（毫秒）
   */
  static getRetryDelay(failureCount: number): number {
    // 指数退避：2^(failureCount - 1) * 1000ms
    // failureCount=1: 1000ms
    // failureCount=2: 2000ms
    // failureCount=3: 4000ms
    return Math.min(1000 * (2 ** (failureCount - 1)), 30000);
  }

  /**
   * 判断错误是否可重试（简化版，仅基于错误代码）
   * @param errorCode 错误代码
   * @returns true 表示可重试
   */
  static isRetryableErrorCode(errorCode?: string | number): boolean {
    const noRetryErrorCodes = [
      "INVALID_PARAMS",
      "VALIDATION_ERROR",
      "BAD_REQUEST",
      "UNAUTHORIZED",
      "FORBIDDEN",
      "NOT_FOUND",
      "CONFLICT",
      "UNPROCESSABLE_ENTITY",
    ];

    return !noRetryErrorCodes.includes(String(errorCode));
  }

  /**
   * 判断错误是否是客户端错误（不应该重试）
   * @param statusCode HTTP 状态码
   * @returns true 表示是客户端错误
   */
  static isClientError(statusCode?: number): boolean {
    return statusCode ? statusCode >= 400 && statusCode < 500 : false;
  }

  /**
   * 判断错误是否是服务器错误（应该重试）
   * @param statusCode HTTP 状态码
   * @returns true 表示是服务器错误
   */
  static isServerError(statusCode?: number): boolean {
    return statusCode ? statusCode >= 500 : false;
  }

  /**
   * 判断错误是否是网络错误（应该重试）
   * @param errorCode 错误代码
   * @returns true 表示是网络错误
   */
  static isNetworkError(errorCode?: string | number): boolean {
    return errorCode === "NETWORK_ERROR";
  }
}
