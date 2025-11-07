# 任务调度系统新架构总结

## 📋 项目概述

本项目实现了一个**完全解耦的任务调度系统**，将业务逻辑（Task）与触发机制（Trigger）彻底分离，实现了高度灵活、可扩展的架构设计。

## 🎯 设计目标

1. ✅ **任务与调度解耦**：任务只是任务，不关心如何被触发
2. ✅ **触发器可插拔**：支持 Cron、API、事件等多种触发方式
3. ✅ **动态配置**：所有配置都可动态修改，无需重启
4. ✅ **中间件架构**：统一处理日志、监控、持久化等横切关注点
5. ✅ **易于测试**：任务可独立测试，不依赖调度系统

## 📁 目录结构

```
src/services/
├── task/                           # 任务层
│   ├── decorators/
│   │   └── task.decorator.ts      # @Task 装饰器
│   ├── interfaces/
│   │   └── task.interface.ts      # 任务相关接口
│   ├── middleware/
│   │   ├── task-middleware.interface.ts  # 中间件接口
│   │   ├── logging.middleware.ts         # 日志中间件
│   │   └── persistence.middleware.ts     # 持久化中间件
│   ├── tasks/
│   │   ├── user-space-sync.task.ts      # 用户空间同步任务
│   │   └── example.task.ts              # 示例任务集合
│   ├── task-registry.service.ts    # 任务注册中心
│   ├── task-executor.service.ts    # 任务执行器
│   ├── task.module.ts              # 任务模块
│   └── index.ts                    # 导出
│
├── trigger/                        # 触发器层
│   ├── cron-trigger.service.ts    # Cron 触发器
│   ├── trigger-init.service.ts    # 触发器初始化
│   ├── trigger.module.ts          # 触发器模块
│   └── index.ts                   # 导出
│
└── api/                           # API 层
    ├── task-api.controller.ts     # 任务 API
    ├── trigger-api.controller.ts  # 触发器 API
    └── api.module.ts              # API 模块
```

## 🏗️ 架构设计

### 核心层次

```
┌─────────────────────────────────────────────────────┐
│                   API Layer                          │
│  ┌──────────────┐         ┌──────────────┐         │
│  │  Task API    │         │ Trigger API  │         │
│  └──────────────┘         └──────────────┘         │
└─────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────┐
│                Trigger Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ CronTrigger  │  │ EventTrigger │  │   ...    │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────┐
│              Executor Layer                          │
│  ┌──────────────────────────────────────────────┐   │
│  │          Task Executor                       │   │
│  │  ┌──────────────────────────────────────┐   │   │
│  │  │    Middleware Chain                  │   │   │
│  │  │  • Logging  • Metrics  • Persistence │   │   │
│  │  └──────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────┐
│                Task Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │   Task A     │  │   Task B     │  │   ...    │  │
│  │   @Task()    │  │   @Task()    │  │          │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
```

### 数据流

```
1. Cron 时间到达
   ↓
2. CronTrigger 触发
   ↓
3. 调用 TaskExecutor.execute(taskName, params)
   ↓
4. 执行 Middleware.before()
   ↓
5. TaskRegistry 查找任务
   ↓
6. 执行任务的 handler 函数
   ↓
7. 执行 Middleware.after()
   ↓
8. 返回执行结果
```

## 🔑 核心组件

### 1. Task Decorator（任务装饰器）

```typescript
@Task({
  name: 'task-name',        // 唯一标识
  description: '任务描述',
  timeout: 300000,          // 超时时间
  retries: 3                // 重试次数
})
```

### 2. Task Registry（任务注册中心）

- **自动发现**：启动时扫描所有 `@Task` 装饰的方法
- **动态注册**：运行时可添加/删除任务
- **任务管理**：维护任务定义的映射关系

### 3. Task Executor（任务执行器）

- **执行任务**：根据任务名称执行对应的处理函数
- **中间件链**：管理和执行中间件
- **超时控制**：防止任务无限期运行
- **结果追踪**：记录执行时间、状态等信息

### 4. Middleware（中间件）

**接口定义：**

```typescript
interface TaskMiddleware {
  before?(context: TaskContext): Promise<boolean | void>;
  after?(context: TaskContext, result: TaskResult): Promise<void>;
  onError?(context: TaskContext, error: Error): Promise<void>;
}
```

**内置中间件：**

- `LoggingMiddleware`：自动记录任务执行日志
- `PersistenceMiddleware`：持久化任务执行记录

### 5. Trigger（触发器）

**Cron Trigger：**

- 基于时间的定时触发
- 从数据库动态加载配置
- 支持启用/禁用
- 记录执行历史

**扩展触发器：**

- Event Trigger（事件触发）
- Webhook Trigger（HTTP 回调触发）
- Queue Trigger（消息队列触发）

## 💾 数据库模型

### CronTrigger 表

| 字段        | 类型     | 说明             |
| ----------- | -------- | ---------------- |
| id          | Int      | 主键             |
| name        | String   | 触发器唯一名称   |
| taskName    | String   | 要执行的任务名称 |
| cron        | String   | Cron 表达式      |
| params      | Json     | 任务参数         |
| enabled     | Boolean  | 是否启用         |
| description | String   | 描述             |
| lastRun     | DateTime | 最后执行时间     |
| nextRun     | DateTime | 下次执行时间     |
| lastStatus  | String   | 最后执行状态     |
| lastError   | String   | 最后执行错误     |
| createdAt   | DateTime | 创建时间         |
| updatedAt   | DateTime | 更新时间         |

## 🚀 使用场景

### 场景 1：定时数据同步

```typescript
// 定义任务
@Task({ name: 'sync-data' })
async syncData() { /* ... */ }

// 创建触发器
POST /triggers/cron {
  "name": "daily-sync",
  "taskName": "sync-data",
  "cron": "0 0 * * *"
}
```

### 场景 2：手动执行任务

```typescript
// 通过 API 触发
POST /tasks/sync-data/execute {
  "params": { "force": true }
}
```

### 场景 3：事件驱动任务

```typescript
// 监听事件
eventEmitter.on("user.created", (user) => {
  taskExecutor.execute("send-welcome-email", { userId: user.id });
});
```

### 场景 4：条件执行

```typescript
// 中间件控制
class ConditionalMiddleware {
  async before(context: TaskContext): Promise<boolean> {
    if (await this.shouldSkip(context.taskName)) {
      return false; // 跳过执行
    }
    return true;
  }
}
```

## 🔧 扩展点

### 1. 添加新任务

```typescript
@Injectable()
export class NewTask {
  @Task({ name: "new-task" })
  async execute() {
    /* ... */
  }
}
```

### 2. 添加新触发器

```typescript
@Injectable()
export class WebhookTriggerService {
  registerWebhook(url: string, taskName: string) {
    // 实现 webhook 逻辑
  }
}
```

### 3. 添加新中间件

```typescript
export class MetricsMiddleware implements TaskMiddleware {
  async after(context, result) {
    metrics.record(context.taskName, result.duration);
  }
}
```

## 📊 监控与日志

### 日志格式

```
[TaskExecutor] [uuid-xxx] 开始执行任务: task-name | 来源: cron
[TaskExecutor] [uuid-xxx] 任务参数: {"key": "value"}
[TaskExecutor] [uuid-xxx] 任务执行成功: task-name | 耗时: 1523ms
```

### 监控指标

- 任务执行次数
- 任务执行时长
- 任务成功/失败率
- 任务执行来源分布

## 🧪 测试策略

### 单元测试

```typescript
describe("UserSpaceSyncTask", () => {
  it("should sync user data", async () => {
    const task = new UserSpaceSyncTask(mockService, mockPrisma);
    const result = await task.execute({ mids: [1, 2] });
    expect(result.success).toBe(true);
  });
});
```

### 集成测试

```typescript
describe("Task Execution", () => {
  it("should execute task via executor", async () => {
    const result = await taskExecutor.execute("test-task");
    expect(result.success).toBe(true);
  });
});
```

## 📈 性能优化

1. **并发控制**：限制同时执行的任务数量
2. **批量处理**：大数据量任务分批执行
3. **超时设置**：防止任务阻塞
4. **重试机制**：失败自动重试
5. **缓存策略**：缓存频繁访问的数据

## 🔒 安全考虑

1. **参数验证**：验证任务参数的合法性
2. **权限控制**：限制任务的执行权限
3. **资源限制**：限制任务的资源使用
4. **错误隔离**：防止单个任务失败影响系统

## 📚 相关文档

- [快速开始指南](./QUICK_START.md)
- [架构详细说明](./TASK_ARCHITECTURE.md)
- [新旧架构对比](./MIGRATION_COMPARISON.md)

## 🎓 最佳实践

1. **任务设计**
   - 保持任务的单一职责
   - 避免任务间的强耦合
   - 合理设置超时时间

2. **错误处理**
   - 在任务内部捕获并处理错误
   - 返回有意义的错误信息
   - 避免静默失败

3. **性能优化**
   - 大数据量任务分批处理
   - 避免在任务中执行长时间阻塞操作
   - 合理使用缓存

4. **监控告警**
   - 记录关键执行指标
   - 设置异常告警
   - 定期检查任务执行历史

## 🌟 亮点总结

1. **完全解耦**：任务与触发器彻底分离
2. **动态配置**：所有配置可实时修改
3. **中间件架构**：横切关注点统一处理
4. **易于扩展**：新增功能只需实现接口
5. **测试友好**：组件可独立测试
6. **类型安全**：完整的 TypeScript 类型支持
7. **文档完善**：详细的使用文档和示例

## 🔮 未来规划

- [ ] 实现 EventTrigger（事件触发器）
- [ ] 实现 WebhookTrigger（Webhook 触发器）
- [ ] 实现 QueueTrigger（消息队列触发器）
- [ ] 添加任务依赖管理（DAG）
- [ ] 添加分布式锁支持
- [ ] 实现任务执行可视化界面
- [ ] 支持任务执行历史查询和回放
- [ ] 添加任务执行指标大盘

---

**创建时间**: 2025-11-06  
**架构版本**: v2.0  
**维护者**: Backend Team
