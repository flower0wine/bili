"use client";

import { useEffect, useState } from "react";

interface ChartLoadingAnimationProps {
  /**
   * 主题颜色 - 'red' 或 'blue'
   */
  theme: "red" | "blue";
  /**
   * 加载文本
   */
  text?: string;
}

export function ChartLoadingAnimation({ theme, text = "正在加载图表..." }: ChartLoadingAnimationProps) {
  const [barData, setBarData] = useState<Array<{ id: number; height: number; position: number }>>([]);

  // 主题颜色配置
  const themeColors = {
    red: {
      primary: "bg-red-500",
      secondary: "bg-red-400",
      tertiary: "bg-red-300",
      gradient: "from-red-500 to-red-400"
    },
    blue: {
      primary: "bg-blue-500",
      secondary: "bg-blue-400",
      tertiary: "bg-blue-300",
      gradient: "from-blue-500 to-blue-400"
    }
  };

  const colors = themeColors[theme];

  // 初始化柱状图数据
  useEffect(() => {
    const initialData = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      height: Math.random() * 60 + 20,
      position: i
    }));
    setBarData(initialData);
  }, []);

  // 动画效果 - 分步执行：先高度动画，再位置动画
  useEffect(() => {
    const interval = setInterval(() => {
      // 第一步：只更新高度，保持原始位置
      setBarData((prev) => {
        return prev.map(bar => ({
          ...bar,
          height: Math.random() * 60 + 20,
        }));
      });

      // 第二步：延迟执行位置排序动画
      setTimeout(() => {
        setBarData((prev) => {
          // 创建一个包含高度和原始索引的数组用于排序
          const heightWithIndex = prev.map((bar, index) => ({
            height: bar.height,
            originalIndex: index
          }));

          // 按高度排序
          heightWithIndex.sort((a, b) => b.height - a.height);

          // 为每个元素计算新的视觉位置，但保持DOM顺序不变
          return prev.map((bar) => {
            // 找到当前元素在排序后的位置
            const sortedIndex = heightWithIndex.findIndex(item =>
              item.originalIndex === bar.id && item.height === bar.height
            );

            return {
              ...bar,
              position: sortedIndex // 新的视觉位置
            };
          });
        });
      }, 500); // 高度动画完成后再执行位置动画
    }, 1800); // 增加总周期时间

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-80 space-y-6">
      {/* 图表动画区域 */}
      <div className="relative w-64 h-32 bg-muted/20 rounded-lg p-4 overflow-hidden">
        {/* 背景网格线 */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-muted-foreground/20"
              style={{ top: `${(i + 1) * 20}%` }}
            />
          ))}
        </div>

        {/* 柱状图 */}
        <div className="relative h-full">
          {barData.map(bar => (
            <div
              key={bar.id}
              className={`absolute bottom-0 left-0 w-6 rounded-t-sm transition-all duration-400 ease-in-out ${colors.primary} overflow-hidden`}
              style={{
                height: `${bar.height}%`,
                transform: `translateX(${bar.position * 28}px)`,
                transitionProperty: "height, transform"
              }}
            >
              {/* 柱状图内部渐变效果 */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${colors.gradient} opacity-80`}
              />

              {/* 顶部高光效果 */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-t-sm" />

              {/* 脉冲动画 */}
              <div
                className={`absolute inset-0 ${colors.secondary} animate-pulse opacity-50`}
                style={{
                  animationDelay: `${bar.id * 100}ms`,
                  animationDuration: "1.5s"
                }}
              />
            </div>
          ))}
        </div>

        {/* X轴标签动画 */}
        <div className="absolute bottom-1 left-4 right-4 flex justify-around">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full ${colors.tertiary} animate-pulse`}
              style={{
                animationDelay: `${i * 150}ms`,
                animationDuration: "2s"
              }}
            />
          ))}
        </div>
      </div>

      {/* 加载文本 */}
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${colors.primary} animate-bounce`}
              style={{
                animationDelay: `${i * 200}ms`,
                animationDuration: "1s"
              }}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {text}
        </span>
      </div>


      <style jsx>
        {`
        @keyframes loading-progress {
          0% { width: 20%; }
          50% { width: 80%; }
          100% { width: 20%; }
        }
      `}
      </style>
    </div>
  );
}
