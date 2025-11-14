import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { userCardApi } from '@/apis';
import { parseResponse } from '@/lib/utils/response-parser';
import { PaginatedResponse } from '@/types/pagination';

// 获取指定用户的最新一条用户名片数据
export const useLatestUserCardData = (
  mid: number,
  options?: Omit<UseQueryOptions<UserCard.UserCardVO>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-card', 'latest', mid],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => userCardApi.getLatestUserCardData(mid));
      console.log(data);
      
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

// 分页获取指定用户的所有用户名片数据
export const useUserCardDataByMid = (
  mid: number,
  params?: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<PaginatedResponse<UserCard.UserCardVO>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-card', 'user', mid, params],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => userCardApi.getUserCardDataByMid(mid, params));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

// 分页获取所有用户的最新用户名片数据
export const useAllLatestUserCardData = (
  params?: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<PaginatedResponse<UserCard.UserCardVO>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-card', 'latest', params],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => userCardApi.getAllLatestUserCardData(params));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

// 根据粉丝数范围查询用户名片数据
export const useUserCardDataByFansRange = (
  params?: {
    minFans?: number;
    maxFans?: number;
    page?: number;
    limit?: number
  },
  options?: Omit<UseQueryOptions<PaginatedResponse<UserCard.UserCardVO>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-card', 'fans-range', params],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => userCardApi.getUserCardDataByFansRange(params));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

// 获取用户名片数据统计信息
export const useUserCardStats = (
  mid?: number,
  options?: Omit<UseQueryOptions<{
    totalRecords: number;
    uniqueUsers: number;
    latestRecord: string | null;
  }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-card', 'stats', mid],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => userCardApi.getUserCardStats(mid));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

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
export const useUserCardSyncMutation = (
  options?: UseMutationOptions<SyncResponse, unknown, { mids?: number[]; photo?: boolean; cookie?: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params) => {
      // 这里应该调用任务执行接口，需要在后端创建相应的Controller
      const response = await fetch('/api/tasks/user-card-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('同步任务执行失败');
      }

      return response.json();
    },
    onSuccess: () => {
      // 同步完成后，刷新相关数据
      queryClient.invalidateQueries({ queryKey: ['user-card'] });
    },
    ...options,
  });
};

// Safe模式的Hooks - 直接返回[data, error]
export const useLatestUserCardDataSafe = (
  mid: number,
  options?: Omit<UseQueryOptions<[UserCard.UserCardVO | null, Http.ErrorResponse | null]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-card', 'latest', 'safe', mid],
    queryFn: () => parseResponse(() => userCardApi.getLatestUserCardData(mid)),
    ...options,
  });
};

export const useUserCardDataByMidSafe = (
  mid: number,
  params?: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<[PaginatedResponse<UserCard.UserCardVO> | null, Http.ErrorResponse | null]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-card', 'user', 'safe', mid, params],
    queryFn: () => parseResponse(() => userCardApi.getUserCardDataByMid(mid, params)),
    ...options,
  });
};

export const useAllLatestUserCardDataSafe = (
  params?: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<[PaginatedResponse<UserCard.UserCardVO> | null, Http.ErrorResponse | null]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-card', 'latest', 'safe', params],
    queryFn: () => parseResponse(() => userCardApi.getAllLatestUserCardData(params)),
    ...options,
  });
};

// 兼容性导出 - 旧版本函数名
export const useUserCardInfo = useLatestUserCardData;