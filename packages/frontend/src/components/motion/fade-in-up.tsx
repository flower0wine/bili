"use client";

import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { lazy, Suspense } from "react";

// 动态导入 motion 组件
const MotionDiv = lazy(async () => {
  const mod = await import("framer-motion");
  return { default: mod.motion.div };
});

interface FadeInUpProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /**
   * 动画延迟时间（秒）
   * @default 0
   */
  delay?: number;
  /**
   * 动画持续时间（秒）
   * @default 0.6
   */
  duration?: number;
  /**
   * 垂直偏移距离（像素）
   * @default 20
   */
  yOffset?: number;
  /**
   * 加载状态组件
   * 在 Framer Motion 代码加载时显示
   */
  fallback?: ReactNode;
}

/**
 * 淡入上移动画组件
 *
 * 从下方淡入并向上移动的动画效果，常用于卡片、内容区域的入场动画
 * 支持在 Framer Motion 代码加载时显示 fallback 组件
 *
 * @example
 * ```tsx
 * <FadeInUp
 *   delay={0.2}
 *   duration={0.8}
 *   fallback={<div className="animate-pulse bg-muted rounded-lg h-32" />}
 * >
 *   <div>内容</div>
 * </FadeInUp>
 * ```
 */
export function FadeInUp({
  children,
  delay = 0,
  duration = 0.6,
  yOffset = 20,
  fallback,
  ...props
}: FadeInUpProps) {
  return (
    <Suspense fallback={fallback || children}>
      <MotionDiv
        initial={{ opacity: 0, y: yOffset }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration, delay, ease: "easeOut" }}
        {...props}
      >
        {children}
      </MotionDiv>
    </Suspense>
  );
}
