"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { TaskVO } from "@/types/task";
import { useState } from "react";
import { TaskActionsCell } from "@/components/admin/task/actions-cell";
import { RunningTasksSheet } from "@/components/admin/task/running-tasks-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAllRunningTasks, useTaskExecutionsByName } from "@/hooks/apis/task.use";

export const taskColumns: ColumnDef<TaskVO>[] = [
  {
    accessorKey: "name",
    header: "任务名称",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "描述",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.getValue("description") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "name",
    id: "running",
    header: "正在运行",
    cell: ({ row }) => {
      const taskName = row.original.name;
      const [sheetOpen, setSheetOpen] = useState(false);
      const { data: allRunningStats, isLoading: statsLoading } = useAllRunningTasks();
      const { data: executions = [], isLoading: executionsLoading } = useTaskExecutionsByName(taskName);

      const taskRunningCount = allRunningStats?.stats.find(s => s.taskName === taskName)?.count ?? 0;
      const isLoading = statsLoading || executionsLoading;
      const hasRunning = taskRunningCount > 0;

      return (
        <>
          <div className="flex items-center justify-center gap-2">
            {isLoading
              ? (
                  <Badge variant="secondary">加载中...</Badge>
                )
              : hasRunning
                ? (
                    <>
                      <Badge variant="destructive">{taskRunningCount}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSheetOpen(true)}
                      >
                        查看
                      </Button>
                    </>
                  )
                : (
                    <Badge variant="outline">无</Badge>
                  )}
          </div>

          <RunningTasksSheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            taskName={taskName}
            executions={executions}
            isLoading={executionsLoading}
          />
        </>
      );
    },
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const task = row.original;
      return <TaskActionsCell task={task} />;
    },
  },
];
