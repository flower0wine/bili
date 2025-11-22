"use client";

import dayjs from "dayjs";
import { JsonViewer } from "@/components/common/json-viewer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ExecutionDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  execution: Task.TaskExecutionVO | null;
}

export function ExecutionDetailSheet({
  open,
  onOpenChange,
  execution,
}: ExecutionDetailSheetProps) {
  if (!execution)
    return null;

  const statusMap: Record<string, { label: string; color: string }> = {
    running: { label: "运行中", color: "bg-blue-100 text-blue-800" },
    completed: { label: "已完成", color: "bg-green-100 text-green-800" },
    failed: { label: "失败", color: "bg-red-100 text-red-800" },
    cancelled: { label: "已取消", color: "bg-gray-100 text-gray-800" },
  };

  const statusInfo = statusMap[execution.status] || {
    label: execution.status,
    color: "bg-gray-100 text-gray-800",
  };

  const durationSeconds = execution.duration ? (execution.duration / 1000).toFixed(2) : "-";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>任务执行详情</SheetTitle>
          <SheetDescription>
            {execution.taskName}
            {" - "}
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* 基本信息 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">基本信息</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">执行 ID</p>
                <p className="font-mono text-xs break-all">{execution.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">任务名称</p>
                <p>{execution.taskName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">触发源</p>
                <p>{execution.triggerSource}</p>
              </div>
              <div>
                <p className="text-muted-foreground">状态</p>
                <p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 时间信息 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">时间信息</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">开始时间</p>
                <p>{dayjs(execution.startedAt).format("YYYY-MM-DD HH:mm:ss")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">耗时</p>
                <p>
                  {durationSeconds}
                  s
                </p>
              </div>
              {execution.finishedAt && (
                <div>
                  <p className="text-muted-foreground">完成时间</p>
                  <p>{dayjs(execution.finishedAt).format("YYYY-MM-DD HH:mm:ss")}</p>
                </div>
              )}
            </div>
          </div>

          {/* 错误信息 */}
          {execution.error && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">错误信息</h3>
              <div className="bg-red-50 dark:bg-red-950 p-3 rounded text-sm text-red-800 dark:text-red-200 break-all">
                {execution.error}
              </div>
            </div>
          )}

          {/* JSON 详情 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">完整数据</h3>
            <JsonViewer
              data={execution}
              editable={false}
              height="300px"
              className="border rounded-lg overflow-hidden"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
