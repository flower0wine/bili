import { taskApi } from "@/apis";
import { TaskList } from "@/components/admin/task/list";

export async function TaskListWrapper() {
  let initialData: Task.TaskVO[] = [];
  let error: string | null = null;

  try {
    const response = await taskApi.getAllTasks();
    initialData = response.data.data || [];
  }
  catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch tasks";
  }

  return <TaskList initialData={initialData} initialError={error} />;
}
