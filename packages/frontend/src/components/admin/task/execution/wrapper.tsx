import { taskApi } from "@/apis";
import { TaskExecutionList } from "@/components/admin/task/execution/list";

export async function TaskExecutionListWrapper() {
  let initialData: Task.TaskExecutionListVO | null = null;
  let error: string | null = null;

  try {
    const response = await taskApi.getTaskExecutions({
      page: 1,
      limit: 10,
    });
    initialData = response.data.data || null;
  }
  catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch task executions";
  }

  return <TaskExecutionList initialData={initialData} initialError={error} />;
}
