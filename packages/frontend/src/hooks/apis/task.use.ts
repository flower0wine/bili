import type {
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { taskApi } from "@/apis";
import { parseResponse } from "@/lib/utils/response-parser";

export function useAllTasks(options?: Omit<UseQueryOptions<Task.TaskVO[]>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const [data, error] = await parseResponse(taskApi.getAllTasks);
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
}

export function useTask(taskName: string, options?: Omit<UseQueryOptions<Task.TaskVO>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: ["tasks", taskName],
    queryFn: async () => {
      const [data, error] = await parseResponse(async () =>
        taskApi.getTask(taskName),
      );
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
}

export function useTaskExecutions(query: Task.TaskExecutionQueryDTO, options?: Omit<
  UseQueryOptions<Task.TaskExecutionListVO>,
    "queryKey" | "queryFn"
>) {
  return useQuery({
    queryKey: ["tasks", "executions", "history", query],
    queryFn: async () => {
      const [data, error] = await parseResponse(async () =>
        taskApi.getTaskExecutions(query),
      );
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
}

export function useTaskExecution(id: string, options?: Omit<UseQueryOptions<Task.TaskExecutionVO>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: ["tasks", "executions", id],
    queryFn: async () => {
      const [data, error] = await parseResponse(async () =>
        taskApi.getTaskExecution(id),
      );
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
}

export function useTaskStats(taskName?: string, options?: Omit<UseQueryOptions<Task.TaskStatsVO>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: ["tasks", "stats", taskName],
    queryFn: async () => {
      const [data, error] = await parseResponse(async () =>
        taskApi.getTaskStats(taskName),
      );
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    enabled: !!taskName || options?.enabled,
    ...options,
  });
}

// Mutation Hooks
export function useExecuteTask(options?: UseMutationOptions<
  Task.ExecuteTaskVO,
  unknown,
  { taskName: string; data: Task.ExecuteTaskDTO }
>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskName,
      data,
    }: {
      taskName: string;
      data: Task.ExecuteTaskDTO;
    }) => {
      const [result, error] = await parseResponse(async () =>
        taskApi.executeTask(taskName, data),
      );
      if (error) {
        throw new Error(error.message);
      }
      return result!;
    },
    onSuccess: () => {
      // Invalidate task executions and stats queries
      queryClient.invalidateQueries({ queryKey: ["tasks", "executions"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "stats"] });
    },
    ...options,
  });
}
