import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { userCardApi } from '@/apis';
import { parseResponse } from '@/lib/utils/response-parser';

// Query Hooks - 使用传统的React Query模式
export const useUserCardInfo = (
  params: UserCard.UserCardDTO,
  options?: Omit<UseQueryOptions<UserCard.UserCardVO>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-card', 'info', params.uid],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => userCardApi.getUserCardInfo(params));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

// Mutation Hooks
export const useUserCardMutation = (
  options?: UseMutationOptions<UserCard.UserCardVO, unknown, UserCard.UserCardDTO>
) => {
  return useMutation({
    mutationFn: async (params) => {
      const [data, error] = await parseResponse(() => userCardApi.getUserCardInfo(params));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

// 新增：直接返回[data, error]模式的Hook
export const useUserCardInfoSafe = (
  params: UserCard.UserCardDTO,
  options?: Omit<UseQueryOptions<[UserCard.UserCardVO | null, Http.ErrorResponse | null]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user-card', 'info', 'safe', params.uid],
    queryFn: () =>
      parseResponse(() => userCardApi.getUserCardInfo(params)),
    ...options,
  });
};

export const useUserCardMutationSafe = (
  options?: UseMutationOptions<[UserCard.UserCardVO | null, Http.ErrorResponse | null], unknown, UserCard.UserCardDTO>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) =>
      parseResponse(() => userCardApi.getUserCardInfo(params)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-card'] });
    },
    ...options,
  });
};