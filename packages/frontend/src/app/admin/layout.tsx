import { LayoutDashboard, Settings, Users } from "lucide-react";
import Link from "next/link";

import { Sidebar, SidebarProvider } from "@/components/ui/sidebar/sidebar";
import { SidebarContent } from "@/components/ui/sidebar/sidebar-content";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar/sidebar-group";
import { SidebarHeader } from "@/components/ui/sidebar/sidebar-header";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar/sidebar-menu";
import { SidebarTrigger } from "@/components/ui/sidebar/siderbar-trigger";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <span className="font-semibold">Admin</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>主菜单</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>仪表盘</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/admin/users" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>用户管理</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>系统</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/admin/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>设置</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <div className="flex items-center gap-4 border-b p-4">
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
