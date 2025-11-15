import type {
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { PaginatedResponse } from "@/types/pagination";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { userCardApi } from "@/apis";
import { parseResponse } from "@/lib/utils/response-parser";

// 获取指定用户的最新一条用户名片数据
export function useLatestUserCardData(mid: number, options?: Omit<UseQueryOptions<UserCard.UserCardVO>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: ["user-card", "latest", mid],
    queryFn: async () => {
      const [data, error] = await parseResponse(async () =>
        userCardApi.getLatestUserCardData(mid),
      );
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
}

// 获取用户的名片历史数据用于图表展示
export function useUserCardHistoryData(mid: number, options?: Omit<UseQueryOptions<UserCard.UserCardVO[]>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: ["user-card", "history", mid],
    queryFn: async () => {
      const allData: UserCard.UserCardVO[] = [];
      let page = 1;
      const limit = 100; // 每页获取100条数据
      let hasMore = true;

      // 分页获取所有数据
      while (hasMore) {
        const [data, error] = await parseResponse(async () =>
          userCardApi.getUserCardDataByMid(mid, { page, limit }),
        );

        if (error) {
          throw new Error(error.message);
        }

        if (data && data.items.length > 0) {
          allData.push(...data.items);
          hasMore = page < data.totalPages;
          page++;
        }
        else {
          hasMore = false;
        }
      }

      return allData;
    },
    ...options,
  });
}

// 分页获取指定用户的所有用户名片数据
export function useUserCardDataByMid(mid: number, params?: { page?: number; limit?: number }, options?: Omit<
  UseQueryOptions<PaginatedResponse<UserCard.UserCardVO>>,
    "queryKey" | "queryFn"
>) {
  return useQuery({
    queryKey: ["user-card", "user", mid, params],
    queryFn: async () => {
      const [data, error] = await parseResponse(async () =>
        userCardApi.getUserCardDataByMid(mid, params),
      );
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
}

// 分页获取所有用户的最新用户名片数据
export function useAllLatestUserCardData(params?: { page?: number; limit?: number }, options?: Omit<
  UseQueryOptions<PaginatedResponse<UserCard.UserCardVO>>,
    "queryKey" | "queryFn"
>) {
  return useQuery({
    queryKey: ["user-card", "latest", params],
    queryFn: async () => {
      const [data, error] = await parseResponse(async () =>
        userCardApi.getAllLatestUserCardData(params),
      );
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
}

// 根据粉丝数范围查询用户名片数据
export function useUserCardDataByFansRange(params?: {
  minFans?: number;
  maxFans?: number;
  page?: number;
  limit?: number;
}, options?: Omit<
  UseQueryOptions<PaginatedResponse<UserCard.UserCardVO>>,
    "queryKey" | "queryFn"
>) {
  return useQuery({
    queryKey: ["user-card", "fans-range", params],
    queryFn: async () => {
      const [data, error] = await parseResponse(async () =>
        userCardApi.getUserCardDataByFansRange(params),
      );
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
}

// 获取用户名片数据统计信息
export function useUserCardStats(mid?: number, options?: Omit<
  UseQueryOptions<{
    totalRecords: number;
    uniqueUsers: number;
    latestRecord: string | null;
  }>,
    "queryKey" | "queryFn"
>) {
  return useQuery({
    queryKey: ["user-card", "stats", mid],
    queryFn: async () => {
      const [data, error] = await parseResponse(async () =>
        userCardApi.getUserCardStats(mid),
      );
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
}

// 定义任务同步响应类型
interface SyncResponse {
  total: number;
  success: number;
  failed: number;
  results: Array<{
    mid: number;
    success: boolean;
    data?: unknown;
    error?: string;
  }>;
}

// Mutation Hooks - 用于触发数据同步任务
export function useUserCardSyncMutation(options?: UseMutationOptions<
  SyncResponse,
  unknown,
  { mids?: number[]; photo?: boolean; cookie?: string }
>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params) => {
      // 这里应该调用任务执行接口，需要在后端创建相应的Controller
      const response = await fetch("/api/tasks/user-card-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("同步任务执行失败");
      }

      return response.json();
    },
    onSuccess: () => {
      // 同步完成后，刷新相关数据
      queryClient.invalidateQueries({ queryKey: ["user-card"] });
    },
    ...options,
  });
}

// Safe模式的Hooks - 直接返回[data, error]
export function useLatestUserCardDataSafe(mid: number, options?: Omit<
  UseQueryOptions<[UserCard.UserCardVO | null, Http.ErrorResponse | null]>,
    "queryKey" | "queryFn"
>) {
  return useQuery({
    queryKey: ["user-card", "latest", "safe", mid],
    queryFn: async () => parseResponse(async () => userCardApi.getLatestUserCardData(mid)),
    ...options,
  });
}

export function useUserCardDataByMidSafe(mid: number, params?: { page?: number; limit?: number }, options?: Omit<
  UseQueryOptions<
    [PaginatedResponse<UserCard.UserCardVO> | null, Http.ErrorResponse | null]
  >,
    "queryKey" | "queryFn"
>) {
  return useQuery({
    queryKey: ["user-card", "user", "safe", mid, params],
    queryFn: async () =>
      parseResponse(async () => userCardApi.getUserCardDataByMid(mid, params)),
    ...options,
  });
}

export function useAllLatestUserCardDataSafe(params?: { page?: number; limit?: number }, options?: Omit<
  UseQueryOptions<
    [PaginatedResponse<UserCard.UserCardVO> | null, Http.ErrorResponse | null]
  >,
    "queryKey" | "queryFn"
>) {
  return useQuery({
    queryKey: ["user-card", "latest", "safe", params],
    queryFn: async () =>
      parseResponse(async () => userCardApi.getAllLatestUserCardData(params)),
    ...options,
  });
}

// 兼容性导出 - 旧版本函数名
export const useUserCardInfo = useLatestUserCardData;
