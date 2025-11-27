"use client";

import { ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "./context";

interface MenuContextType {
  level: number;
  expandedItems: Set<string>;
  toggleItem: (id: string) => void;
}

interface MenuItemContextType {
  itemId: string;
  parentIds: string[];
}

const MenuContext = React.createContext<MenuContextType | undefined>(undefined);
const MenuItemContext = React.createContext<MenuItemContextType | undefined>(undefined);

function useMenuContext() {
  const context = React.useContext(MenuContext);
  if (!context) {
    throw new Error("useMenuContext must be used within Menu");
  }
  return context;
}

export function useMenuItemContext() {
  const context = React.useContext(MenuItemContext);
  if (!context) {
    throw new Error("useMenuItemContext must be used within MenuItem");
  }
  return context;
}

export function useMenuState() {
  return useMenuContext();
}

interface MenuProps extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode;
  level?: number;
}

export function Menu({ children, className, ...props }: MenuProps) {
  const { state, isMobile, expandedItems, toggleExpandedItem } = useSidebarContext();
  const INIT_LEVEL = 1;
  let level = INIT_LEVEL;
  try {
    ({ level } = useMenuContext());
    level++;
  }
  catch {
    // 可忽略错误, 因为顶级菜单没有提供 provider
  }

  const value: MenuContextType = React.useMemo(
    () => ({ level, expandedItems, toggleItem: toggleExpandedItem }),
    [level, expandedItems, toggleExpandedItem]
  );

  return (
    <MenuContext.Provider value={value}>
      <ul
        data-slot="menu"
        data-level={level}
        className={cn(
          "flex flex-col",
          level === INIT_LEVEL && "px-2",
          level > INIT_LEVEL && "ml-2 pl-2",
          state === "collapsed" && !isMobile && "items-center",
          className
        )}
        {...props}
      >
        {children}
      </ul>
    </MenuContext.Provider>
  );
}

interface MenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  submenu?: React.ReactNode;
  active?: boolean;
  contentClassName?: string;
}

export function MenuItem({ children, submenu, active, contentClassName, className, ...props }: MenuItemProps) {
  const { level, expandedItems, toggleItem } = useMenuContext();
  const { state, isMobile, activeMenuItemId, setActiveMenuItemId } = useSidebarContext();

  // 使用 React 18 的 useId 生成稳定的唯一 ID
  const itemId = React.useId();

  // 激活状态管理：外部传入 active 时使用外部值，否则检查是否为当前激活项
  const isActive = active !== undefined ? active : activeMenuItemId === itemId;

  const isExpanded = expandedItems.has(itemId);
  const hasSubmenu = !!submenu;
  const isCollapsed = state === "collapsed" && !isMobile;

  const handleClick = () => {
    if (hasSubmenu) {
      toggleItem(itemId);
    }
    else if (active === undefined) {
      // 只有在没有外部 active 控制时，才更新 SidebarContext 中的激活状态
      setActiveMenuItemId(itemId);
    }
  };

  // 获取父级的展开菜单项ID数组
  const parentIdsTemp: string[] = [];
  try {
    const { parentIds } = useMenuItemContext();
    parentIdsTemp.push(...parentIds);
  }
  catch {
    // 顶级菜单项没有父级上下文
  }

  if (hasSubmenu) {
    parentIdsTemp.push(itemId);
  }

  return (
    <MenuItemContext.Provider value={{
      itemId,
      parentIds: parentIdsTemp,
    }}
    >
      <li
        data-slot="menu-item"
        data-level={level}
        data-expanded={isExpanded}
        data-active={isActive}
        className={cn(
          "group/menu-item relative flex flex-col",
          className
        )}
        {...props}
      >
        <div
          data-slot="menu-item-content"
          onClick={handleClick}
          className={cn(
            "flex items-center gap-2 rounded-md text-sm transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            hasSubmenu && "cursor-pointer",
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
            // 侧边栏关闭时，让菜单项变成正方形
            isCollapsed ? "h-10 w-10 justify-center p-0" : "px-3 py-2",
            contentClassName
          )}
        >
          {children}
          {hasSubmenu && !isCollapsed && (
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 shrink-0 transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          )}
        </div>
        {submenu && !isCollapsed && (
          <MenuItemSubmenu isExpanded={isExpanded}>
            {submenu}
          </MenuItemSubmenu>
        )}
      </li>
    </MenuItemContext.Provider>
  );
}

interface MenuItemIconProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hideWhenCollapsed?: boolean;
}

export function MenuItemIcon({ children, hideWhenCollapsed = false, className, ...props }: MenuItemIconProps) {
  const { state, showIconsWhenCollapsed } = useSidebarContext();
  const shouldHide = state === "collapsed" && hideWhenCollapsed && !showIconsWhenCollapsed;

  return (
    <div
      data-slot="menu-item-icon"
      className={cn(
        "flex items-center justify-center shrink-0 w-4 h-4",
        shouldHide && "hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface MenuItemSubmenuIconProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function MenuItemSubmenuIcon({ children, className, ...props }: MenuItemSubmenuIconProps) {
  return (
    <div
      data-slot="menu-item-submenu-icon"
      className={cn(
        "flex items-center justify-center shrink-0 w-4 h-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface MenuItemLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function MenuItemLabel({ children, className, ...props }: MenuItemLabelProps) {
  const { state, showIconsWhenCollapsed, isMobile } = useSidebarContext();
  const shouldHide = isMobile ? false : state === "collapsed" && showIconsWhenCollapsed;

  return (
    <span
      data-slot="menu-item-label"
      className={cn(
        "flex-1 truncate transition-opacity duration-300",
        shouldHide && "hidden",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

interface MenuItemSubmenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isExpanded: boolean;
}

export function MenuItemSubmenu({ children, isExpanded, className, ...props }: MenuItemSubmenuProps) {
  return (
    <div
      data-slot="menu-item-submenu"
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        className
      )}
      style={{
        display: "grid",
        gridTemplateRows: isExpanded ? "1fr" : "0fr",
      }}
      {...props}
    >
      <div className="overflow-hidden">
        {children}
      </div>
    </div>
  );
}
