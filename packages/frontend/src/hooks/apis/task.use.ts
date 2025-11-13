import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { taskApi } from '@/apis';
import { parseResponse } from '@/lib/utils/response-parser';

// Query Hooks - 使用传统的React Query模式
export const useAllTasks = (options?: Omit<UseQueryOptions<Task.TaskVO[]>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const [data, error] = await parseResponse(taskApi.getAllTasks);
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

export const useTask = (
  taskName: string,
  options?: Omit<UseQueryOptions<Task.TaskVO>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['tasks', taskName],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => taskApi.getTask(taskName));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

export const useTaskExecutions = (
  query: Task.TaskExecutionQueryDTO,
  options?: Omit<UseQueryOptions<Task.TaskExecutionListVO>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['tasks', 'executions', 'history', query],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => taskApi.getTaskExecutions(query));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

export const useTaskExecution = (
  id: string,
  options?: Omit<UseQueryOptions<Task.TaskExecutionVO>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['tasks', 'executions', id],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => taskApi.getTaskExecution(id));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
};

export const useTaskStats = (
  taskName?: string,
  options?: Omit<UseQueryOptions<Task.TaskStatsVO>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['tasks', 'stats', taskName],
    queryFn: async () => {
      const [data, error] = await parseResponse(() => taskApi.getTaskStats(taskName));
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    enabled: !!taskName || options?.enabled,
    ...options,
  });
};

// Mutation Hooks
export const useExecuteTask = (
  options?: UseMutationOptions<Task.ExecuteTaskVO, unknown, { taskName: string; data: Task.ExecuteTaskDTO }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskName, data }: { taskName: string; data: Task.ExecuteTaskDTO }) => {
      const [result, error] = await parseResponse(() => taskApi.executeTask(taskName, data));
      if (error) {
        throw new Error(error.message);
      }
      return result!;
    },
    onSuccess: () => {
      // Invalidate task executions and stats queries
      queryClient.invalidateQueries({ queryKey: ['tasks', 'executions'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'stats'] });
    },
    ...options,
  });
};

// 新增：直接返回[data, error]模式的Hook
export const useAllTasksSafe = (
  options?: Omit<UseQueryOptions<[Task.TaskVO[] | null, Http.ErrorResponse | null]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['tasks', 'safe'],
    queryFn: () => parseResponse(taskApi.getAllTasks),
    ...options,
  });
};

export const useExecuteTaskSafe = (
  options?: UseMutationOptions<[Task.ExecuteTaskVO | null, Http.ErrorResponse | null], unknown, { taskName: string; data: Task.ExecuteTaskDTO }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskName, data }: { taskName: string; data: Task.ExecuteTaskDTO }) =>
      parseResponse(() => taskApi.executeTask(taskName, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'executions'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'stats'] });
    },
    ...options,
  });
};