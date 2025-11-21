"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenuButton, SidebarMenuSubButton } from "@/components/ui/sidebar/sidebar-menu";
import styles from "./sidebar-nav-link.module.css";

interface SidebarNavLinkProps {
  href: string;
  children: ReactNode;
  isSubItem?: boolean;
  className?: string;
}

export function SidebarNavLink({ href, children, isSubItem = false, className = "" }: SidebarNavLinkProps) {
  const pathname = usePathname();

  // 最长路径匹配：只高亮最具体的匹配路由
  const isExactMatch = pathname === href;
  const isChildRoute = pathname.startsWith(`${href}/`);

  // 检查是否有更具体的匹配（路径更深）
  const pathSegments = pathname.split("/").filter(Boolean);
  const hrefSegments = href.split("/").filter(Boolean);
  const hasMoreSpecificMatch = pathSegments.length > hrefSegments.length;

  const isActive = isExactMatch || (isChildRoute && !hasMoreSpecificMatch);

  // 根据激活状态添加样式到 Link
  const activeClassName = isActive ? styles.active : "";

  const Component = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;

  return (
    <Component asChild>
      <Link href={href} className={`${className} ${activeClassName}`}>
        {children}
      </Link>
    </Component>
  );
}
