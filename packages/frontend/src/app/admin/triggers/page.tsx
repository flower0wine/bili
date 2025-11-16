import { Suspense } from "react";
import { DataTableSuspense } from "@/components/admin/suspense";
import { TriggerManagement } from "@/components/admin/trigger-management-with-api";

export default function TriggersPage() {
  return (
    <Suspense fallback={<DataTableSuspense rowCount={5} columnCount={7} />}>
      <TriggerManagement />
    </Suspense>
  );
}