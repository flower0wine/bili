import { CheckSquare, LayoutDashboard, Zap } from "lucide-react";

import {
  Menu,
  MenuItem,
  MenuItemIcon,
  MenuItemLabel,
  MenuLinkItem,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarTooltipSimple,
  SidebarVisibility,
} from "@/components/ui/sidebar";

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <SidebarVisibility visibleWhen="expanded">
            <span className="font-semibold">Admin</span>
          </SidebarVisibility>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup label="系统">
          <Menu>
            <MenuItem>
              <SidebarTooltipSimple content="仪表盘">
                <MenuLinkItem href="/admin" className="flex justify-center items-center gap-2 w-full">
                  <MenuItemIcon>
                    <LayoutDashboard className="h-4 w-4" />
                  </MenuItemIcon>
                  <MenuItemLabel>仪表盘</MenuItemLabel>
                </MenuLinkItem>
              </SidebarTooltipSimple>
            </MenuItem>

            <MenuItem
              submenu={(
                <Menu>
                  <MenuItem>
                    <SidebarTooltipSimple content="任务列表">
                      <MenuLinkItem href="/admin/task" className="flex items-center gap-2 w-full">
                        <MenuItemIcon>
                          <CheckSquare className="h-4 w-4" />
                        </MenuItemIcon>
                        <MenuItemLabel>任务列表</MenuItemLabel>
                      </MenuLinkItem>
                    </SidebarTooltipSimple>
                  </MenuItem>
                  <MenuItem>
                    <SidebarTooltipSimple content="执行历史">
                      <MenuLinkItem href="/admin/task/executions" className="flex items-center gap-2 w-full">
                        <MenuItemIcon>
                          <CheckSquare className="h-4 w-4" />
                        </MenuItemIcon>
                        <MenuItemLabel>执行历史</MenuItemLabel>
                      </MenuLinkItem>
                    </SidebarTooltipSimple>
                  </MenuItem>

                </Menu>
              )}
            >
              <MenuItemIcon>
                <CheckSquare className="h-4 w-4" />
              </MenuItemIcon>
              <MenuItemLabel>任务管理</MenuItemLabel>
            </MenuItem>
            <MenuItem
              submenu={(
                <Menu>
                  <MenuItem>
                    <SidebarTooltipSimple content="触发器列表">
                      <MenuLinkItem href="/admin/trigger" className="flex items-center gap-2 w-full">
                        <MenuItemIcon>
                          <Zap className="h-4 w-4" />
                        </MenuItemIcon>
                        <MenuItemLabel>触发器列表</MenuItemLabel>
                      </MenuLinkItem>
                    </SidebarTooltipSimple>
                  </MenuItem>
                </Menu>
              )}
            >
              <MenuItemIcon>
                <Zap className="h-4 w-4" />
              </MenuItemIcon>
              <MenuItemLabel>触发器管理</MenuItemLabel>
            </MenuItem>

          </Menu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
