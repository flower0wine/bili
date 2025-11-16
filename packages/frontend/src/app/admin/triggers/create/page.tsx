import { Suspense } from "react";
import { AdminPageSuspense } from "@/components/admin/suspense";
import { CreateTriggerPage as CreateTriggerForm } from "@/components/admin/trigger-form";

export default function CreateTriggerPage() {
  return (
    <Suspense fallback={<AdminPageSuspense />}>
      <CreateTriggerForm />
    </Suspense>
  );
}