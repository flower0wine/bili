"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CollapsibleContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextType | undefined>(undefined);

function useCollapsible() {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error("useCollapsible must be used within a Collapsible component");
  }
  return context;
}

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Collapsible({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  ...props
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div
        data-slot="collapsible"
        data-state={open ? "open" : "closed"}
        className={cn("collapsible", className)}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function CollapsibleTrigger({
  children,
  className,
  onClick,
  ...props
}: CollapsibleTriggerProps) {
  const { open, onOpenChange } = useCollapsible();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onOpenChange(!open);
    onClick?.(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      data-slot="collapsible-trigger"
      data-state={open ? "open" : "closed"}
      className={cn(
        "inline-flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function CollapsibleContent({
  children,
  className,
  ...props
}: CollapsibleContentProps) {
  const { open } = useCollapsible();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    const element = contentRef.current;
    if (!element)
      return;

    if (open) {
      // 打开时，设置高度为内容高度
      const scrollHeight = element.scrollHeight;
      setHeight(scrollHeight);
    }
    else {
      // 关闭时，设置高度为 0
      setHeight(0);
    }
  }, [open]);

  return (
    <div
      ref={contentRef}
      data-slot="collapsible-content"
      data-state={open ? "open" : "closed"}
      className={cn(
        "overflow-hidden transition-all duration-200 ease-in-out",
        className
      )}
      style={{
        height: height !== undefined ? `${height}px` : "auto",
      }}
      {...props}
    >
      <div>
        {children}
      </div>
    </div>
  );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
