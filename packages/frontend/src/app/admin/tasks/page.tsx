import { Suspense } from "react";
import { DataTableSuspense } from "@/components/admin/suspense";
import { TaskManagement } from "@/components/admin/task-management";

export default function TasksPage() {
  return (
    <Suspense fallback={<DataTableSuspense rowCount={5} columnCount={6} />}>
      <TaskManagement />
    </Suspense>
  );
}