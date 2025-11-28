"use client";

import { usePathname } from "next/navigation";
import * as React from "react";
import { useMap } from "react-use";

export type SidebarState = "expanded" | "collapsed";

export interface SidebarContextType {
  state: SidebarState;
  setState: (state: SidebarState) => void;
  isCollapsed: boolean;
  width: number;
  collapsedWidth: number;
  setWidth: (width: number) => void;
  showIconsWhenCollapsed: boolean;
  setShowIconsWhenCollapsed: (show: boolean) => void;
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  activeMenuItemId: string | null;
  setActiveMenuItemId: (id: string | null) => void;
  expandedItems: Set<string>;
  setExpandedItems: (items: Set<string>) => void;
  toggleExpandedItem: (id: string) => void;
  /** 路由到激活菜单项的映射 */
  routeToActiveMenuItemMap: Record<string, string>;
  routeToActiveMenuItemMapActions: {
    set: (key: string, value: string) => void;
    remove: (key: string) => void;
    reset: () => void;
  };
  /** 路由到需要展开的菜单项的映射 */
  routeToExpandedItemsMap: Record<string, string[]>;
  routeToExpandedItemsMapActions: {
    set: (key: string, value: string[]) => void;
    remove: (key: string) => void;
    reset: () => void;
  };
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function useSidebarContext() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within SidebarProvider");
  }
  return context;
}

export interface SidebarProviderProps {
  children: React.ReactNode;
  defaultState?: SidebarState;
  width?: number;
  collapsedWidth?: number;
  showIconsWhenCollapsed?: boolean;
  onStateChange?: (state: SidebarState) => void;
}

export function SidebarProvider({
  children,
  defaultState = "expanded",
  width = 256,
  collapsedWidth = 64,
  showIconsWhenCollapsed = true,
  onStateChange,
}: SidebarProviderProps) {
  const pathname = usePathname();
  const [state, setState] = React.useState<SidebarState>(defaultState);
  const [sidebarWidth, setSidebarWidth] = React.useState(width);
  const [showIcons, setShowIcons] = React.useState(showIconsWhenCollapsed);
  const [openMobile, setOpenMobile] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [activeMenuItemId, setActiveMenuItemId] = React.useState<string | null>(null);
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());
  const [routeToActiveMenuItemMap, routeToActiveMenuItemMapActions] = useMap<Record<string, string>>({});
  const [routeToExpandedItemsMap, routeToExpandedItemsMapActions] = useMap<Record<string, string[]>>({});

  const toggleExpandedItem = React.useCallback((id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      }
      else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // 检测移动设备
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 处理状态变化
  const handleStateChange = React.useCallback(
    (newState: SidebarState) => {
      setState(newState);
      onStateChange?.(newState);
      // 保存到 localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar-state", newState);
      }
    },
    []
  );

  // 初始化时从 localStorage 读取状态
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-state") as SidebarState | null;
      if (saved) {
        setState(saved);
      }
    }
  }, []);

  // 监听路由变化，自动设置激活菜单项和展开状态
  // 根据当前路由查找对应的菜单项
  React.useEffect(() => {
    const activeMenuId = routeToActiveMenuItemMap[pathname];
    const expandedIds = routeToExpandedItemsMap[pathname];

    if (activeMenuId) {
      setActiveMenuItemId(activeMenuId);
    }

    if (expandedIds) {
      setExpandedItems(new Set(expandedIds));
    }
  }, [pathname, routeToActiveMenuItemMap, routeToExpandedItemsMap]);

  return (
    <SidebarContext.Provider value={{
      state,
      setState: handleStateChange,
      isCollapsed: state === "collapsed",
      width: sidebarWidth,
      collapsedWidth,
      setWidth: setSidebarWidth,
      showIconsWhenCollapsed: showIcons,
      setShowIconsWhenCollapsed: setShowIcons,
      isMobile,
      openMobile,
      setOpenMobile,
      activeMenuItemId,
      setActiveMenuItemId,
      expandedItems,
      setExpandedItems,
      toggleExpandedItem,
      routeToActiveMenuItemMap,
      routeToActiveMenuItemMapActions,
      routeToExpandedItemsMap,
      routeToExpandedItemsMapActions,
    }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
