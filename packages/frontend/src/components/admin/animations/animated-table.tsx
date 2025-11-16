"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTableProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  rowDelay?: number;
}

interface AnimatedTableRowProps {
  children: ReactNode;
  className?: string;
  index?: number;
  delay?: number;
  interactive?: boolean;
}

interface AnimatedTableCellProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const tableContainerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const tableRowVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  hover: { scale: 1.01, backgroundColor: "rgba(0, 0, 0, 0.02)" }
};

const tableCellVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 }
};

export function AnimatedTableContainer({
  children,
  className,
  _staggerDelay = 0.05,
  _rowDelay = 0.1,
}: AnimatedTableProps) {
  return (
    <motion.div
      className={cn("space-y-4", className)}
      variants={tableContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className="border rounded-md"
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function AnimatedTableHeader({
  children,
  className,
}: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn("border-b bg-muted/50", className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedTableRow({
  children,
  className,
  index = 0,
  delay = 0,
  interactive = true,
}: AnimatedTableRowProps) {
  const calculatedDelay = delay + index * 0.05;

  return (
    <motion.div
      className={cn(
        "border-b transition-colors hover:bg-muted/50",
        interactive && "cursor-pointer",
        className
      )}
      variants={tableRowVariants}
      initial="initial"
      animate="animate"
      whileHover={interactive ? "hover" : undefined}
      transition={{
        duration: 0.3,
        delay: calculatedDelay,
        type: "spring",
        stiffness: 200
      }}
      layout
    >
      {children}
    </motion.div>
  );
}

export function AnimatedTableCell({
  children,
  className,
  delay = 0,
}: AnimatedTableCellProps) {
  return (
    <motion.div
      className={cn("p-4", className)}
      variants={tableCellVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.2, delay }}
    >
      {children}
    </motion.div>
  );
}

// 用于数据加载时的骨架屏动画
export function AnimatedTableSkeleton({
  rowCount = 5,
  columnCount = 4,
  className,
}: {
  rowCount?: number;
  columnCount?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <motion.div
          key={`skeleton-row-${rowIndex}`}
          className="flex items-center border rounded-md p-4 space-x-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.3,
            delay: rowIndex * 0.1,
          }}
        >
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <div
              key={`skeleton-cell-${rowIndex}-${colIndex}`}
              className="h-4 flex-1 animate-pulse rounded bg-muted"
              style={{
                maxWidth: `${100 / columnCount}%`,
              }}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
}