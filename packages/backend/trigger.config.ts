import { TriggerConfig } from "./src/services/task/trigger";

/**
 * 触发器配置列表
 */
export const triggerConfigs: TriggerConfig[] = [
  // 示例：每天凌晨同步用户空间数据
  {
    name: "user-space-sync-daily",
    taskName: "user-space-sync",
    cron: "0 0 * * *", // 每天凌晨
    params: {
      mids: [2, 3, 4]
    },
    enabled: false, // 默认禁用，需要手动启用
    description: "每天凌晨同步用户空间数据"
  },

  // 示例：每小时执行一次测试任务
  {
    name: "hourly-hello",
    taskName: "hello-world",
    cron: "0 * * * *", // 每小时
    params: {
      name: "Hourly User"
    },
    enabled: false,
    description: "每小时执行问候任务"
  }

  // 示例：每5分钟执行一次（用于测试）
  // {
  //   name: "test-frequent",
  //   taskName: "hello-world",
  //   cron: "*/5 * * * *",
  //   params: {
  //     name: "Test User"
  //   },
  //   enabled: false,
  //   description: "每5分钟测试任务"
  // },

  // 添加更多触发器配置...
];

export default triggerConfigs;
