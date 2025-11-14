import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { userSpaceApi } from '@/apis';
import { parseResponse } from '@/lib/utils/response-parser';
import { PaginatedResponse } from '@/types/pagination';

// 获取指定用户的最新一条用户空间数据
export const useLatestUserSpaceData = (
  mid: number,
  options?: Omit<UseQueryOptions<UserSpace.UserSpaceVO>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-space', 'latest', mid],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => userSpaceApi.getLatestUserSpaceData(mid));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

// 分页获取指定用户的所有用户空间数据
export const useUserSpaceDataByMid = (
  mid: number,
  params?: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<PaginatedResponse<UserSpace.UserSpaceVO>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-space', 'user', mid, params],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => userSpaceApi.getUserSpaceDataByMid(mid, params));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

// 分页获取所有用户的最新用户空间数据
export const useAllLatestUserSpaceData = (
  params?: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<PaginatedResponse<UserSpace.UserSpaceVO>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-space', 'latest', params],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => userSpaceApi.getAllLatestUserSpaceData(params));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

// 根据等级范围查询用户空间数据
export const useUserSpaceDataByLevelRange = (
  params?: {
    minLevel?: number;
    maxLevel?: number;
    page?: number;
    limit?: number
  },
  options?: Omit<UseQueryOptions<PaginatedResponse<UserSpace.UserSpaceVO>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-space', 'level-range', params],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => userSpaceApi.getUserSpaceDataByLevelRange(params));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

// 根据认证状态查询用户空间数据
export const useVerifiedUserSpaceData = (
  params?: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<PaginatedResponse<UserSpace.UserSpaceVO>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-space', 'verified', params],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => userSpaceApi.getVerifiedUserSpaceData(params));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

// 搜索用户空间数据
export const useSearchUserSpaceData = (
  keyword: string,
  params?: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<PaginatedResponse<UserSpace.UserSpaceVO>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-space', 'search', keyword, params],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => userSpaceApi.searchUserSpaceData(keyword, params));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

// 获取用户空间数据统计信息
export const useUserSpaceStats = (
  mid?: number,
  options?: Omit<UseQueryOptions<{
    totalRecords: number;
    uniqueUsers: number;
    latestRecord: string | null;
    levelDistribution: Record<number, number>;
  }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-space', 'stats', mid],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => userSpaceApi.getUserSpaceStats(mid));
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
export const useUserSpaceSyncMutation = (
  options?: UseMutationOptions<SyncResponse, unknown, { mids?: number[]; cookie?: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params) => {
      // 这里应该调用任务执行接口，需要在后端创建相应的Controller
      const response = await fetch('/api/tasks/user-space-sync', {
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
      queryClient.invalidateQueries({ queryKey: ['user-space'] });
    },
    ...options,
  });
};

// Safe模式的Hooks - 直接返回[data, error]
export const useLatestUserSpaceDataSafe = (
  mid: number,
  options?: Omit<UseQueryOptions<[UserSpace.UserSpaceVO | null, Http.ErrorResponse | null]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-space', 'latest', 'safe', mid],
    queryFn: () => parseResponse(() => userSpaceApi.getLatestUserSpaceData(mid)),
    ...options,
  });
};

export const useUserSpaceDataByMidSafe = (
  mid: number,
  params?: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<[PaginatedResponse<UserSpace.UserSpaceVO> | null, Http.ErrorResponse | null]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-space', 'user', 'safe', mid, params],
    queryFn: () => parseResponse(() => userSpaceApi.getUserSpaceDataByMid(mid, params)),
    ...options,
  });
};

export const useAllLatestUserSpaceDataSafe = (
  params?: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<[PaginatedResponse<UserSpace.UserSpaceVO> | null, Http.ErrorResponse | null]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-space', 'latest', 'safe', params],
    queryFn: () => parseResponse(() => userSpaceApi.getAllLatestUserSpaceData(params)),
    ...options,
  });
};

export const useSearchUserSpaceDataSafe = (
  keyword: string,
  params?: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<[PaginatedResponse<UserSpace.UserSpaceVO> | null, Http.ErrorResponse | null]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-space', 'search', 'safe', keyword, params],
    queryFn: () => parseResponse(() => userSpaceApi.searchUserSpaceData(keyword, params)),
    ...options,
  });
};

// 兼容性导出 - 旧版本函数名
export const useUserSpaceInfo = useLatestUserSpaceData;