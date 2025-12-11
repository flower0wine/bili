"use client";

import type { ReactNode } from "react";
import type { TaskVO } from "@/types/task";
import { useState } from "react";
import { toast } from "sonner";
import { CancelExecutionDialog } from "@/components/admin/task/cancel-execution-dialog";
import { taskColumns } from "@/components/admin/task/columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useAllRunningTasks, useAllTasks, useCancelAllExecutions } from "@/hooks/apis/task.use";
import { toError } from "@/lib/error.util";

interface TaskListProps {
  initialData: TaskVO[];
  initialError: string | null;
}

export function TaskList({ initialData, initialError }: TaskListProps): ReactNode {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { data: tasks = initialData, isLoading, error: queryError } = useAllTasks({
    initialData,
  });
  const { data: allRunningStats } = useAllRunningTasks();
  const cancelAllMutation = useCancelAllExecutions();

  const hasRunningTasks = (allRunningStats?.total ?? 0) > 0;

  const handleCancelAll = async () => {
    try {
      const result = await cancelAllMutation.mutateAsync(false);
      if (result.count > 0) {
        toast.success(`成功停止 ${result.count} 个任务`);
      }
      else {
        toast.info("没有正在运行的任务");
      }

      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} 个任务停止失败`);
      }

      setCancelDialogOpen(false);
    }
    catch (e) {
      const error = toError(e);
      toast.error(error.message);
    }
  };

  const err = initialError || queryError;
  const error = err && toError(err);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">任务管理</h1>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 w-full bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">任务管理</h1>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            加载任务失败:
            {" "}
            {error instanceof Error ? error.message : "未知错误"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">任务管理</h1>
          <p className="text-sm text-muted-foreground mt-2">
            共
            {" "}
            {tasks.length}
            {" "}
            个任务
          </p>
        </div>
        {hasRunningTasks && (
          <Button
            variant="destructive"
            onClick={() => setCancelDialogOpen(true)}
            disabled={cancelAllMutation.isPending}
          >
            停止所有任务
          </Button>
        )}
      </div>

      <div className="rounded-lg bg-card">
        <DataTable columns={taskColumns} data={tasks} />
      </div>

      <CancelExecutionDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="确认停止所有任务"
        description="确定要停止所有正在运行的任务吗？此操作无法撤销。"
        onConfirm={handleCancelAll}
        isLoading={cancelAllMutation.isPending}
      />
    </div>
  );
}
