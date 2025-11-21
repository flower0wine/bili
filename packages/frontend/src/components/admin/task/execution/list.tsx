"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { taskExecutionColumns } from "@/components/admin/task/execution/columns";
import { CommonPagination } from "@/components/common/pagination";
import { DataTable } from "@/components/ui/data-table";
import { useTaskExecutions } from "@/hooks/apis/task.use";

interface TaskExecutionListProps {
  initialError: string | null;
}

export function TaskExecutionList({ initialError }: TaskExecutionListProps): ReactNode {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error: queryError } = useTaskExecutions({
    page,
    limit,
  });

  const error = initialError && page === 1 ? initialError : queryError;
  const executions = data?.items ?? [];
  const total = data?.total ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">执行历史</h1>
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
        <h1 className="text-3xl font-bold tracking-tight">执行历史</h1>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            加载执行历史失败:
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
          <h1 className="text-3xl font-bold tracking-tight">执行历史</h1>
          <p className="text-sm text-muted-foreground mt-2">
            共
            {" "}
            {total}
            {" "}
            条记录
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-card">
        <DataTable columns={taskExecutionColumns} data={executions} />
      </div>

      <div className="flex items-center justify-end">
        <CommonPagination
          currentPage={page}
          totalPages={Math.ceil(total / limit)}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
