import { TaskExecutionList } from "@/components/admin/task/execution/list";

export async function TaskExecutionListWrapper() {
  let error: string | null = null;

  try {
    // 服务端不再需要获取初始数据，客户端会直接调用
  }
  catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch task executions";
  }

  return <TaskExecutionList initialError={error} />;
}
