import { AdminSidebar } from "@/components/admin/sidebar";
import { SidebarProvider, SidebarToggle } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultState="expanded" width={256} collapsedWidth={64}>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 bg-background m-4 shadow-sm rounded-xl">
          <div className="flex items-center gap-4 p-4 border-b">
            <SidebarToggle />
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
