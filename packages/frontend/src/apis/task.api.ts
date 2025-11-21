import type { AxiosResponse } from "axios";
import type { PaginationQuery } from "@/types/pagination";
import { api } from "@/lib/api/axios";

export const taskApi = {
  getAllTasks: async (): Promise<
    AxiosResponse<Http.ApiResponse<Task.TaskVO[]>>
  > => {
    return api.get<Http.ApiResponse<Task.TaskVO[]>>("/v1/tasks");
  },

  getTask: async (
    taskName: string,
  ): Promise<AxiosResponse<Http.ApiResponse<Task.TaskVO>>> => {
    return api.get<Http.ApiResponse<Task.TaskVO>>(
      `/v1/tasks/${taskName}`,
    );
  },

  executeTask: async (
    taskName: string,
    data: Task.ExecuteTaskDTO,
  ): Promise<AxiosResponse<Http.ApiResponse<Task.ExecuteTaskVO>>> => {
    return api.post<Http.ApiResponse<Task.ExecuteTaskVO>>(
      `/v1/tasks/${taskName}/execute`,
      data,
    );
  },

  getTaskExecutions: async (
    query: Task.TaskExecutionQueryDTO & PaginationQuery,
  ): Promise<AxiosResponse<Http.ApiResponse<Task.TaskExecutionListVO>>> => {
    return api.get<Http.ApiResponse<Task.TaskExecutionListVO>>(
      "/v1/tasks/executions/history",
      { params: query },
    );
  },

  getTaskExecution: async (
    id: string,
  ): Promise<AxiosResponse<Http.ApiResponse<Task.TaskExecutionVO>>> => {
    return api.get<Http.ApiResponse<Task.TaskExecutionVO>>(
      `/v1/tasks/executions/${id}`,
    );
  },

  getTaskStats: async (
    taskName?: string,
  ): Promise<AxiosResponse<Http.ApiResponse<Task.TaskStatsVO>>> => {
    return api.get<Http.ApiResponse<Task.TaskStatsVO>>(
      "/v1/tasks/stats/summary",
      {
        params: taskName ? { taskName } : undefined,
      },
    );
  },
};
