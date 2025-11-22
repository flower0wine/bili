import { CheckSquare, ChevronDown, LayoutDashboard, Zap } from "lucide-react";

import { SidebarNavLink } from "@/components/admin/sidebar-nav-link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sidebar } from "@/components/ui/sidebar/sidebar";
import { SidebarContent } from "@/components/ui/sidebar/sidebar-content";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar/sidebar-group";
import { SidebarHeader } from "@/components/ui/sidebar/sidebar-header";
import { SidebarMenu, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem } from "@/components/ui/sidebar/sidebar-menu";

export function AdminSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="font-semibold group-data-[collapsible=icon]:hidden">Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>系统</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger className="flex items-center gap-2 px-1 py-0">
                    <SidebarNavLink href="/admin">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="group-data-[state=collapsed]:hidden">仪表盘</span>
                    </SidebarNavLink>
                  </CollapsibleTrigger>
                </Collapsible>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger className="flex items-center gap-2 group-data-[state=collapsed]:justify-center">
                    <CheckSquare className="h-4 w-4" />
                    <span className="group-data-[state=collapsed]:hidden">任务管理</span>
                    <ChevronDown className="w-4 h-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180 group-data-[state=collapsed]:hidden" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarNavLink href="/admin/task" isSubItem>
                          任务列表
                        </SidebarNavLink>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarNavLink href="/admin/task/executions" isSubItem>
                          执行历史
                        </SidebarNavLink>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger className="flex items-center gap-2 group-data-[state=collapsed]:justify-center">
                    <Zap className="h-4 w-4" />
                    <span className="group-data-[state=collapsed]:hidden">触发器管理</span>
                    <ChevronDown className="w-4 h-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180 group-data-[state=collapsed]:hidden" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarNavLink href="/admin/trigger" isSubItem>
                          触发器列表
                        </SidebarNavLink>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
