"use client";

import type { RunningTaskExecutionVO } from "@/types/task";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CancelExecutionDialog } from "@/components/admin/task/cancel-execution-dialog";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCancelExecutionsByIds } from "@/hooks/apis/task.use";
import { toError } from "@/lib/error.util";
import { cn } from "@/lib/utils";

interface RunningTasksSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  executions: RunningTaskExecutionVO[];
  isLoading?: boolean;
}

function DataRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground min-w-fit">{label}</span>
      <span className={cn("text-sm text-right wrap-break-word flex-1", mono && "font-mono text-xs")}>
        {value}
      </span>
    </div>
  );
}

export function RunningTasksSheet({
  open,
  onOpenChange,
  taskName,
  executions,
  isLoading = false,
}: RunningTasksSheetProps) {
  const [selectedExecutionIds, setSelectedExecutionIds] = useState<Set<string>>(new Set());
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string>("");
  const cancelMutation = useCancelExecutionsByIds();

  const handleSelectExecution = (executionId: string) => {
    const newSelected = new Set(selectedExecutionIds);
    if (newSelected.has(executionId)) {
      newSelected.delete(executionId);
    }
    else {
      newSelected.add(executionId);
    }
    setSelectedExecutionIds(newSelected);
  };

  const handleCancelSelected = async () => {
    if (selectedExecutionIds.size === 0) {
      toast.error("请选择要停止的任务");
      return;
    }

    try {
      const result = await cancelMutation.mutateAsync({
        executionIds: Array.from(selectedExecutionIds),
      });

      if (result.cancelled.length > 0) {
        toast.success(`成功停止 ${result.cancelled.length} 个任务`);
      }

      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} 个任务停止失败`);
      }

      setSelectedExecutionIds(new Set());
    }
    catch (e) {
      const error = toError(e);
      toast.error(error.message);
    }
  };

  const handleCancelSingleExecution = async () => {
    try {
      const result = await cancelMutation.mutateAsync({
        executionIds: [selectedExecutionId],
      });

      if (result.cancelled.length > 0) {
        toast.success("任务已停止");
      }

      if (result.failed.length > 0) {
        toast.error("停止任务失败");
      }

      setCancelDialogOpen(false);
      setSelectedExecutionId("");
    }
    catch (e) {
      const error = toError(e);
      toast.error(error.message);
    }
  };

  const handleCancelAll = async () => {
    if (executions.length === 0) {
      toast.error("没有正在运行的任务");
      return;
    }

    try {
      const result = await cancelMutation.mutateAsync({
        executionIds: executions.map(e => e.executionId),
      });

      if (result.cancelled.length > 0) {
        toast.success(`成功停止 ${result.cancelled.length} 个任务`);
      }

      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} 个任务停止失败`);
      }

      setSelectedExecutionIds(new Set());
    }
    catch (e) {
      const error = toError(e);
      toast.error(error.message);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>正在运行的任务</SheetTitle>
          <SheetDescription>
            {taskName}
            {" "}
            (
            {executions.length}
            {" "}
            个)
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {isLoading
            ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              )
            : executions.length === 0
              ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无正在运行的任务
                  </div>
                )
              : (
                  <>
                    <div className="flex justify-end gap-2 pr-2">
                      {selectedExecutionIds.size > 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleCancelSelected}
                          disabled={cancelMutation.isPending}
                        >
                          停止已选中 (
                          {selectedExecutionIds.size}
                          )
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelAll}
                        disabled={cancelMutation.isPending}
                      >
                        停止全部
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {executions.map(execution => (
                        <CollapsibleSection
                          key={execution.executionId}
                          title={(
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="checkbox"
                                checked={selectedExecutionIds.has(execution.executionId)}
                                onChange={() => handleSelectExecution(execution.executionId)}
                                onClick={e => e.stopPropagation()}
                                className="w-4 h-4"
                              />
                              <span className="flex-1 text-sm">
                                执行 ID:
                                {" "}
                                {execution.executionId}
                              </span>
                              <span className="text-xs text-muted-foreground pr-2">
                                {new Date(execution.startedAt).toLocaleString()}
                              </span>
                            </div>
                          )}
                          defaultOpen={false}
                        >
                          <DataRow label="执行 ID" value={execution.executionId} mono />
                          <DataRow label="触发源" value={execution.source} />
                          <DataRow label="触发器名称" value={execution.triggerName || "无"} />
                          <DataRow label="重试次数" value={`${execution.retryCount}/${execution.maxRetries}`} />
                          <DataRow label="开始时间" value={new Date(execution.startedAt).toLocaleString()} />
                          <DataRow label="触发时间" value={new Date(execution.triggeredAt).toLocaleString()} />

                          {execution.logs && execution.logs.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="text-sm font-semibold mb-2">执行日志</h4>
                              <div className="space-y-1 max-h-48 overflow-y-auto bg-muted p-2 rounded text-xs font-mono">
                                {execution.logs.map((log, idx) => (
                                  <div key={idx} className="text-muted-foreground">
                                    <span className={cn(
                                      log.level === "error" && "text-destructive",
                                      log.level === "warn" && "text-yellow-600",
                                      log.level === "info" && "text-blue-600",
                                    )}
                                    >
                                      [
                                      {log.level.toUpperCase()}
                                      ]
                                    </span>
                                    {" "}
                                    {log.message}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {execution.params && Object.keys(execution.params).length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="text-sm font-semibold mb-2">执行参数</h4>
                              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                                {JSON.stringify(execution.params, null, 2)}
                              </pre>
                            </div>
                          )}

                          <div className="mt-4 pt-4 border-t">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedExecutionId(execution.executionId);
                                setCancelDialogOpen(true);
                              }}
                              disabled={cancelMutation.isPending}
                              className="w-full"
                            >
                              停止此任务
                            </Button>
                          </div>
                        </CollapsibleSection>
                      ))}
                    </div>
                  </>
                )}
        </div>
      </SheetContent>

      <CancelExecutionDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        executionId={selectedExecutionId}
        onConfirm={handleCancelSingleExecution}
        isLoading={cancelMutation.isPending}
      />
    </Sheet>
  );
}
