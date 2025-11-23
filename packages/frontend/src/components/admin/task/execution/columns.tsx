"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { TaskExecutionVO } from "@/types/task";

import { ExecutionActionsCell } from "@/components/admin/task/execution/actions-cell";
import { formatDateTime, formatDuration } from "@/lib/utils";

const statusMap: Record<string, { label: string; color: string }> = {
  running: { label: "运行中", color: "bg-blue-100 text-blue-800" },
  completed: { label: "已完成", color: "bg-green-100 text-green-800" },
  failed: { label: "失败", color: "bg-red-100 text-red-800" },
  cancelled: { label: "已取消", color: "bg-gray-100 text-gray-800" },
};

const triggerSourceMap: Record<string, string> = {
  cron: "定时任务",
  api: "API调用",
  manual: "手动调用"
};

export const taskExecutionColumns: ColumnDef<TaskExecutionVO>[] = [
  {
    accessorKey: "taskName",
    header: "任务名称",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("taskName")}</div>
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => {
      const status = row.getValue("status");
      const statusStr = String(status);
      const statusInfo = statusMap[statusStr] || { label: statusStr, color: "bg-gray-100 text-gray-800" };
      return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      );
    },
    filterFn: "equals",
  },
  {
    accessorKey: "triggerSource",
    header: "触发源",
    cell: ({ row }) => {
      const source = row.getValue("triggerSource");
      const sourceStr = String(source);
      return <div className="text-sm">{triggerSourceMap[sourceStr] || "未知触发源"}</div>;
    },
    filterFn: "equals",
  },
  {
    accessorKey: "startedAt",
    header: "开始时间",
    cell: ({ row }) => {
      const time = row.getValue("startedAt");
      const timeStr = String(time);
      return <div className="text-sm">{formatDateTime(timeStr)}</div>;
    },
  },
  {
    accessorKey: "duration",
    header: "耗时",
    cell: ({ row }) => {
      const duration = row.getValue("duration");
      if (!duration)
        return <div className="text-sm">-</div>;
      const durationNum = Number(duration);
      return (
        <div className="text-sm">
          {formatDuration(durationNum)}
        </div>
      );
    },
  },
  {
    accessorKey: "error",
    header: "错误信息",
    cell: ({ row }) => {
      const error = row.getValue("error");
      const errorStr = error ? String(error) : undefined;
      return (
        <div className="text-sm text-muted-foreground max-w-xs truncate">
          {errorStr || "-"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const execution = row.original;
      return <ExecutionActionsCell execution={execution} />;
    },
  },
];
