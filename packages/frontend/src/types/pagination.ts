/**
 * 通用分页响应接口
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

/**
 * 分页查询参数接口
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
}
