"use client";

import { motion } from "framer-motion";

interface StatsCardSuspenseProps {
  count?: number;
  showTrend?: boolean;
}

export function StatsCardSuspense({ count = 1, showTrend = true }: StatsCardSuspenseProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={`stat-card-${index}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: index * 0.1,
            type: "spring",
            stiffness: 200,
          }}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
          }}
          className="border rounded-lg bg-card p-6 text-card-foreground shadow-sm"
        >
          <div className="flex items-center justify-between pb-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            {showTrend && (
              <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>

          {/* 如果需要，可以添加额外的骨架屏元素 */}
          {showTrend && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}