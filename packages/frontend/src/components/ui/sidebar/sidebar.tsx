"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "./context";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Sidebar({ children, className, ...props }: SidebarProps) {
  const { state, width, collapsedWidth, isMobile, openMobile, setOpenMobile } = useSidebarContext();

  const currentWidth = state === "expanded" ? width : collapsedWidth;

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          className="w-64 p-0 [&>button]:hidden"
          data-slot="sidebar-mobile"
        >
          <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      data-slot="sidebar-wrapper"
      className="flex"
      style={
        {
          "--sidebar-width": `${width}px`,
          "--sidebar-collapsed-width": `${collapsedWidth}px`,
        } as React.CSSProperties
      }
    >
      {/* 占位符 */}
      <div
        className="transition-[width] duration-300 ease-in-out"
        style={{ width: `${currentWidth}px` }}
      />

      {/* 实际侧边栏 */}
      <div
        data-slot="sidebar"
        data-state={state}
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out",
          className
        )}
        style={{ width: `${currentWidth}px` }}
        {...props}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
