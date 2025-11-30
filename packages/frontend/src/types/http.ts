// 业务状态码定义，与后端保持一致
export const STATUS_CODE = {
  OK: 0,
  UNKNOWN_ERROR: 1,
  INVALID_ARGUMENT: 1001,
  ALREADY_EXISTS: 1002,
  NOT_FOUND: 1003,
  UNAUTHENTICATED: 2001,
  PERMISSION_DENIED: 2003,
} as const;

export type StatusCode
  = | 0 // OK
    | 1 // UNKNOWN_ERROR
    | 1001 // INVALID_ARGUMENT
    | 1002 // ALREADY_EXISTS
    | 1003 // NOT_FOUND
    | 2001 // UNAUTHENTICATED
    | 2003 // PERMISSION_DENIED
    | 9001 // GIT_CLONE_FAILED
    // HTTP 状态码类型
    | 200
    | 201
    | 204
    | 400
    | 401
    | 403
    | 404
    | 500
    | 502
    | 503;

// 通用API响应接口，与后端 IApiResponse 保持一致
export interface ApiResponse<T = unknown, E = unknown> {
  ok: boolean; // true=成功，false=失败
  code: StatusCode; // 0 表示成功，其它为业务错误码
  message?: string; // 友好提示或错误信息
  data?: T; // 成功时为数据，失败为 undefined
  error?: E; // 失败时为错误对象，成功为 undefined
}

// 成功响应类型
export interface SuccessResponse<T = unknown> extends ApiResponse<T> {
  ok: true;
  data: T;
  error?: never;
}

// 失败响应类型
export interface ErrorResponse<E = unknown> extends ApiResponse<never, E> {
  ok: false;
  data?: never;
  error?: E;
}

// 分页响应类型
export interface PaginatedResponse<T = unknown> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API请求配置
export interface RequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

// 错误类型
export interface ApiError {
  code: StatusCode;
  message: string;
  details?: unknown;
}
