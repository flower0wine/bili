import type { ApiResponse } from "@/types/http";
import type { CreateTriggerDTO, DeleteTriggerVO, TriggerVO, UpdateTriggerDTO } from "@/types/trigger";
import { api } from "@/lib/api/axios";

export const triggerApi = {
  getAllTriggers: async () => {
    return api.get<ApiResponse<TriggerVO[]>>(
      "/v1/triggers/cron",
    );
  },

  createTrigger: async (
    data: CreateTriggerDTO,
  ) => {
    return api.post<ApiResponse<TriggerVO>>(
      "/v1/triggers/cron",
      data,
    );
  },

  updateTrigger: async (
    id: string,
    data: UpdateTriggerDTO,
  ) => {
    return api.put<ApiResponse<TriggerVO>>(
      `/v1/triggers/cron/${id}`,
      data,
    );
  },

  deleteTrigger: async (
    id: string,
  ) => {
    return api.delete<ApiResponse<DeleteTriggerVO>>(
      `/v1/triggers/cron/${id}`,
    );
  },

  toggleTrigger: async (
    id: string,
  ) => {
    return api.post<ApiResponse<TriggerVO>>(
      `/v1/triggers/cron/${id}/toggle`,
    );
  },
};
