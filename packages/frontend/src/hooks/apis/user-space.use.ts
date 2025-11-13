import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { userSpaceApi } from '@/apis';
import { parseResponse } from '@/lib/utils/response-parser';

// Query Hooks - 使用传统的React Query模式
export const useUserSpaceInfo = (
  params: UserSpace.UserSpaceDTO,
  options?: Omit<UseQueryOptions<UserSpace.UserSpaceVO>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-space', 'info', params.uid],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => userSpaceApi.getUserSpaceInfo(params));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

// Mutation Hooks
export const useUserSpaceMutation = (
  options?: UseMutationOptions<UserSpace.UserSpaceVO, unknown, UserSpace.UserSpaceDTO>
) => {
  return useMutation({
    mutationFn: async (params) => {
      const [data, error] = await parseResponse(() => userSpaceApi.getUserSpaceInfo(params));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

// 新增：直接返回[data, error]模式的Hook
export const useUserSpaceInfoSafe = (
  params: UserSpace.UserSpaceDTO,
  options?: Omit<UseQueryOptions<[UserSpace.UserSpaceVO | null, Http.ErrorResponse | null]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-space', 'info', 'safe', params.uid],
    queryFn: () => parseResponse(() => userSpaceApi.getUserSpaceInfo(params)),
    ...options,
  });
};

export const useUserSpaceMutationSafe = (
  options?: UseMutationOptions<[UserSpace.UserSpaceVO | null, Http.ErrorResponse | null], unknown, UserSpace.UserSpaceDTO>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) =>
      parseResponse(() => userSpaceApi.getUserSpaceInfo(params)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-space'] });
    },
    ...options,
  });
};