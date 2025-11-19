import { PaginationQueryDto } from "@/dto/pagination-query.dto";

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
 * 默认分页配置
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10
} as const;

/**
 * 创建分页响应的辅助函数
 * @param items 数据项列表
 * @param total 总数量
 * @param page 当前页码
 * @param limit 每页数量
 * @returns 标准化的分页响应
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    items,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    page,
    limit
  };
}

/**
 * 计算分页偏移量
 * @param page 页码（从1开始）
 * @param limit 每页数量
 * @returns 数据库查询用的偏移量
 */
export function calculateOffset(page: number, limit: number): number {
  return Math.max(0, (page - 1) * limit);
}

/**
 * 标准化分页参数
 * @param query 分页查询参数
 * @returns 标准化后的分页参数
 */
export function normalizePagination<Q extends PaginationQueryDto>(
  query: Q = {} as Q
) {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGINATION.page);
  const limit = Math.max(
    1,
    Math.min(100, Number(query.limit) || DEFAULT_PAGINATION.limit)
  ); // 限制最大100条
  const offset = calculateOffset(page, limit);

  if (query.orderBy && typeof query.orderBy === "object") {
    Object.entries(query.orderBy).forEach(([key, value]) => {
      if (value !== "asc" && value !== "desc") {
        delete query[key];
      }
    });
  }

  let orderBy = {
    createdAt: "desc"
  } as Record<string, "asc" | "desc">;

  if (query.orderBy && typeof query.orderBy === "object") {
    orderBy = query.orderBy;
  }

  return { ...query, page, limit, offset, orderBy };
}
