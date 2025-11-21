import { AdminSidebar } from "@/components/admin/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar/siderbar-trigger";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-sidebar">
        <AdminSidebar />
        <main className="flex-1 bg-background m-4 shadow-sm rounded-xl">
          <div className="flex items-center gap-4 p-4 border-b">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">后台管理系统</h1>
          </div>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
