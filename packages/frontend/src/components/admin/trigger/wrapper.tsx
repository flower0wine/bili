import { triggerApi } from "@/apis";
import { TriggerList } from "@/components/admin/trigger/list";

export async function TriggerListWrapper() {
  let initialData: Trigger.TriggerVO[] = [];
  let error: string | null = null;

  try {
    const response = await triggerApi.getAllTriggers();
    initialData = response.data.data || [];
  }
  catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch triggers";
  }

  return <TriggerList initialData={initialData} initialError={error} />;
}
