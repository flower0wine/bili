"use client";

import * as React from "react";
import { useSidebarContext } from "./context";

interface SidebarVisibilityProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * 当侧边栏处于此状态时显示内容
   * @default "expanded"
   */
  visibleWhen?: "expanded" | "collapsed" | "always";
}

/**
 * 根据侧边栏状态条件性地显示/隐藏内容
 * 不提供过渡动画，如需自定义动画请使用 useSidebarContext() 获取状态
 */
export function SidebarVisibility({
  children,
  visibleWhen = "expanded",
  className,
  ...props
}: SidebarVisibilityProps) {
  const { state, isMobile } = useSidebarContext();

  const isVisible
    = visibleWhen === "always" || isMobile
      || (visibleWhen === "expanded" && state === "expanded")
      || (visibleWhen === "collapsed" && state === "collapsed");

  if (!isVisible) {
    return null;
  }

  return (
    <div
      data-slot="sidebar-visibility"
      data-visible-when={visibleWhen}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}
