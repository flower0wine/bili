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
  }
  // 飞书多维表格同步任务（每天凌晨1点执行）
  // {
  //   name: "feishu-bitable-sync-daily",
  //   taskName: "feishu-bitable-sync",
  //   cron: "0 */1 * * * *", // 每天凌晨1点
  //   params: {
  //     mids: [456664753] // 可以指定用户列表，或留空同步所有用户
  //   },
  //   enabled: true, // 默认禁用，需要配置飞书应用后手动启用
  //   description: "同步用户数据到飞书多维表格"
  // }
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
