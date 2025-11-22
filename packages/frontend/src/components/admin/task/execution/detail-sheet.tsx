"use client";

import type { TaskExecutionVO } from "@/types/task";
import { JsonViewer } from "@/components/common/json-viewer";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn, formatDateTime, formatDuration } from "@/lib/utils";

interface ExecutionDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  execution: TaskExecutionVO | null;
}

function DataRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground min-w-fit">{label}</span>
      <span className={cn("text-sm text-right break-words flex-1", mono && "font-mono text-xs")}>
        {value}
      </span>
    </div>
  );
}

export function ExecutionDetailSheet({
  open,
  onOpenChange,
  execution,
}: ExecutionDetailSheetProps) {
  if (!execution)
    return null;

  const statusMap: Record<string, { label: string; className: string }> = {
    running: { label: "运行中", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200" },
    success: { label: "成功", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" },
    completed: { label: "已完成", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" },
    failed: { label: "失败", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200" },
    cancelled: { label: "已取消", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200" },
  };

  const statusInfo = statusMap[execution.status] || {
    label: execution.status,
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>任务执行详情</SheetTitle>
          <SheetDescription>
            {execution.taskName}
            {" - "}
            <span className={cn("px-2 py-1 rounded text-xs font-medium", statusInfo.className)}>
              {statusInfo.label}
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {/* 基本信息 */}
          <CollapsibleSection title="基本信息" defaultOpen={true}>
            <DataRow label="执行 ID" value={execution.id} mono />
            <DataRow label="任务名称" value={execution.taskName} />
            <DataRow label="触发源" value={execution.triggerSource} />
            <DataRow label="触发器名称" value={execution.triggerName || "-"} />
            <DataRow
              label="状态"
              value={(
                <span className={cn("px-2 py-1 rounded text-xs font-medium", statusInfo.className)}>
                  {statusInfo.label}
                </span>
              )}
            />
            <DataRow
              label="创建时间"
              value={formatDateTime(execution.createdAt)}
            />
            <DataRow
              label="开始时间"
              value={formatDateTime(execution.startedAt)}
            />
            <DataRow label="耗时" value={formatDuration(execution.duration)} />
            {execution.finishedAt && (
              <DataRow
                label="完成时间"
                value={formatDateTime(execution.finishedAt)}
              />
            )}
            {execution.updatedAt && (
              <DataRow
                label="更新时间"
                value={formatDateTime(execution.updatedAt)}
              />
            )}
            <DataRow label="当前重试次数" value={String(execution.retryCount || 0)} />
            <DataRow label="最大重试次数" value={String(execution.maxRetries || 0)} />
            {execution.result && typeof execution.result === "object"
              ? (
                  <>
                    {(execution.result as any).total !== undefined && (
                      <DataRow label="总数" value={String((execution.result as any).total)} />
                    )}
                    {(execution.result as any).failed !== undefined && (
                      <DataRow label="失败数" value={String((execution.result as any).failed)} />
                    )}
                    {(execution.result as any).success !== undefined && (
                      <DataRow label="成功数" value={String((execution.result as any).success)} />
                    )}
                  </>
                )
              : null}
          </CollapsibleSection>

          {/* 参数信息 */}
          {execution.params && Object.keys(execution.params).length > 0 && (
            <CollapsibleSection title="执行参数" defaultOpen={true}>
              <JsonViewer
                data={execution.params}
                editable={false}
                height="300px"
                className="border rounded-lg overflow-hidden"
              />
            </CollapsibleSection>
          )}

          {/* 错误信息 */}
          {execution.error && (
            <CollapsibleSection title="错误信息" defaultOpen={true}>
              <div className="bg-destructive/10 p-3 rounded text-sm text-destructive break-all font-mono">
                {execution.error}
              </div>
            </CollapsibleSection>
          )}

          {/* 完整 JSON */}
          <CollapsibleSection title="最终数据" defaultOpen={true}>
            <JsonViewer
              data={execution}
              editable={false}
              height="400px"
              showCopyButton={true}
            />
          </CollapsibleSection>
        </div>
      </SheetContent>
    </Sheet>
  );
}
