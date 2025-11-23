"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { TriggerVO } from "@/types/trigger";
import { TriggerActionsCell } from "@/components/admin/trigger/actions-cell";
import { formatDateTime } from "@/lib/utils";

export const triggerColumns: ColumnDef<TriggerVO>[] = [
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
        }`}
        >
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
      return <div className="text-sm">{formatDateTime(timeStr)}</div>;
    },
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const trigger = row.original;
      return <TriggerActionsCell trigger={trigger} />;
    },
  },
];
