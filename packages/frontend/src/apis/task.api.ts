import { AxiosResponse } from 'axios';
import { api } from '@/lib/api/axios';

export const taskApi = {
  getAllTasks: async (): Promise<AxiosResponse<Http.ApiResponse<Task.TaskVO[]>>> => {
    return await api.get<Http.ApiResponse<Task.TaskVO[]>>('/tasks');
  },

  getTask: async (taskName: string): Promise<AxiosResponse<Http.ApiResponse<Task.TaskVO>>> => {
    return await api.get<Http.ApiResponse<Task.TaskVO>>(`/tasks/${taskName}`);
  },

  executeTask: async (taskName: string, data: Task.ExecuteTaskDTO): Promise<AxiosResponse<Http.ApiResponse<Task.ExecuteTaskVO>>> => {
    return await api.post<Http.ApiResponse<Task.ExecuteTaskVO>>(`/tasks/${taskName}/execute`, data);
  },

  getTaskExecutions: async (query: Task.TaskExecutionQueryDTO): Promise<AxiosResponse<Http.ApiResponse<Task.TaskExecutionListVO>>> => {
    return await api.get<Http.ApiResponse<Task.TaskExecutionListVO>>('/tasks/executions/history', { params: query });
  },

  getTaskExecution: async (id: string): Promise<AxiosResponse<Http.ApiResponse<Task.TaskExecutionVO>>> => {
    return await api.get<Http.ApiResponse<Task.TaskExecutionVO>>(`/tasks/executions/${id}`);
  },

  getTaskStats: async (taskName?: string): Promise<AxiosResponse<Http.ApiResponse<Task.TaskStatsVO>>> => {
    return await api.get<Http.ApiResponse<Task.TaskStatsVO>>('/tasks/stats/summary', {
      params: taskName ? { taskName } : undefined,
    });
  },
};