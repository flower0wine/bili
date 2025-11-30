"use client";

import * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "./context";

interface SidebarTooltipContextType {
  isCollapsed: boolean;
  isMobile: boolean;
}

const SidebarTooltipContext = React.createContext<SidebarTooltipContextType | undefined>(undefined);

export function useSidebarTooltipContext() {
  const context = React.useContext(SidebarTooltipContext);
  if (!context) {
    throw new Error("useSidebarTooltipContext must be used within SidebarTooltip");
  }
  return context;
}

interface SidebarTooltipProps extends React.ComponentProps<typeof Tooltip> {
  children: React.ReactNode;
}

/**
 * 侧边栏专用 Tooltip 根组件
 * 提供上下文信息，控制何时显示 tooltip
 */
export function SidebarTooltip({ children, ...props }: SidebarTooltipProps) {
  const { isCollapsed, isMobile } = useSidebarContext();

  // 只在侧边栏收起且不是移动设备时显示 tooltip
  const shouldShow = isCollapsed && !isMobile;

  if (!shouldShow) {
    return <>{children}</>;
  }

  return (
    <SidebarTooltipContext.Provider value={{ isCollapsed, isMobile }}>
      <Tooltip {...props}>
        {children}
      </Tooltip>
    </SidebarTooltipContext.Provider>
  );
}

interface SidebarTooltipTriggerProps extends React.ComponentProps<typeof TooltipTrigger> {
  children: React.ReactNode;
}

/**
 * 侧边栏 Tooltip 触发器
 * 当 tooltip 不显示时，直接渲染子组件
 */
export function SidebarTooltipTrigger({ children, ...props }: SidebarTooltipTriggerProps) {
  try {
    useSidebarTooltipContext();
    // 在 SidebarTooltip 上下文中，使用 TooltipTrigger
    return (
      <TooltipTrigger asChild {...props}>
        {children}
      </TooltipTrigger>
    );
  }
  catch {
    // 不在 SidebarTooltip 上下文中，直接渲染子组件
    return <>{children}</>;
  }
}

interface SidebarTooltipContentProps extends React.ComponentProps<typeof TooltipContent> {
  children: React.ReactNode;
}

/**
 * 侧边栏 Tooltip 内容
 * 默认在右侧显示，距离为 8px
 * 当 tooltip 不显示时，不渲染任何内容
 */
export function SidebarTooltipContent({
  children,
  side = "right",
  sideOffset = 8,
  className,
  ...props
}: SidebarTooltipContentProps) {
  try {
    useSidebarTooltipContext();
    // 在 SidebarTooltip 上下文中，使用 TooltipContent
    return (
      <TooltipContent side={side} sideOffset={sideOffset} className={cn(className)} {...props}>
        {children}
      </TooltipContent>
    );
  }
  catch {
    // 不在 SidebarTooltip 上下文中，不渲染任何内容
    return null;
  }
}

/**
 * 便利函数：快速创建侧边栏 Tooltip
 * 用于简单场景，复杂场景建议使用组合方式
 */
interface SidebarTooltipSimpleProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  delayDuration?: number;
}

export function SidebarTooltipSimple({
  children,
  content,
  side = "right",
  delayDuration = 200,
}: SidebarTooltipSimpleProps) {
  return (
    <SidebarTooltip delayDuration={delayDuration}>
      <SidebarTooltipTrigger>
        {children}
      </SidebarTooltipTrigger>
      <SidebarTooltipContent side={side}>
        {content}
      </SidebarTooltipContent>
    </SidebarTooltip>
  );
}
