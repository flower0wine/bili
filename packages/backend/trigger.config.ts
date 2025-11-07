import { TriggerConfig } from "./src/services/task/trigger";

/**
 * 触发器配置列表
 */
export const triggerConfigs: TriggerConfig[] = [
  // 示例：每天凌晨同步用户空间数据
  {
    name: "user-space-sync-daily",
    taskName: "user-space-sync",
    cron: "*/20 * * * * *",
    params: {
      mids: [456664753]
    },
    enabled: true, // 默认禁用，需要手动启用
    description: "同步用户空间数据"
  },

  // 示例：每天凌晨同步用户名片数据
  {
    name: "user-card-sync-daily",
    taskName: "user-card-sync",
    cron: "*/20 * * * * *", // 每天凌晨
    params: {
      mids: [456664753],
      photo: true
    },
    enabled: true, // 默认禁用，需要手动启用
    description: "同步用户名片数据"
  },

  // 示例：同名但不同参数的触发器（用于测试共存能力）
  // 注意：名称相同但是不同的配置，会被识别为两个独立的触发器
  {
    name: "user-card-sync-daily-2", // 与上面同名
    taskName: "user-card-sync",
    cron: "0 */2 * * * *", // 但是不同的cron表达式
    params: {
      mids: [2], // 不同的参数
      photo: false
    },
    enabled: true,
    description: "同步用户名片数据（第二个配置）"
  }

  // 示例：每小时执行一次测试任务
  // {
  //   name: "hourly-hello",
  //   taskName: "hello-world",
  //   cron: "* * * * * *", // 每小时
  //   params: {
  //     name: "Hourly User"
  //   },
  //   enabled: true, // 启用用于测试
  //   description: "每小时执行问候任务"
  // }

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
