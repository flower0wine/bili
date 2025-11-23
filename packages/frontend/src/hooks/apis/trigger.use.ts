import type { CreateTriggerDTO, TriggerVO, UpdateTriggerDTO } from "@/types/trigger";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { triggerApi } from "@/apis";
import { ApiError } from "@/lib/request/axios";

// Query Hooks
export function useAllTriggers(options?: { initialData?: TriggerVO[] }) {
  return useQuery({
    queryKey: ["triggers", "cron"],
    queryFn: async () => {
      const response = await triggerApi.getAllTriggers();
      return response.data.data!;
    },
    initialData: options?.initialData,
  });
}

// Mutation Hooks
export function useCreateTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTriggerDTO) => {
      const response = await triggerApi.createTrigger(data);
      return response.data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triggers", "cron"] });
    },
    onError: (error) => {
      // 错误会自动传递到 onError 回调
      // 可以在这里进行全局错误处理
      if (ApiError.isApiError(error)) {
        console.error("API Error:", error.getFullMessage(), error.toJSON());
      }
      else {
        console.error("Unknown error:", error);
      }
    },
  });
}

export function useUpdateTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTriggerDTO }) => {
      const response = await triggerApi.updateTrigger(id, data);
      return response.data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triggers", "cron"] });
    },
    onError: (error) => {
      if (ApiError.isApiError(error)) {
        console.error("API Error:", error.getFullMessage(), error.toJSON());
      }
      else {
        console.error("Unknown error:", error);
      }
    },
  });
}

export function useDeleteTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await triggerApi.deleteTrigger(id);
      return response.data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triggers", "cron"] });
    },
  });
}

export function useToggleTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await triggerApi.toggleTrigger(id);
      return response.data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triggers", "cron"] });
    },
  });
}
