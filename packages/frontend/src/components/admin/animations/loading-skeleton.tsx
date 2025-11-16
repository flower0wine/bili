"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "shimmer";
}

const skeletonVariants = {
  pulse: {
    animate: {
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  },
  wave: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  },
  shimmer: {
    animate: {
      backgroundPosition: ["200% 0", "-200% 0"],
      transition: {
        duration: 2,
        ease: "linear",
        repeat: Infinity
      }
    }
  }
};

export function LoadingSkeleton({
  className,
  variant = "text",
  width,
  height,
  animation = "pulse",
}: LoadingSkeletonProps) {
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "",
    rounded: "rounded-md"
  };

  const isShimmer = animation === "shimmer";

  return (
    <motion.div
      className={cn(
        "bg-muted",
        variantClasses[variant],
        isShimmer && "bg-[length:200%_100%] bg-gradient-to-r from-transparent via-background to-transparent",
        className
      )}
      style={{
        width: width || "100%",
        height: height || "1rem",
      }}
      variants={skeletonVariants[animation]}
      animate="animate"
    />
  );
}

// 专用的卡片骨架屏
export function CardSkeleton({
  showHeader = true,
  showFooter = false,
  className,
}: {
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "rounded-lg border bg-card p-6 text-card-foreground shadow-sm",
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        type: "spring",
        stiffness: 200
      }}
    >
      {showHeader && (
        <div className="flex items-center justify-between pb-2 space-y-0">
          <LoadingSkeleton width={120} />
          <LoadingSkeleton variant="circular" width={16} height={16} />
        </div>
      )}

      <div className="space-y-3">
        <LoadingSkeleton height={32} width={80} />
        <LoadingSkeleton width={150} />
      </div>

      {showFooter && (
        <div className="mt-4 border-t pt-4">
          <div className="flex items-center space-x-2">
            <LoadingSkeleton width={12} height={12} variant="circular" />
            <LoadingSkeleton width={100} />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// 专用的表格行骨架屏
export function TableRowSkeleton({
  columnCount = 4,
  className,
}: {
  columnCount?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "flex items-center space-x-4 p-4 border-b",
        className
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {Array.from({ length: columnCount }).map((_, index) => (
        <LoadingSkeleton
          key={`skeleton-${index}`}
          className="flex-1"
          width={index === 0 ? 200 : undefined}
        />
      ))}
    </motion.div>
  );
}

// 专用的列表骨架屏
export function ListSkeleton({
  itemCount = 3,
  avatar = false,
  showDescription = true,
  className,
}: {
  itemCount?: number;
  avatar?: boolean;
  showDescription?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <motion.div
          key={`list-skeleton-${index}`}
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.1
          }}
        >
          {avatar && (
            <LoadingSkeleton variant="circular" width={40} height={40} />
          )}

          <div className="flex-1 space-y-2">
            <LoadingSkeleton width={index % 2 === 0 ? 200 : 250} />
            {showDescription && (
              <LoadingSkeleton width="60%" />
            )}
          </div>

          <LoadingSkeleton width={80} height={32} variant="rounded" />
        </motion.div>
      ))}
    </div>
  );
}

// 专用的表单骨架屏
export function FormSkeleton({
  fieldCount = 4,
  showButtons = true,
  className,
}: {
  fieldCount?: number;
  showButtons?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fieldCount }).map((_, index) => (
        <motion.div
          key={`form-skeleton-${index}`}
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.1
          }}
        >
          <LoadingSkeleton width={120} />
          <LoadingSkeleton height={40} variant="rounded" />
          <LoadingSkeleton width="60%" />
        </motion.div>
      ))}

      {showButtons && (
        <motion.div
          className="flex justify-end pt-4 space-x-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: fieldCount * 0.1 }}
        >
          <LoadingSkeleton width={80} height={40} variant="rounded" />
          <LoadingSkeleton width={100} height={40} variant="rounded" />
        </motion.div>
      )}
    </div>
  );
}