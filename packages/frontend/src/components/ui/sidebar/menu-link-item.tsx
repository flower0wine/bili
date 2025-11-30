"use client";

import Link from "next/link";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "./context";
import { useMenuItemContext } from "./menu";

interface MenuLinkItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export function MenuLinkItem({ href, children, className, ...props }: MenuLinkItemProps) {
  const { itemId, parentIds } = useMenuItemContext();
  const { routeToActiveMenuItemMapActions, routeToExpandedItemsMapActions } = useSidebarContext();

  useEffect(() => {
    routeToActiveMenuItemMapActions.set(href, itemId);
    routeToExpandedItemsMapActions.set(href, [...parentIds]);

    return () => {
      routeToActiveMenuItemMapActions.remove(href);
      routeToExpandedItemsMapActions.remove(href);
    };
  }, [href, itemId, parentIds]);

  return (
    <Link href={href} className={cn("justify-center h-full", className)} {...props}>
      {children}
    </Link>
  );
}
