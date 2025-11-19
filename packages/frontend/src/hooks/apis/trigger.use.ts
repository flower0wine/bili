import type {
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { triggerApi } from "@/apis";
import { parseResponse } from "@/lib/utils/response-parser";

// Query Hooks - 使用传统的React Query模式
export function useAllTriggers(options?: Omit<UseQueryOptions<Trigger.TriggerVO[]>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: ["triggers", "cron"],
    queryFn: async () => {
      const [data, error] = await parseResponse(triggerApi.getAllTriggers);
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
}

// Mutation Hooks
export function useCreateTrigger(options?: UseMutationOptions<
  Trigger.TriggerVO,
  unknown,
  Trigger.CreateTriggerDTO
>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const [result, error] = await parseResponse(async () =>
        triggerApi.createTrigger(data),
      );
      if (error) {
        throw new Error(error.message);
      }
      return result!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triggers", "cron"] });
    },
    ...options,
  });
}

export function useUpdateTrigger(options?: UseMutationOptions<
  Trigger.TriggerVO,
  unknown,
  { id: string; data: Trigger.UpdateTriggerDTO }
>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const [result, error] = await parseResponse(async () =>
        triggerApi.updateTrigger(id, data),
      );
      if (error) {
        throw new Error(error.message);
      }
      return result!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triggers", "cron"] });
    },
    ...options,
  });
}

export function useDeleteTrigger(options?: UseMutationOptions<Trigger.DeleteTriggerVO, unknown, string>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const [result, error] = await parseResponse(async () =>
        triggerApi.deleteTrigger(id),
      );
      if (error) {
        throw new Error(error.message);
      }
      return result!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triggers", "cron"] });
    },
    ...options,
  });
}

export function useToggleTrigger(options?: UseMutationOptions<Trigger.TriggerVO, unknown, string>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const [result, error] = await parseResponse(async () =>
        triggerApi.toggleTrigger(id),
      );
      if (error) {
        throw new Error(error.message);
      }
      return result!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triggers", "cron"] });
    },
    ...options,
  });
}
