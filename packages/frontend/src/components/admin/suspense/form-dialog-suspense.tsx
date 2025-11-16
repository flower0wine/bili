"use client";

import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormDialogSuspenseProps {
  open?: boolean;
  title?: string;
  fieldCount?: number;
}

export function FormDialogSuspense({
  open = true,
  title = "加载中...",
  fieldCount = 5,
}: FormDialogSuspenseProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DialogTitle>{title}</DialogTitle>
          </motion.div>
        </DialogHeader>

        <motion.div
          className="py-4 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {Array.from({ length: fieldCount }).map((_, index) => (
            <motion.div
              key={`field-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                delay: 0.2 + index * 0.1,
              }}
              className="space-y-2"
            >
              {/* 字段标签 */}
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />

              {/* 字段输入 */}
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />

              {/* 字段描述 */}
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </motion.div>
          ))}

          {/* 选择字段示例 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="space-y-2"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`option-${index}`}
                  className="flex items-center space-x-2"
                >
                  <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* 对话框底部按钮 */}
        <motion.div
          className="flex justify-end pt-4 space-x-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="h-10 w-20 animate-pulse rounded-md bg-muted" />
          <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}