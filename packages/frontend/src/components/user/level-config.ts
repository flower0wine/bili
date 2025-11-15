/**
 * 等级系统统一配置中心
 * 所有等级相关逻辑和样式都在这里集中管理
 */

// 单一等级配置：包含所有需要的数据
export interface LevelConfig {
  bg: string;
  text: string;
  border: string;
  light: string;
}

// 等级数据定义
export const LEVELS: LevelConfig[] = [
  {
    bg: "bg-gray-500",
    text: "text-gray-600",
    border: "border-gray-500",
    light: "bg-gray-100",
  },
  {
    bg: "bg-blue-500",
    text: "text-blue-600",
    border: "border-blue-500",
    light: "bg-blue-100",
  },
  {
    bg: "bg-green-500",
    text: "text-green-600",
    border: "border-green-500",
    light: "bg-green-100",
  },
  {
    bg: "bg-yellow-600",
    text: "text-yellow-600",
    border: "border-yellow-600",
    light: "bg-yellow-100",
  },
  {
    bg: "bg-orange-500",
    text: "text-orange-600",
    border: "border-orange-500",
    light: "bg-orange-100",
  },
  {
    bg: "bg-red-500",
    text: "text-red-600",
    border: "border-red-500",
    light: "bg-red-100",
  },
];

// 硬核会员特殊配置
export const SENIOR_MEMBER = {
  ...LEVELS[LEVELS.length - 1], // 基于LV6配置
  colors: {
    bg: "bg-yellow-400",
    text: "text-yellow-600",
    border: "border-yellow-500",
    light: "bg-yellow-100",
  },
};

// 核心工具函数：获取等级配置
export function getLevelConfig(level: number, isSenior: boolean = false): LevelConfig {
  if (level === 6 && isSenior)
    return SENIOR_MEMBER;
  return LEVELS[level - 1] || LEVELS[0];
}

// 简化的等级信息
export interface LevelInfo {
  level: number;
  config: LevelConfig;
  isSenior: boolean;
  segments: Array<{
    index: number;
    isActive: boolean;
    isCompleted: boolean;
    config: LevelConfig;
  }>;
}

// 统一的等级信息生成函数
export function createLevelInfo(level: number, isSenior: boolean): LevelInfo {
  const config = getLevelConfig(level, isSenior);

  // 生成分段数据（保持UI功能完整）
  const segments = LEVELS.map((segConfig, index) => ({
    index,
    isActive: index + 1 === level,
    isCompleted: index + 1 <= level,
    config: index === 6 && isSenior ? SENIOR_MEMBER : segConfig,
  }));

  return {
    level,
    config,
    isSenior: level === 6 && isSenior,
    segments,
  };
}
