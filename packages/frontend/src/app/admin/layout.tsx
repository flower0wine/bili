import { AdminContent } from "@/components/admin/admin-content";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminContent>
          {children}
        </AdminContent>
      </SidebarInset>
    </SidebarProvider>
  );
}