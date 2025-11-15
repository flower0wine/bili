import type { AxiosError, AxiosResponse } from "axios";

/**
 * API响应解析工具
 * 实现流行的[data, error]模式，无需try-catch
 *
 * @example
 * ```typescript
 * // 基本用法
 * const [data, error] = await parseResponse(api.getUserInfo());
 * if (error) {
 *   console.error('请求失败:', error.message);
 *   return;
 * }
 * console.log('请求成功:', data);
 *
 * // 直接传入API函数
 * const [userInfo, error] = await parseResponse(() =>
 *   userApi.getUserInfo({ userId: '123' })
 * );
 * ```
 */
export async function parseResponse<T>(
  promiseOrFn:
    | Promise<AxiosResponse<Http.ApiResponse<T>>>
    | (() => Promise<AxiosResponse<Http.ApiResponse<T>>>),
): Promise<[T | null, Http.ErrorResponse | null]>;

// 重载：直接传入API函数时自动推断返回类型
export async function parseResponse<
  T extends () => Promise<AxiosResponse<Http.ApiResponse<unknown>>>,
>(
  fn: T,
): Promise<
  [
    ReturnType<T> extends Promise<AxiosResponse<Http.ApiResponse<infer U>>>
      ? U
      : never,
    Http.ErrorResponse | null,
  ]
>;

// 重载：传入API函数调用结果时自动推断返回类型
export async function parseResponse<
  T extends Promise<AxiosResponse<Http.ApiResponse<unknown>>>,
>(
  promise: T,
): Promise<
  [
    T extends Promise<AxiosResponse<Http.ApiResponse<infer U>>> ? U : never,
    Http.ErrorResponse | null,
  ]
>;

// 实现
export async function parseResponse<T>(
  promiseOrFn:
    | Promise<AxiosResponse<Http.ApiResponse<T>>>
    | (() => Promise<AxiosResponse<Http.ApiResponse<T>>>),
): Promise<[T | null, Http.ErrorResponse | null]> {
  try {
    // 支持直接传入Promise或函数
    const response
      = typeof promiseOrFn === "function"
        ? await promiseOrFn()
        : await promiseOrFn;

    // 检查响应数据格式
    const apiResponse = response.data;

    // 如果是标准的ApiResponse格式
    if (apiResponse && typeof apiResponse === "object" && "ok" in apiResponse) {
      if (apiResponse.ok && apiResponse.data !== undefined) {
        // 成功响应
        return [apiResponse.data, null];
      }
      else {
        // 业务错误响应
        const errorResponse: Http.ErrorResponse = {
          ok: false,
          code: apiResponse.code || 1, // UNKNOWN_ERROR = 1
          message: apiResponse.message || "业务处理失败",
          error: apiResponse.error,
        };
        return [null, errorResponse];
      }
    }

    // 非标准格式，直接返回数据
    return [apiResponse as T, null];
  }
  catch (err) {
    // 处理网络错误、HTTP错误等
    const axiosError = err as AxiosError<Http.ErrorResponse>;

    if (axiosError.response?.data) {
      // 服务器返回了错误响应
      return [null, axiosError.response.data];
    }

    // 网络错误或其他未知错误
    const errorResponse: Http.ErrorResponse = {
      ok: false,
      code: 1, // UNKNOWN_ERROR = 1
      message: axiosError.message || "网络请求失败",
      error: axiosError,
    };

    return [null, errorResponse];
  }
}

/**
 * 解析多个API响应
 *
 * @example
 * ```typescript
 * const [userInfo, posts, comments] = await Promise.all([
 *   parseResponse(() => userApi.getUserInfo()),
 *   parseResponse(() => postsApi.getUserPosts()),
 *   parseResponse(() => commentsApi.getUserComments())
 * ]);
 *
 * // 分别处理结果
 * const [userData, userError] = userInfo;
 * const [postsData, postsError] = posts;
 * const [commentsData, commentsError] = comments;
 * ```
 */
export async function parseResponses<T extends readonly unknown[]>(responses: {
  [K in keyof T]:
    | Promise<AxiosResponse<Http.ApiResponse<T[K]>>>
    | (() => Promise<AxiosResponse<Http.ApiResponse<T[K]>>>);
}): Promise<{
  [K in keyof T]: [T[K] | null, Http.ErrorResponse | null];
}> {
  const promises = responses.map(
    async (response): Promise<[unknown, Http.ErrorResponse | null]> =>
      parseResponse(response),
  );

  const results = await Promise.all(promises);
  return results as {
    [K in keyof T]: [T[K] | null, Http.ErrorResponse | null];
  };
}

/**
 * 检查响应是否成功
 */
export function isSuccess<T>(
  response: [T | null, Http.ErrorResponse | null],
): response is [T, null] {
  const [data, error] = response;
  return data !== null && error === null;
}

/**
 * 检查响应是否失败
 */
export function isError<T>(
  response: [T | null, Http.ErrorResponse | null],
): response is [null, Http.ErrorResponse] {
  const [data, error] = response;
  return data === null && error !== null;
}
