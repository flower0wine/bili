"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  ListChecks,
  Play,
  PlusCircle,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AnimatedCard,
  AnimatedStatCard,
  StaggerContainer,
} from "@/components/admin/animations";
import { useAllTasks, useTaskExecutions, useTaskStats } from "@/hooks/apis/task.use";
import { useAllTriggers } from "@/hooks/apis/trigger.use";

function getStatusIcon(status: string) {
  switch (status) {
    case "success":
    case "completed":
      return <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />;
    case "running":
      return <Play className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
    case "failed":
      return <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />;
    default:
      return <AlertCircle className="h-3 w-3 text-gray-600 dark:text-gray-400" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "success":
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
    case "running":
      return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "success":
    case "completed":
      return "成功";
    case "running":
      return "运行中";
    case "failed":
      return "失败";
    default:
      return "未知";
  }
}

export function DashboardContent() {
  const router = useRouter();

  // 获取API数据
  const { data: tasks = [], isLoading: tasksLoading } = useAllTasks();
  const { data: stats, isLoading: statsLoading } = useTaskStats();
  const { data: triggers = [] } = useAllTriggers();
  const { data: executions = [] } = useTaskExecutions({ page: 1, pageSize: 10 });

  // 计算统计数据
  const totalTasks = tasks.length;
  const totalTriggers = triggers.length;
  const runningTasks = stats?.running || 0;
  const successTasks = stats?.success || 0;
  const failedTasks = stats?.failed || 0;
  const avgDuration = stats?.avgDuration || 0;

  // 最近活动数据
  const recentActivities = executions?.items?.slice(0, 5).map(execution => ({
    task: execution.taskName,
    status: getStatusText(execution.status),
    time: new Date(execution.startTime).toLocaleString()
  })) || [];

  // 统计卡片数据
  const statsData = [
    {
      title: "总任务数",
      value: totalTasks,
      previousValue: Math.max(0, totalTasks - 2),
      description: "可用任务总数",
      trend: totalTasks >= 2 ? "up" as const : "stable" as const,
      icon: <ListChecks className="h-4 w-4" />
    },
    {
      title: "运行中",
      value: runningTasks,
      description: "正在执行",
      trend: "stable" as const,
      icon: <Play className="h-4 w-4" />
    },
    {
      title: "今日成功",
      value: successTasks,
      previousValue: Math.max(0, successTasks - 1),
      description: "成功执行",
      trend: successTasks > 0 ? "up" as const : "stable" as const,
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: "失败任务",
      value: failedTasks,
      previousValue: Math.max(0, failedTasks + 1),
      description: "执行失败",
      trend: failedTasks > 0 ? "down" as const : "stable" as const,
      icon: <Clock className="h-4 w-4" />
    }
  ];

  const quickActions = [
    {
      title: "执行所有任务",
      icon: <Play className="h-4 w-4" />,
      action: "go-to-tasks"
    },
    {
      title: "创建新触发器",
      icon: <PlusCircle className="h-4 w-4" />,
      action: "go-to-triggers"
    },
    {
      title: "查看系统日志",
      icon: <FileText className="h-4 w-4" />,
      action: "go-to-history"
    },
    {
      title: "导出数据报告",
      icon: <Download className="h-4 w-4" />,
      action: "export-report"
    }
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "go-to-tasks":
        router.push("/admin/tasks");
        break;
      case "go-to-triggers":
        router.push("/admin/triggers/create");
        break;
      case "go-to-history":
        router.push("/admin/tasks/history");
        break;
      case "export-report":
        console.log("导出报告功能待实现");
        break;
      default:
        console.log("未知操作:", action);
    }
  };

  if (tasksLoading || statsLoading) {
    return (
      <div className="flex flex-col gap-8">
        {/* 页面标题骨架 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="mb-2 h-8 w-32 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-48 animate-pulse rounded bg-muted"></div>
          </div>
        </motion.div>

        {/* 统计卡片骨架 */}
        <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-6">
              <div className="mb-4 h-6 w-24 animate-pulse rounded bg-muted"></div>
              <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
          <p className="text-muted-foreground">
            管理后台总览和快速操作
          </p>
        </div>
      </motion.div>

      {/* 统计卡片 */}
      <StaggerContainer staggerDelay={0.1} initialDelay={0.2}>
        <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
          {statsData.map((stat, index) => (
            <AnimatedStatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              previousValue={stat.previousValue}
              description={stat.description}
              trend={stat.trend}
              icon={stat.icon}
              delay={index * 0.1}
            />
          ))}
        </div>
      </StaggerContainer>

      {/* 快速操作和最近活动 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 快速操作 */}
        <AnimatedCard
          delay={0.4}
          className="p-6"
        >
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Play className="h-5 w-5" />
            快速操作
          </h2>
          <StaggerContainer staggerDelay={0.05} initialDelay={0.5}>
            <div className="grid gap-3">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.title}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(0, 0, 0, 0.05)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickAction(action.action)}
                  className="w-full flex items-center gap-3 border rounded-md p-3 text-left text-sm transition-colors hover:bg-muted/50"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="text-muted-foreground"
                  >
                    {action.icon}
                  </motion.div>
                  {action.title}
                </motion.button>
              ))}
            </div>
          </StaggerContainer>
        </AnimatedCard>

        {/* 最近活动 */}
        <AnimatedCard
          delay={0.4}
          className="p-6"
        >
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-5 w-5" />
            最近活动
          </h2>
          {recentActivities.length === 0
            ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">暂无最近活动</p>
                </div>
              )
            : (
                <div className="flex flex-col gap-4">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={`${activity.task}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(activity.status)}
                        <div>
                          <p className="text-sm font-medium">{activity.task}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                      <span
                        className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(activity.status)}`}
                      >
                        {getStatusIcon(activity.status)}
                        {activity.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
        </AnimatedCard>
      </div>

      {/* 系统信息 */}
      <AnimatedCard
        delay={0.6}
        className="p-6"
      >
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <ListChecks className="h-5 w-5" />
          系统概览
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border rounded-lg p-4 text-center">
            <div className="text-2xl text-blue-600 font-bold">{totalTasks}</div>
            <div className="text-sm text-muted-foreground">总任务数</div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-2xl text-green-600 font-bold">{totalTriggers}</div>
            <div className="text-sm text-muted-foreground">活跃触发器</div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-2xl text-purple-600 font-bold">
              {avgDuration.toFixed(1)}
              s
            </div>
            <div className="text-sm text-muted-foreground">平均执行时间</div>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}