import type { ApiResponse } from "./http";

export interface Pagination<T> {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

/**
 * 通用分页响应接口
 */
export type PaginatedResponse<T> = ApiResponse<Pagination<T>>;

/**
 * 分页查询参数接口
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
}
