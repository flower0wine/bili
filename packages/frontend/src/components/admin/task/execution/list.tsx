"use client";

import type { ReactNode } from "react";
import type { TaskExecutionListVO, TaskExecutionQueryDTO } from "@/types/task";
import { startTransition, useCallback, useEffect, useState } from "react";

import { toast } from "sonner";


import { taskExecutionColumns } from "@/components/admin/task/execution/columns";
import { ExecutionFilters } from "@/components/admin/task/execution/filters";
import { CommonPagination } from "@/components/common/pagination";
import { DataTable } from "@/components/ui/data-table";
import { useTaskExecutions } from "@/hooks/apis/task.use";
import { toError } from "@/lib/error.util";

interface TaskExecutionListProps {
  initialData?: TaskExecutionListVO | null;
  initialError: string | null;
}

export function TaskExecutionList({ initialData, initialError }: TaskExecutionListProps): ReactNode {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TaskExecutionQueryDTO>({});
  const limit = 10;

  const handleFiltersChange = useCallback((newFilters: TaskExecutionQueryDTO) => {
    startTransition(() => {
      setFilters(newFilters);
      setPage(1);
    });
  }, []);

  const { data, isLoading, error: queryError } = useTaskExecutions(
    {
      page,
      limit,
      ...filters,
    },
    { initialData: page === 1 && initialData ? initialData : undefined },
  );

  const err = initialError || queryError;
  const error = err && toError(err);

  const executions = data?.items ?? [];
  const total = data?.total ?? 0;

  // 初始加载时显示加载状态
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

  // 初始加载失败时显示错误
  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">执行历史</h1>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            加载执行历史失败:
            {" "}
            {error.message}
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

      <div className="rounded-lg bg-card p-4">
        <ExecutionFilters filters={filters} onFiltersChange={handleFiltersChange} />
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
