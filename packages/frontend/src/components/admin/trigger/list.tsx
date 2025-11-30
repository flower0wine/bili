"use client";

import type { ReactNode } from "react";
import type { TriggerVO } from "@/types/trigger";

import { useState } from "react";
import { triggerColumns } from "@/components/admin/trigger/columns";
import { TriggerFormSheet } from "@/components/admin/trigger/form-sheet";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useAllTriggers } from "@/hooks/apis/trigger.use";

interface TriggerListProps {
  initialData: TriggerVO[];
  initialError: string | null;
}

export function TriggerList({ initialData, initialError }: TriggerListProps): ReactNode {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: triggers = initialData, isLoading, error: queryError } = useAllTriggers({
    initialData,
  });

  const error = initialError || queryError;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">触发器管理</h1>
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
        <h1 className="text-3xl font-bold tracking-tight">触发器管理</h1>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            加载触发器失败:
            {" "}
            {error instanceof Error ? error.message : "未知错误"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">触发器管理</h1>
            <p className="text-sm text-muted-foreground mt-2">
              共
              {" "}
              {triggers.length}
              {" "}
              个触发器
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
          >
            新建触发器
          </Button>
        </div>

        <div className="rounded-lg bg-card">
          <DataTable columns={triggerColumns} data={triggers} />
        </div>
      </div>

      <TriggerFormSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  );
}
