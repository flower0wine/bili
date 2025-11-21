"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

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
      return (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              // TODO: 执行任务
              console.log("Execute task:", task.name);
            }}
          >
            执行
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: 查看详情
              console.log("View task:", task.name);
            }}
          >
            详情
          </Button>
        </div>
      );
    },
  },
];
