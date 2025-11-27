"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "./context";


interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SidebarHeader({ children, className, ...props }: SidebarHeaderProps) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        "flex items-center justify-between px-4 py-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SidebarContent({ children, className, ...props }: SidebarContentProps) {
  const { state, isMobile } = useSidebarContext();

  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden",
        state === "collapsed" && !isMobile && "flex flex-col items-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SidebarFooter({ children, className, ...props }: SidebarFooterProps) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  label?: string;
}

export function SidebarGroup({ children, label, className, ...props }: SidebarGroupProps) {
  const { state } = useSidebarContext();

  return (
    <div
      data-slot="sidebar-group"
      className={cn("flex flex-col", className)}
      {...props}
    >
      {label && state !== "collapsed" && (
        <div
          data-slot="sidebar-group-label"
          className="px-4 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider"
        >
          {label}
        </div>
      )}
      <div data-slot="sidebar-group-content">
        {children}
      </div>
    </div>
  );
}
