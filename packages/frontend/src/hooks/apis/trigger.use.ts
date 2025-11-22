import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { triggerApi } from "@/apis";

// Query Hooks
export function useAllTriggers(options?: { initialData?: Trigger.TriggerVO[] }) {
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
    mutationFn: async (data: Trigger.CreateTriggerDTO) => {
      const response = await triggerApi.createTrigger(data);
      return response.data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triggers", "cron"] });
    },
  });
}

export function useUpdateTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Trigger.UpdateTriggerDTO }) => {
      const response = await triggerApi.updateTrigger(id, data);
      return response.data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triggers", "cron"] });
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
