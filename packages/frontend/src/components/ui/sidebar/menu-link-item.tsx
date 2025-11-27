"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSidebarContext } from "./context";
import { useMenuItemContext } from "./menu";

interface MenuLinkItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export function MenuLinkItem({ href, children, className, ...props }: MenuLinkItemProps) {
  const { itemId, parentIds } = useMenuItemContext();
  const { routeToActiveMenuItemMap, routeToExpandedItemsMap, setRouteToActiveMenuItemMap, setRouteToExpandedItemsMap } = useSidebarContext();

  useEffect(() => {
    if (routeToActiveMenuItemMap.has(href)) {
      console.warn(`存在相同的 href: ${href}`);
    }
    routeToActiveMenuItemMap.set(href, itemId);
    setRouteToActiveMenuItemMap(routeToActiveMenuItemMap);

    if (routeToExpandedItemsMap.has(href)) {
      console.warn(`存在相同的 href: ${href}`);
    }
    routeToExpandedItemsMap.set(href, parentIds);
    setRouteToExpandedItemsMap(routeToExpandedItemsMap);

    return () => {
      routeToActiveMenuItemMap.delete(href);
      routeToExpandedItemsMap.delete(href);
    };
  }, [href, itemId, parentIds]);

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}
