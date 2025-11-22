"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { TaskActionsCell } from "@/components/admin/task/actions-cell";

export const taskColumns: ColumnDef<Task.TaskVO>[] = [
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
    accessorKey: "options",
    header: "选项",
    cell: ({ row }) => {
      const options = row.getValue("options");
      const optionsObj = options as Record<string, unknown>;
      return (
        <div className="text-xs">
          {Object.keys(optionsObj).length > 0
            ? `${Object.keys(optionsObj).length} 个选项`
            : "-"}
        </div>
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
