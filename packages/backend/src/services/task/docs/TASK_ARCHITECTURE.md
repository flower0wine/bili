# 任务调度系统架构说明

## 架构设计理念

本系统采用**任务与调度完全解耦**的设计，将业务逻辑（Task）和触发机制（Trigger）彻底分离，实现高度灵活和可扩展的任务执行架构。

## 核心组件

### 1. Task（任务层）

纯粹的业务逻辑实现，不包含任何调度相关代码。

**特点：**

- 使用 `@Task` 装饰器标注
- 只关注业务逻辑实现
- 可以被任何触发器触发
- 支持动态注册

**示例：**

```typescript
@Injectable()
export class UserSpaceSyncTask {
  @Task({
    name: "user-space-sync",
    description: "同步用户空间数据",
    timeout: 300000,
    retries: 3
  })
  async execute(params?: { mids?: number[] }) {
    // 纯粹的业务逻辑
    return { success: true };
  }
}
```

### 2. Trigger（触发器层）

负责触发任务执行，与任务逻辑完全解耦。

**支持的触发器类型：**

- **CronTrigger**: 基于时间的定时触发
- **EventTrigger**: 基于事件的触发（待实现）
- **ApiTrigger**: 通过 API 手动触发
- 可扩展更多触发器类型

**特点：**

- 触发器不知道任务的具体实现
- 只需要知道任务名称
- 可以传递参数给任务
- 支持动态增删改

### 3. Middleware（中间件层）

在任务执行前后进行拦截处理。

**内置中间件：**

- `LoggingMiddleware`: 日志记录
- `PersistenceMiddleware`: 持久化执行记录

**扩展示例：**

```typescript
export class CustomMiddleware implements TaskMiddleware {
  async before(context: TaskContext): Promise<boolean> {
    // 执行前逻辑
    // 返回 false 可中止任务执行
    return true;
  }

  async after(context: TaskContext, result: TaskResult): Promise<void> {
    // 执行后逻辑
  }

  async onError(context: TaskContext, error: Error): Promise<void> {
    // 错误处理逻辑
  }
}
```

### 4. Executor（执行器层）

负责实际调度和执行任务。

**功能：**

- 管理中间件链
- 超时控制
- 重试机制
- 执行追踪

## 数据库模型

### CronTrigger

```prisma
model CronTrigger {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  taskName    String   // 要执行的任务名称
  cron        String   // Cron 表达式
  params      Json?    // 任务参数
  enabled     Boolean  @default(true)
  description String?
  lastRun     DateTime?
  nextRun     DateTime?
  lastStatus  String?
  lastError   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## API 接口

### 任务 API

#### 获取所有任务

```
GET /tasks
```

#### 手动执行任务

```
POST /tasks/:taskName/execute
Body: {
  "params": {
    "mids": [2, 3, 4]
  }
}
```

### 触发器 API

#### 获取所有触发器

```
GET /triggers/cron
```

#### 创建触发器

```
POST /triggers/cron
Body: {
  "name": "daily-user-sync",
  "taskName": "user-space-sync",
  "cron": "0 0 * * *",
  "params": { "mids": [2, 3] },
  "description": "每天同步用户数据",
  "enabled": true
}
```

#### 更新触发器

```
PUT /triggers/cron/:id
Body: {
  "cron": "0 */2 * * *",
  "enabled": true
}
```

#### 删除触发器

```
DELETE /triggers/cron/:id
```

#### 启用/禁用触发器

```
POST /triggers/cron/:id/toggle
```

## 使用示例

### 1. 创建新任务

```typescript
// src/services/task/tasks/my-task.task.ts
import { Injectable } from "@nestjs/common";
import { Task } from "../decorators/task.decorator";

@Injectable()
export class MyTask {
  @Task({
    name: "my-custom-task",
    description: "我的自定义任务",
    timeout: 60000
  })
  async execute(params?: any) {
    // 业务逻辑
    console.log("执行任务，参数:", params);
    return { success: true };
  }
}
```

### 2. 注册任务到模块

```typescript
// src/services/task/task.module.ts
@Module({
  providers: [
    TaskRegistryService,
    TaskExecutorService,
    MyTask // 添加到 providers
  ]
  // ...
})
export class TaskModule {}
```

### 3. 创建触发器

通过 API 或直接操作数据库：

```typescript
// 通过 API
POST /triggers/cron
{
  "name": "my-trigger",
  "taskName": "my-custom-task",
  "cron": "*/5 * * * *",  // 每 5 分钟执行
  "params": { "key": "value" }
}
```

### 4. 动态注册任务

```typescript
// 运行时动态添加任务
taskRegistry.registerDynamicTask(
  "runtime-task",
  async (params) => {
    // 动态任务逻辑
    return { result: "ok" };
  },
  {
    description: "运行时添加的任务",
    timeout: 30000
  }
);
```

## 架构优势

### 1. 完全解耦

- 任务不知道如何被触发
- 触发器不知道任务的实现细节
- 可以独立修改和测试

### 2. 高度灵活

- 一个任务可以被多个触发器触发
- 一个触发器可以触发不同的任务（通过修改配置）
- 触发器可以动态增删改

### 3. 易于扩展

- 新增任务只需添加 `@Task` 装饰器
- 新增触发器类型只需实现触发接口
- 中间件可插拔

### 4. 便于测试

- 任务可以独立测试（不依赖调度）
- 可以通过 API 手动触发任务
- 中间件可以独立测试

### 5. 支持多种触发方式

- 定时触发（Cron）
- 手动触发（API）
- 事件触发（扩展）
- Webhook 触发（扩展）

## 扩展指南

### 添加新的触发器类型

```typescript
// event-trigger.service.ts
@Injectable()
export class EventTriggerService {
  constructor(
    private readonly taskExecutor: TaskExecutorService,
    private readonly eventEmitter: EventEmitter2
  ) {
    // 监听事件
    this.eventEmitter.on("user.created", (data) => {
      this.taskExecutor.execute("welcome-email", data, "event");
    });
  }
}
```

### 添加新的中间件

```typescript
export class MetricsMiddleware implements TaskMiddleware {
  async before(context: TaskContext): Promise<void> {
    // 记录指标
    metrics.increment("task.started", { task: context.taskName });
  }

  async after(context: TaskContext, result: TaskResult): Promise<void> {
    metrics.timing("task.duration", result.duration, {
      task: context.taskName,
      status: result.success ? "success" : "failed"
    });
  }
}
```

## 与旧架构对比

| 特性       | 旧架构     | 新架构   |
| ---------- | ---------- | -------- |
| 任务与调度 | 耦合在一起 | 完全解耦 |
| 扩展性     | 低         | 高       |
| 触发方式   | 仅 Cron    | 多种方式 |
| 动态配置   | 有限支持   | 完全支持 |
| 中间件     | 不支持     | 支持     |
| 测试友好   | 一般       | 很好     |

## 迁移指南

从旧架构迁移到新架构：

1. **提取任务逻辑**
   - 将 `handleUserSpaceSync` 等方法提取为独立的 Task
   - 添加 `@Task` 装饰器

2. **配置触发器**
   - 将原 `CronJob` 表的数据迁移到 `CronTrigger`
   - 添加 `taskName` 字段映射

3. **移除旧代码**
   - 删除 `scheduler-old` 目录
   - 更新模块导入

4. **测试验证**
   - 通过 API 手动触发任务测试
   - 验证定时触发是否正常
   - 检查日志和执行记录
