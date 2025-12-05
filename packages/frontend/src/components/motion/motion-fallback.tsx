interface MotionFallbackProps {
  /**
   * 高度
   * @default "auto"
   */
  height?: string;
  /**
   * 宽度
   * @default "100%"
   */
  width?: string;
  /**
   * 圆角
   * @default "rounded-2xl"
   */
  rounded?: string;
  /**
   * 自定义类名
   */
  className?: string;
}

/**
 * Motion 动画组件的 fallback 骨架屏
 *
 * 在 Framer Motion 代码加载时显示的占位组件
 *
 * @example
 * ```tsx
 * <FadeInUp fallback={<MotionFallback height="200px" />}>
 *   <div>内容</div>
 * </FadeInUp>
 * ```
 */
export function MotionFallback({
  height = "auto",
  width = "100%",
  rounded = "rounded-2xl",
  className = ""
}: MotionFallbackProps) {
  return (
    <div
      className={`animate-pulse bg-muted/50 ${rounded} ${className}`}
      style={{ height, width }}
    >
      <div className="flex items-center justify-center h-full">
        <div className="flex space-x-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 200}ms`,
                animationDuration: "1s"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
