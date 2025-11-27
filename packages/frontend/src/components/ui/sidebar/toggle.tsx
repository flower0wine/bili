"use client";

import { PanelLeftIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "./context";

interface SidebarToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function SidebarToggle({ children, className, ...props }: SidebarToggleProps) {
  const { state, setState, isMobile, setOpenMobile } = useSidebarContext();

  const handleToggle = () => {
    if (isMobile) {
      setOpenMobile(true);
    }
    else {
      setState(state === "expanded" ? "collapsed" : "expanded");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      data-slot="sidebar-toggle"
      data-state={state}
      className={cn(
        "h-8 w-8 rounded-md transition-transform",
        className
      )}
      {...props}
    >
      {children || (
        <PanelLeftIcon className="h-4 w-4" />
      )}
    </Button>
  );
}
