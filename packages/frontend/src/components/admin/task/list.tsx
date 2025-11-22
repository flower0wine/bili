"use client";

import type { ReactNode } from "react";
import type { TaskVO } from "@/types/task";
import { taskColumns } from "@/components/admin/task/columns";
import { DataTable } from "@/components/ui/data-table";
import { useAllTasks } from "@/hooks/apis/task.use";

interface TaskListProps {
  initialData: TaskVO[];
  initialError: string | null;
}

export function TaskList({ initialData, initialError }: TaskListProps): ReactNode {
  const { data: tasks = initialData, isLoading, error: queryError } = useAllTasks({
    initialData,
  });

  const error = initialError || queryError;

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
      </div>

      <div className="rounded-lg bg-card">
        <DataTable columns={taskColumns} data={tasks} />
      </div>
    </div>
  );
}
