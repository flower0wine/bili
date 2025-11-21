import { Suspense } from "react";
import { TaskPageSkeleton } from "@/components/admin/task/skeleton";
import { TaskListWrapper } from "@/components/admin/task/wrapper";

export default async function TaskPage() {
  return (
    <Suspense fallback={<TaskPageSkeleton />}>
      <TaskListWrapper />
    </Suspense>
  );
}
