import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { triggerApi } from '@/apis';
import { parseResponse } from '@/lib/utils/response-parser';

// Query Hooks - 使用传统的React Query模式
export const useAllTriggers = (options?: Omit<UseQueryOptions<Trigger.TriggerVO[]>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: ['triggers', 'cron'],
    queryFn: async () => {
      const [data, error] = await parseResponse(triggerApi.getAllTriggers);
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

// Mutation Hooks
export const useCreateTrigger = (
  options?: UseMutationOptions<Trigger.TriggerVO, unknown, Trigger.CreateTriggerDTO>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const [result, error] = await parseResponse(() => triggerApi.createTrigger(data));
      if (error) {
        throw new Error(error.message);
      }
      return result!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers', 'cron'] });
    },
    ...options,
  });
};

export const useUpdateTrigger = (
  options?: UseMutationOptions<Trigger.TriggerVO, unknown, { id: string; data: Trigger.UpdateTriggerDTO }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const [result, error] = await parseResponse(() => triggerApi.updateTrigger(id, data));
      if (error) {
        throw new Error(error.message);
      }
      return result!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers', 'cron'] });
    },
    ...options,
  });
};

export const useDeleteTrigger = (
  options?: UseMutationOptions<Trigger.DeleteTriggerVO, unknown, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const [result, error] = await parseResponse(() => triggerApi.deleteTrigger(id));
      if (error) {
        throw new Error(error.message);
      }
      return result!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers', 'cron'] });
    },
    ...options,
  });
};

export const useToggleTrigger = (
  options?: UseMutationOptions<Trigger.TriggerVO, unknown, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const [result, error] = await parseResponse(() => triggerApi.toggleTrigger(id));
      if (error) {
        throw new Error(error.message);
      }
      return result!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers', 'cron'] });
    },
    ...options,
  });
};

// 新增：直接返回[data, error]模式的Hook
export const useAllTriggersSafe = (
  options?: Omit<UseQueryOptions<[Trigger.TriggerVO[] | null, Http.ErrorResponse | null]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['triggers', 'cron', 'safe'],
    queryFn: () =>
      parseResponse(triggerApi.getAllTriggers),
    ...options,
  });
};

export const useCreateTriggerSafe = (
  options?: UseMutationOptions<[Trigger.TriggerVO | null, Http.ErrorResponse | null], unknown, Trigger.CreateTriggerDTO>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      parseResponse(() => triggerApi.createTrigger(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers', 'cron'] });
    },
    ...options,
  });
};