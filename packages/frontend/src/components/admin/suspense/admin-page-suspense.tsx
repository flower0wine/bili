"use client";

import { motion } from "framer-motion";

export function AdminPageSuspense() {
  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 页面标题骨架屏 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div className="flex flex-col gap-2">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
      </motion.div>

      {/* 统计卡片骨架屏 */}
      <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={`stat-skeleton-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
              type: "spring",
              stiffness: 200
            }}
            className="border rounded-lg bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between pb-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 内容区域骨架屏 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 快速操作骨架屏 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="border rounded-lg bg-card p-6 shadow-sm"
        >
          <div className="mb-4 h-6 w-24 animate-pulse rounded bg-muted" />
          <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`action-skeleton-${index}`}
                className="h-10 w-full animate-pulse border rounded-md bg-muted"
              />
            ))}
          </div>
        </motion.div>

        {/* 最近活动骨架屏 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="border rounded-lg bg-card p-6 shadow-sm"
        >
          <div className="mb-4 h-6 w-24 animate-pulse rounded bg-muted" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`activity-skeleton-${index}`}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col gap-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}