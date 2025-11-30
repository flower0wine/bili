/**
 * 路由匹配和菜单映射工具
 * 用于根据当前路由激活菜单项和展开菜单
 */

/**
 * 菜单项路由配置
 */
export interface MenuItemRouteConfig {
  /** 菜单项ID */
  id: string;
  /** 关联的路由路径 */
  path: string;
}

/**
 * 可展开菜单项路由配置
 */
export interface ExpandableMenuItemRouteConfig {
  /** 菜单项ID */
  id: string;
  /** 关联的路由路径 */
  path: string;
  /** 子菜单项的ID数组（从父到子） */
  parentIds: string[];
}

/**
 * 路由匹配结果
 */
export interface RouteMatchResult {
  /** 激活的菜单项ID */
  activeMenuItemId: string | null;
  /** 需要展开的菜单项ID数组 */
  expandedItemIds: string[];
}

/**
 * 最长前缀匹配算法
 * 从多个路由中找到最匹配当前路径的路由
 *
 * @param currentPath 当前路由路径
 * @param routes 路由配置数组
 * @returns 最匹配的路由配置，如果没有匹配则返回 null
 */
function findLongestPrefixMatch<T extends { path: string }>(
  currentPath: string,
  routes: T[]
): T | null {
  let bestMatch: T | null = null;
  let longestMatchLength = 0;

  for (const route of routes) {
    // 检查当前路由是否与配置的路由匹配
    if (currentPath.startsWith(route.path)) {
      // 如果匹配长度更长，则更新最佳匹配
      if (route.path.length > longestMatchLength) {
        bestMatch = route;
        longestMatchLength = route.path.length;
      }
    }
  }

  return bestMatch;
}

/**
 * 根据当前路由匹配菜单项和展开状态
 *
 * @param currentPath 当前路由路径
 * @param menuItemRoutes 菜单项路由配置
 * @param expandableRoutes 可展开菜单项路由配置
 * @returns 路由匹配结果
 */
export function matchRouteToMenu(
  currentPath: string,
  menuItemRoutes: MenuItemRouteConfig[],
  expandableRoutes: ExpandableMenuItemRouteConfig[]
): RouteMatchResult {
  // 1. 使用最长前缀匹配找到激活的菜单项
  const activeMenuMatch = findLongestPrefixMatch(currentPath, menuItemRoutes);
  const activeMenuItemId = activeMenuMatch?.id ?? null;

  // 2. 找到所有需要展开的菜单项
  const expandedItemIds = new Set<string>();

  // 遍历所有可展开的菜单项配置
  for (const expandableRoute of expandableRoutes) {
    // 检查当前路由是否与该可展开菜单项的路由匹配
    if (currentPath.startsWith(expandableRoute.path)) {
      // 添加该菜单项及其所有父菜单项
      expandableRoute.parentIds.forEach((id) => expandedItemIds.add(id));
      expandedItemIds.add(expandableRoute.id);
    }
  }

  return {
    activeMenuItemId,
    expandedItemIds: Array.from(expandedItemIds),
  };
}

/**
 * 创建菜单项路由映射表
 * 用于快速查找菜单项对应的路由
 *
 * @param routes 菜单项路由配置
 * @returns 菜单项ID到路由的映射表
 */
export function createMenuItemRouteMap(
  routes: MenuItemRouteConfig[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const route of routes) {
    map.set(route.id, route.path);
  }
  return map;
}

/**
 * 创建可展开菜单项路由映射表
 * 用于快速查找可展开菜单项对应的路由
 *
 * @param routes 可展开菜单项路由配置
 * @returns 菜单项ID到路由配置的映射表
 */
export function createExpandableRouteMap(
  routes: ExpandableMenuItemRouteConfig[]
): Map<string, ExpandableMenuItemRouteConfig> {
  const map = new Map<string, ExpandableMenuItemRouteConfig>();
  for (const route of routes) {
    map.set(route.id, route);
  }
  return map;
}
