"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
}

/**
 * 可折叠的信息区块组件
 * 用于展示可展开/折叠的内容区域
 */
export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  className,
  titleClassName,
  contentClassName,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 bg-muted hover:bg-muted/80 transition-colors",
          titleClassName
        )}
      >
        {typeof title === "string"
          ? (
              <h3 className="font-semibold text-sm">{title}</h3>
            )
          : (
              <div className="flex-1">{title}</div>
            )}
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className={cn("px-4 py-3 space-y-3 border-t", contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
}
