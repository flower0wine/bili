"use client";

import { motion } from "framer-motion";
import {
  Download,
  Filter,
  Play,
  RotateCcw,
  Search,
  Square,
} from "lucide-react";
import { useState } from "react";
import {
  AnimatedTableCell,
  AnimatedTableContainer,
  AnimatedTableRow,
} from "@/components/admin/animations";
import { DataTableSuspense } from "@/components/admin/suspense";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 模拟任务数据
const mockTasks = [
  {
    id: 1,
    name: "用户空间同步",
    description: "同步用户空间数据",
    status: "running",
    lastRun: "2024-01-16 10:30:00",
    nextRun: "2024-01-16 11:00:00",
    avgDuration: 2.5,
    successRate: 95.5,
  },
  {
    id: 2,
    name: "用户卡片更新",
    description: "更新用户卡片信息",
    status: "idle",
    lastRun: "2024-01-16 09:15:00",
    nextRun: "2024-01-16 10:15:00",
    avgDuration: 1.2,
    successRate: 98.2,
  },
  {
    id: 3,
    name: "数据备份",
    description: "备份数据库数据",
    status: "completed",
    lastRun: "2024-01-16 08:00:00",
    nextRun: "2024-01-17 08:00:00",
    avgDuration: 15.8,
    successRate: 99.1,
  },
  {
    id: 4,
    name: "日志清理",
    description: "清理过期日志文件",
    status: "failed",
    lastRun: "2024-01-16 07:30:00",
    nextRun: "2024-01-16 08:30:00",
    avgDuration: 0.8,
    successRate: 92.3,
  },
  {
    id: 5,
    name: "系统监控",
    description: "监控系统运行状态",
    status: "idle",
    lastRun: "2024-01-16 06:00:00",
    nextRun: "2024-01-16 07:00:00",
    avgDuration: 0.3,
    successRate: 100.0,
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "running":
      return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
    case "idle":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "running":
      return "运行中";
    case "completed":
      return "已完成";
    case "failed":
      return "失败";
    case "idle":
      return "空闲";
    default:
      return "未知";
  }
}

export function TaskManagement() {
  const [tasks, setTasks] = useState(mockTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleExecuteTask = (taskId: number) => {
    setIsLoading(true);
    setTimeout(() => {
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, status: "running" as const }
            : task
        )
      );
      setIsLoading(false);
    }, 1000);
  };

  const handleStopTask = (taskId: number) => {
    setIsLoading(true);
    setTimeout(() => {
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, status: "idle" as const }
            : task
        )
      );
      setIsLoading(false);
    }, 1000);
  };

  const filteredTasks = tasks.filter(task =>
    task.name.toLowerCase().includes(searchTerm.toLowerCase())
    || task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <DataTableSuspense rowCount={5} columnCount={6} />;
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">任务管理</h1>
          <p className="text-muted-foreground">
            管理和监控系统任务执行
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Button size="sm">
            <Play className="mr-2 h-4 w-4" />
            执行全部
          </Button>
        </div>
      </motion.div>

      {/* 搜索和过滤 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center space-x-4"
      >
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 transform text-muted-foreground -translate-y-1/2" />
          <Input
            placeholder="搜索任务..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          过滤
        </Button>
      </motion.div>

      {/* 任务列表 */}
      <AnimatedTableContainer>
        <div className="border rounded-md">
          {/* 表头 */}
          <motion.div
            className="border-b bg-muted/50 p-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-12 gap-4 text-sm font-medium">
              <div className="col-span-3">任务名称</div>
              <div className="col-span-2">状态</div>
              <div className="col-span-2">上次执行</div>
              <div className="col-span-2">下次执行</div>
              <div className="col-span-1">成功率</div>
              <div className="col-span-2">操作</div>
            </div>
          </motion.div>

          {/* 表格内容 */}
          <div className="divide-y">
            {filteredTasks.map((task, index) => (
              <AnimatedTableRow
                key={task.id}
                index={index}
                className="p-4"
              >
                <AnimatedTableCell className="col-span-3">
                  <div>
                    <div className="font-medium">{task.name}</div>
                    <div className="text-sm text-muted-foreground">{task.description}</div>
                  </div>
                </AnimatedTableCell>

                <AnimatedTableCell className="col-span-2">
                  <Badge className={getStatusColor(task.status)}>
                    {getStatusText(task.status)}
                  </Badge>
                </AnimatedTableCell>

                <AnimatedTableCell className="col-span-2">
                  <div className="text-sm">
                    {task.lastRun}
                  </div>
                </AnimatedTableCell>

                <AnimatedTableCell className="col-span-2">
                  <div className="text-sm">
                    {task.nextRun}
                  </div>
                </AnimatedTableCell>

                <AnimatedTableCell className="col-span-1">
                  <div className="text-sm font-medium">
                    {task.successRate}
                    %
                  </div>
                </AnimatedTableCell>

                <AnimatedTableCell className="col-span-2">
                  <div className="flex items-center space-x-2">
                    {task.status === "running"
                      ? (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStopTask(task.id)}
                            >
                              <Square className="mr-1 h-4 w-4" />
                              停止
                            </Button>
                          </motion.div>
                        )
                      : (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExecuteTask(task.id)}
                            >
                              <Play className="mr-1 h-4 w-4" />
                              执行
                            </Button>
                          </motion.div>
                        )}

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="ghost" size="sm">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </AnimatedTableCell>
              </AnimatedTableRow>
            ))}
          </div>
        </div>
      </AnimatedTableContainer>

      {/* 分页 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="text-sm text-muted-foreground">
          显示
          {" "}
          {filteredTasks.length}
          {" "}
          个任务
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            上一页
          </Button>
          <Button variant="outline" size="sm" disabled>
            下一页
          </Button>
        </div>
      </motion.div>
    </div>
  );
}