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
import { useAllTasks, useExecuteTask, useTaskStats } from "@/hooks/apis/task.use";
import { useAllTriggers } from "@/hooks/apis/trigger.use";

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
  const [searchTerm, setSearchTerm] = useState("");

  // 使用 React Query 获取数据
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useAllTasks();
  const { data: stats, isLoading: statsLoading } = useTaskStats();
  const { data: triggers = [] } = useAllTriggers();

  const executeTaskMutation = useExecuteTask();

  const handleExecuteTask = async (taskName: string) => {
    try {
      await executeTaskMutation.mutateAsync({
        taskName,
        data: {}
      });
    }
    catch (error) {
      console.error("执行任务失败:", error);
    }
  };

  // 合并任务数据和统计信息
  const tasksWithStats = tasks.map((task) => {
    // 查找关联的触发器
    const relatedTrigger = triggers.find(trigger => trigger.taskName === task.name);

    return {
      id: task.name,
      name: task.name,
      description: task.description,
      status: "idle", // 默认状态，实际应该从执行历史获取
      lastRun: relatedTrigger?.updatedAt || new Date().toLocaleString(),
      nextRun: relatedTrigger?.enabled ? "根据Cron表达式计算" : "未启用",
      avgDuration: stats?.avgDuration || 0,
      successRate: stats ? ((stats.success / (stats.total || 1)) * 100).toFixed(1) : "0.0",
      cron: relatedTrigger?.cron || "未设置"
    };
  });

  const filteredTasks = tasksWithStats.filter(task =>
    task.name.toLowerCase().includes(searchTerm.toLowerCase())
    || task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (tasksLoading || statsLoading) {
    return <DataTableSuspense rowCount={5} columnCount={6} />;
  }

  if (tasksError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg text-gray-900 font-medium dark:text-gray-100">加载失败</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            无法加载任务数据，请稍后重试
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
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
        <div className="flex items-center gap-2">
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
        className="flex items-center gap-4"
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
            {filteredTasks.length === 0
              ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 text-center"
                  >
                    <p className="text-gray-500 dark:text-gray-400">暂无任务数据</p>
                  </motion.div>
                )
              : (
                  filteredTasks.map((task, index) => (
                    <AnimatedTableRow
                      key={task.id}
                      index={index}
                      className="p-4"
                    >
                      <AnimatedTableCell className="col-span-3">
                        <div>
                          <div className="font-medium">{task.name}</div>
                          <div className="text-sm text-muted-foreground">{task.description}</div>
                          {task.cron && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              Cron:
                              {" "}
                              {task.cron}
                            </div>
                          )}
                        </div>
                      </AnimatedTableCell>

                      <AnimatedTableCell className="col-span-2">
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusText(task.status)}
                        </Badge>
                      </AnimatedTableCell>

                      <AnimatedTableCell className="col-span-2">
                        <div className="text-sm">
                          {new Date(task.lastRun).toLocaleString()}
                        </div>
                      </AnimatedTableCell>

                      <AnimatedTableCell className="col-span-2">
                        <div className="text-sm text-muted-foreground">
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
                        <div className="flex items-center gap-2">
                          {task.status === "running"
                            ? (
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                  >
                                    <Square className="mr-1 h-4 w-4" />
                                    运行中
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
                                    onClick={async () => handleExecuteTask(task.name)}
                                    disabled={executeTaskMutation.isPending}
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
                  ))
                )}
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
        <div className="flex items-center gap-2">
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