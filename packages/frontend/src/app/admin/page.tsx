import { Suspense } from "react";
import { AdminPageWrapper } from "@/components/admin/admin-page-wrapper";
import { AdminPageSuspense } from "@/components/admin/suspense";

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminPageSuspense />}>
      <AdminPageWrapper />
    </Suspense>
  );
}