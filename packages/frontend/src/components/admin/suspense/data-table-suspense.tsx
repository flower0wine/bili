"use client";

import { motion } from "framer-motion";

interface DataTableSuspenseProps {
  rowCount?: number;
  columnCount?: number;
  showHeader?: boolean;
}

export function DataTableSuspense({
  rowCount = 10,
  columnCount = 5,
  showHeader = true,
}: DataTableSuspenseProps) {
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 表格头部骨架屏 */}
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <div className="h-10 w-64 animate-pulse border rounded-md bg-muted" />
            <div className="h-10 w-10 animate-pulse border rounded-md bg-muted" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-10 w-32 animate-pulse border rounded-md bg-muted" />
            <div className="h-10 w-24 animate-pulse border rounded-md bg-muted" />
          </div>
        </motion.div>
      )}

      {/* 表格骨架屏 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border rounded-md"
      >
        <div className="border-b bg-muted/50">
          {/* 表头 */}
          <div className="grid grid-cols-12 gap-4 p-4">
            {Array.from({ length: columnCount }).map((_, index) => (
              <div
                key={`header-${index}`}
                className="h-4 animate-pulse rounded bg-muted"
                style={{
                  gridColumn: `span ${Math.floor(12 / columnCount)}`,
                }}
              />
            ))}
          </div>
        </div>

        {/* 表格行 */}
        <div className="divide-y">
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <motion.div
              key={`row-${rowIndex}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                delay: rowIndex * 0.05,
              }}
              className="grid grid-cols-12 gap-4 p-4"
            >
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="h-4 animate-pulse rounded bg-muted"
                  style={{
                    gridColumn: `span ${Math.floor(12 / columnCount)}`,
                  }}
                />
              ))}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 分页骨架屏 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div className="text-sm text-muted-foreground">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex items-center space-x-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`pagination-${index}`}
              className="h-8 w-8 animate-pulse rounded bg-muted"
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}