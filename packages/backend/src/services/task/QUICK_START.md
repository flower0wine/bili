# 快速开始指南

## 安装依赖

```bash
cd packages/backend
pnpm install
```

## 配置数据库

1. 复制环境变量文件：

```bash
cp .env.example .env
```

2. 修改 `.env` 文件中的数据库连接：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bili?schema=public"
```

3. 运行数据库迁移：

```bash
npx prisma migrate dev
```

## 启动应用

```bash
pnpm run start:dev
```

## 测试新架构

### 1. 查看已注册的任务

```bash
curl http://localhost:3000/tasks
```

**响应示例：**

```json
[
  {
    "name": "user-space-sync",
    "description": "同步用户空间数据到数据库",
    "options": {
      "timeout": 300000,
      "retries": 3
    }
  },
  {
    "name": "hello-world",
    "description": "一个简单的示例任务",
    "options": {}
  }
]
```

### 2. 手动执行任务

```bash
# 执行 hello-world 任务
curl -X POST http://localhost:3000/tasks/hello-world/execute \
  -H "Content-Type: application/json" \
  -d '{"params": {"name": "张三"}}'
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "message": "Hello, 张三!"
  },
  "startedAt": "2025-11-06T10:00:00.000Z",
  "finishedAt": "2025-11-06T10:00:00.100Z",
  "duration": 100
}
```

```bash
# 执行用户空间同步任务
curl -X POST http://localhost:3000/tasks/user-space-sync/execute \
  -H "Content-Type: application/json" \
  -d '{"params": {"mids": [2, 3, 4]}}'
```

### 3. 创建定时触发器

```bash
# 创建每天凌晨执行的触发器
curl -X POST http://localhost:3000/triggers/cron \
  -H "Content-Type: application/json" \
  -d '{
    "name": "daily-hello",
    "taskName": "hello-world",
    "cron": "0 0 * * *",
    "params": {"name": "Daily User"},
    "description": "每天凌晨问候",
    "enabled": true
  }'
```

**响应示例：**

```json
{
  "id": 1,
  "name": "daily-hello",
  "taskName": "hello-world",
  "cron": "0 0 * * *",
  "params": { "name": "Daily User" },
  "enabled": true,
  "description": "每天凌晨问候",
  "createdAt": "2025-11-06T10:00:00.000Z",
  "updatedAt": "2025-11-06T10:00:00.000Z"
}
```

### 4. 查看所有触发器

```bash
curl http://localhost:3000/triggers/cron
```

### 5. 更新触发器

```bash
# 修改执行频率为每小时
curl -X PUT http://localhost:3000/triggers/cron/1 \
  -H "Content-Type: application/json" \
  -d '{
    "cron": "0 * * * *",
    "enabled": true
  }'
```

### 6. 禁用/启用触发器

```bash
# 切换触发器状态
curl -X POST http://localhost:3000/triggers/cron/1/toggle
```

### 7. 删除触发器

```bash
curl -X DELETE http://localhost:3000/triggers/cron/1
```

## 常用 Cron 表达式

| 表达式        | 说明            |
| ------------- | --------------- |
| `* * * * *`   | 每分钟          |
| `*/5 * * * *` | 每 5 分钟       |
| `0 * * * *`   | 每小时          |
| `0 */2 * * *` | 每 2 小时       |
| `0 0 * * *`   | 每天凌晨        |
| `0 0 * * 0`   | 每周日凌晨      |
| `0 0 1 * *`   | 每月 1 日凌晨   |
| `0 9 * * 1-5` | 工作日上午 9 点 |

## 创建自定义任务

### 1. 创建任务类

```typescript
// src/services/task/tasks/my-task.task.ts
import { Injectable } from "@nestjs/common";
import { Task } from "../decorators/task.decorator";

@Injectable()
export class MyCustomTask {
  @Task({
    name: "my-task",
    description: "我的自定义任务",
    timeout: 60000,
    retries: 2
  })
  async execute(params?: any) {
    // 实现业务逻辑
    console.log("执行自定义任务", params);
    return { success: true };
  }
}
```

### 2. 注册到模块

```typescript
// src/services/task/task.module.ts
import { MyCustomTask } from "./tasks/my-task.task";

@Module({
  // ...
  providers: [
    // ...
    MyCustomTask // 添加到这里
  ]
})
export class TaskModule {}
```

### 3. 重启应用

```bash
# 任务会自动被发现和注册
pnpm run start:dev
```

### 4. 测试任务

```bash
curl -X POST http://localhost:3000/tasks/my-task/execute \
  -H "Content-Type: application/json" \
  -d '{"params": {"key": "value"}}'
```

## 创建自定义中间件

```typescript
// src/services/task/middleware/metrics.middleware.ts
import { Injectable } from "@nestjs/common";
import { TaskContext, TaskResult } from "../interfaces/task.interface";
import { TaskMiddleware } from "./task-middleware.interface";

@Injectable()
export class MetricsMiddleware implements TaskMiddleware {
  async before(context: TaskContext): Promise<boolean> {
    console.log(`任务开始: ${context.taskName}`);
    // 返回 false 可以中止任务执行
    return true;
  }

  async after(context: TaskContext, result: TaskResult): Promise<void> {
    console.log(`任务结束: ${context.taskName}, 耗时: ${result.duration}ms`);
  }

  async onError(context: TaskContext, error: Error): Promise<void> {
    console.error(`任务错误: ${context.taskName}`, error);
  }
}
```

**注册中间件：**

```typescript
// src/services/trigger/trigger.module.ts
export class TriggerModule implements OnModuleInit {
  constructor(
    private readonly taskExecutor: TaskExecutorService,
    private readonly metricsMiddleware: MetricsMiddleware
  ) {}

  onModuleInit() {
    this.taskExecutor.use(this.metricsMiddleware);
  }
}
```

## 查看日志

应用日志会显示任务执行情况：

```
[TaskExecutor] [uuid-xxx] 开始执行任务: hello-world | 来源: api
[TaskExecutor] [uuid-xxx] 任务执行成功: hello-world | 耗时: 15ms
```

## 数据库查询

查看触发器执行历史：

```sql
-- 查看所有触发器
SELECT * FROM "CronTrigger";

-- 查看最近执行的触发器
SELECT name, taskName, lastRun, lastStatus, lastError
FROM "CronTrigger"
WHERE lastRun IS NOT NULL
ORDER BY lastRun DESC;

-- 查看启用的触发器
SELECT * FROM "CronTrigger" WHERE enabled = true;
```

## 故障排查

### 任务未被发现

1. 确认任务类已添加 `@Injectable()` 装饰器
2. 确认任务类已注册到 `TaskModule` 的 `providers` 中
3. 确认方法使用了 `@Task()` 装饰器
4. 重启应用

### 触发器未执行

1. 检查触发器是否启用（`enabled = true`）
2. 检查 Cron 表达式是否正确
3. 检查 `taskName` 是否与注册的任务名称一致
4. 查看应用日志

### 任务执行失败

1. 查看日志中的错误信息
2. 检查 `CronTrigger` 表的 `lastError` 字段
3. 通过 API 手动执行任务进行调试
4. 检查任务超时设置

## 性能优化建议

1. **合理设置超时时间**：避免任务长时间阻塞
2. **使用重试机制**：对于可能失败的任务设置 `retries`
3. **分批处理**：大数据量任务分批执行
4. **错误处理**：在任务内部捕获并处理错误
5. **日志记录**：记录关键操作便于追踪

## 下一步

- 阅读 [架构说明文档](./TASK_ARCHITECTURE.md)
- 查看 [示例任务代码](./src/services/task/tasks/example.task.ts)
- 实现自己的业务任务
- 配置生产环境的触发器
