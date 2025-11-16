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

const statsData = [
  {
    title: "总任务数",
    value: 12,
    previousValue: 10,
    description: "任务总数",
    trend: "up" as const,
    icon: <ListChecks className="h-4 w-4" />
  },
  {
    title: "运行中",
    value: 3,
    description: "正在执行",
    trend: "stable" as const,
    icon: <Play className="h-4 w-4" />
  },
  {
    title: "今日成功",
    value: 8,
    previousValue: 7,
    description: "成功执行",
    trend: "up" as const,
    icon: <TrendingUp className="h-4 w-4" />
  },
  {
    title: "失败任务",
    value: 1,
    previousValue: 2,
    description: "执行失败",
    trend: "down" as const,
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

const recentActivities = [
  { task: "用户空间同步", status: "成功", time: "2分钟前" },
  { task: "用户卡片更新", status: "运行中", time: "5分钟前" },
  { task: "数据备份", status: "失败", time: "10分钟前" },
  { task: "定时任务清理", status: "成功", time: "15分钟前" },
  { task: "系统状态检查", status: "成功", time: "20分钟前" }
];

function getStatusIcon(status: string) {
  switch (status) {
    case "成功":
      return <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />;
    case "运行中":
      return <Play className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
    case "失败":
      return <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />;
    default:
      return <AlertCircle className="h-3 w-3 text-gray-600 dark:text-gray-400" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "成功":
      return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
    case "运行中":
      return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
    case "失败":
      return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
  }
}


export function DashboardContent() {
  const router = useRouter();

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
        </AnimatedCard>
      </div>
    </div>
  );
}