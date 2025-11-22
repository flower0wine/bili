import type { PaginationQuery } from "@/types/pagination";
import type { ExecuteTaskDTO, TaskExecutionListVO, TaskExecutionQueryDTO, TaskVO } from "@/types/task";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { taskApi } from "@/apis";

export function useAllTasks(options?: { initialData?: TaskVO[] }) {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await taskApi.getAllTasks();
      return response.data.data!;
    },
    initialData: options?.initialData,
  });
}

export function useTask(taskName: string) {
  return useQuery({
    queryKey: ["tasks", taskName],
    queryFn: async () => {
      const response = await taskApi.getTask(taskName);
      return response.data.data!;
    },
  });
}

export function useTaskExecutions(
  query: TaskExecutionQueryDTO & PaginationQuery,
  options?: { initialData?: TaskExecutionListVO },
) {
  return useQuery({
    queryKey: ["tasks", "executions", "history", query],
    queryFn: async () => {
      const response = await taskApi.getTaskExecutions(query);
      return response.data.data!;
    },
    initialData: options?.initialData,
  });
}

export function useTaskExecution(id: string) {
  return useQuery({
    queryKey: ["tasks", "executions", id],
    queryFn: async () => {
      const response = await taskApi.getTaskExecution(id);
      return response.data.data!;
    },
  });
}

export function useTaskStats(taskName?: string) {
  return useQuery({
    queryKey: ["tasks", "stats", taskName],
    queryFn: async () => {
      const response = await taskApi.getTaskStats(taskName);
      return response.data.data!;
    },
    enabled: !!taskName,
  });
}

// Mutation Hooks
export function useExecuteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskName,
      data,
    }: {
      taskName: string;
      data: ExecuteTaskDTO;
    }) => {
      const response = await taskApi.executeTask(taskName, data);
      return response.data.data!;
    },
    onSuccess: () => {
      // Invalidate task executions and stats queries
      queryClient.invalidateQueries({ queryKey: ["tasks", "executions"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "stats"] });
    },
  });
}
