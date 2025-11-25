import type { ApiResponse } from "@/types/http";
import type { PaginationQuery } from "@/types/pagination";
import type {
  AllRunningTasksStatsVO,
  CancelAllResultVO,
  CancelByIdsResultVO,
  CancelByTaskNamesResultVO,
  ExecuteTaskDTO,
  ExecuteTaskVO,
  RunningTaskExecutionVO,
  TaskExecutionListVO,
  TaskExecutionQueryDTO,
  TaskExecutionVO,
  TaskVO,
} from "@/types/task";
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

  // 运行中的任务查询 API
  getAllRunningTasks: async () => {
    return api.get<ApiResponse<AllRunningTasksStatsVO>>(
      "/v1/tasks/running",
    );
  },

  getTaskExecutionsByName: async (
    taskName: string,
  ) => {
    return api.get<ApiResponse<RunningTaskExecutionVO[]>>(
      `/v1/tasks/running/${taskName}`,
    );
  },

  getTaskExecutionById: async (
    executionId: string,
  ) => {
    return api.get<ApiResponse<RunningTaskExecutionVO>>(
      `/v1/tasks/running/execution/${executionId}`,
    );
  },

  // 取消任务 API
  cancelExecutionsByIds: async (
    executionIds: string[],
    failFast?: boolean,
  ) => {
    return api.delete<ApiResponse<CancelByIdsResultVO>>(
      "/v1/tasks/executions/cancel/ids",
      { data: { executionIds, failFast } },
    );
  },

  cancelExecutionsByTaskNames: async (
    taskNames: string[],
    failFast?: boolean,
  ) => {
    return api.delete<ApiResponse<CancelByTaskNamesResultVO>>(
      "/v1/tasks/executions/cancel/taskNames",
      { data: { taskNames, failFast } },
    );
  },

  cancelAllExecutions: async (failFast?: boolean) => {
    return api.delete<ApiResponse<CancelAllResultVO>>(
      "/v1/tasks/executions/cancel/all",
      { data: { failFast } },
    );
  },
};
