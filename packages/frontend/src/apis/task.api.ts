import type { ApiResponse } from "@/types/http";
import type { PaginationQuery } from "@/types/pagination";
import type { ExecuteTaskDTO, ExecuteTaskVO, TaskExecutionListVO, TaskExecutionQueryDTO, TaskExecutionVO, TaskStatsVO, TaskVO } from "@/types/task";
import { api } from "@/lib/request/axios";

export const taskApi = {
  getAllTasks: async () => {
    return api.get<ApiResponse<TaskVO[]>>("/v1/tasks");
  },

  getTask: async (
    taskName: string,
  ) => {
    return api.get<ApiResponse<TaskVO>>(
      `/v1/tasks/${taskName}`,
    );
  },

  executeTaskManually: async (
    taskName: string,
    data: ExecuteTaskDTO,
  ) => {
    return api.post<ApiResponse<ExecuteTaskVO>>(
      `/v1/tasks/${taskName}/execute/manual`,
      data,
    );
  },

  executeTaskViaAPI: async (
    taskName: string,
    data: ExecuteTaskDTO,
  ) => {
    return api.post<ApiResponse<ExecuteTaskVO>>(
      `/v1/tasks/${taskName}/execute/api`,
      data,
    );
  },

  getTaskExecutions: async (
    query: TaskExecutionQueryDTO & PaginationQuery,
  ) => {
    return api.get<ApiResponse<TaskExecutionListVO>>(
      "/v1/tasks/executions/history",
      { params: query },
    );
  },

  getTaskExecution: async (
    id: string,
  ) => {
    return api.get<ApiResponse<TaskExecutionVO>>(
      `/v1/tasks/executions/${id}`,
    );
  },
};
