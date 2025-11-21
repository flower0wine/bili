"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export const triggerColumns: ColumnDef<Trigger.TriggerVO>[] = [
  {
    accessorKey: "name",
    header: "触发器名称",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "taskName",
    header: "关联任务",
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("taskName")}</div>
    ),
  },
  {
    accessorKey: "cron",
    header: "Cron 表达式",
    cell: ({ row }) => (
      <div className="text-xs font-mono">{row.getValue("cron")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "描述",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground max-w-xs truncate">
        {row.getValue("description") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "enabled",
    header: "状态",
    cell: ({ row }) => {
      const enabled = row.getValue("enabled");
      const isEnabled = Boolean(enabled);
      return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          isEnabled
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}>
          {isEnabled ? "启用" : "禁用"}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    cell: ({ row }) => {
      const time = row.getValue("createdAt");
      const timeStr = String(time);
      return <div className="text-sm">{new Date(timeStr).toLocaleString("zh-CN")}</div>;
    },
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const trigger = row.original;
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: 编辑触发器
              console.log("Edit trigger:", trigger.id);
            }}
          >
            编辑
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: 删除触发器
              console.log("Delete trigger:", trigger.id);
            }}
          >
            删除
          </Button>
        </div>
      );
    },
  },
];
