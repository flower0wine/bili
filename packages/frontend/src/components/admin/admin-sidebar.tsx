"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  ListChecks,
  PlusCircle,
  Timer,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const adminNavItems = [
  {
    title: "仪表板",
    icon: BarChart3,
    href: "/admin",
  },
  {
    title: "任务管理",
    icon: ListChecks,
    items: [
      {
        title: "任务列表",
        icon: ListChecks,
        href: "/admin/tasks",
      },
      {
        title: "执行历史",
        icon: Clock,
        href: "/admin/tasks/history",
      },
      {
        title: "任务统计",
        icon: TrendingUp,
        href: "/admin/tasks/stats",
      },
    ],
  },
  {
    title: "触发器管理",
    icon: Timer,
    items: [
      {
        title: "触发器列表",
        icon: Timer,
        href: "/admin/triggers",
      },
      {
        title: "创建触发器",
        icon: PlusCircle,
        href: "/admin/triggers/create",
      },
    ],
  },
  {
    title: "用户数据",
    icon: Users,
    items: [
      {
        title: "用户查询",
        icon: Users,
        href: "/admin/users",
      },
      {
        title: "用户统计",
        icon: UserCheck,
        href: "/admin/users/stats",
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BarChart3 className="h-6 w-6" />
          <span className="text-lg font-semibold">管理后台</span>
        </motion.div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {adminNavItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href || "/admin")}
                    tooltip={item.title}
                  >
                    {item.items
                      ? (
                          <motion.div
                            className="flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </motion.div>
                        )
                      : (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link href={item.href} className="flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </Link>
                          </motion.div>
                        )}
                  </SidebarMenuButton>

                  {item.items && (
                    <SidebarMenuSub>
                      {item.items.map(subItem => (
                        <SidebarMenuSubItem key={subItem.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActive(subItem.href)}
                          >
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Link href={subItem.href} className="flex items-center gap-2">
                                <subItem.icon className="h-4 w-4" />
                                <span>{subItem.title}</span>
                              </Link>
                            </motion.div>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>

                {item.title === "任务管理" && <SidebarSeparator />}
              </motion.div>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}