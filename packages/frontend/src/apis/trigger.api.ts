import { AxiosResponse } from 'axios';
import { api } from '@/lib/api/axios';

export const triggerApi = {
  getAllTriggers: async (): Promise<AxiosResponse<Http.ApiResponse<Trigger.TriggerVO[]>>> => {
    return await api.get<Http.ApiResponse<Trigger.TriggerVO[]>>('/v1/triggers/cron');
  },

  createTrigger: async (data: Trigger.CreateTriggerDTO): Promise<AxiosResponse<Http.ApiResponse<Trigger.TriggerVO>>> => {
    return await api.post<Http.ApiResponse<Trigger.TriggerVO>>('/v1/triggers/cron', data);
  },

  updateTrigger: async (id: string, data: Trigger.UpdateTriggerDTO): Promise<AxiosResponse<Http.ApiResponse<Trigger.TriggerVO>>> => {
    return await api.put<Http.ApiResponse<Trigger.TriggerVO>>(`/v1/triggers/cron/${id}`, data);
  },

  deleteTrigger: async (id: string): Promise<AxiosResponse<Http.ApiResponse<Trigger.DeleteTriggerVO>>> => {
    return await api.delete<Http.ApiResponse<Trigger.DeleteTriggerVO>>(`/v1/triggers/cron/${id}`);
  },

  toggleTrigger: async (id: string): Promise<AxiosResponse<Http.ApiResponse<Trigger.TriggerVO>>> => {
    return await api.post<Http.ApiResponse<Trigger.TriggerVO>>(`/v1/triggers/cron/${id}/toggle`);
  },
};