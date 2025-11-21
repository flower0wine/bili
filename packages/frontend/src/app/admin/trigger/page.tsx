import { Suspense } from "react";
import { TriggerPageSkeleton } from "@/components/admin/trigger/skeleton";
import { TriggerListWrapper } from "@/components/admin/trigger/wrapper";

export default async function TriggerPage() {
  return (
    <Suspense fallback={<TriggerPageSkeleton />}>
      <TriggerListWrapper />
    </Suspense>
  );
}
