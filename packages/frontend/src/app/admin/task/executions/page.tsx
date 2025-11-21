import { Suspense } from "react";
import { TaskExecutionPageSkeleton } from "@/components/admin/task/execution/skeleton";
import { TaskExecutionListWrapper } from "@/components/admin/task/execution/wrapper";

export default async function TaskExecutionsPage() {
  return (
    <Suspense fallback={<TaskExecutionPageSkeleton />}>
      <TaskExecutionListWrapper />
    </Suspense>
  );
}
