# 任务系统架构设计（重构版）

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    TaskController                           │
│  (HTTP 请求处理、路由分发)                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    TaskService                              │
│  (业务逻辑层)                                               │
│  - 查询任务执行状态                                          │
│  - 取消任务执行                                              │
│  - 管理任务生命周期                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                TaskExecutorService                          │
│  (执行层)                                                   │
│  - 执行任务                                                  │
│  - 管理 AbortController                                     │
│  - 暴露 runningTasks Map                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────────┐    ┌────────▼─────────┐
│ TaskRegistry     │    │ Middleware Chain │
│ (任务注册)       │    │ (中间件处理)     │
└──────────────────┘    └──────────────────┘
```

## 职责划分

### TaskExecutorService（执行层）

**职责**:
- 实际执行任务
- 管理任务的 AbortController
- 处理重试和超时
- 维护 runningTasks 映射表
- 记录执行日志到 context

**公开接口**:
```typescript
// 执行任务
async execute<P, D>(
  taskName: string,
  params?: P,
  source?: TaskSource,
  triggerName?: string,
  signal?: AbortSignal
): Promise<TaskResult<D>>

// 暴露运行中的任务
getRunningTasks(): Map<string, RunningTaskInfo>
```

**不负责**:
- 业务逻辑处理
- 查询和过滤
- 取消决策

### TaskService（业务逻辑层）

**职责**:
- 查询任务执行状态
- 决定如何取消任务
- 处理业务规则
- 与其他服务交互

**公开接口**:
```typescript
// 查询方法
getTaskExecutionsByName(taskName: string): TaskExecutionInfo[]
getTaskExecutionById(executionId: string): TaskExecutionInfo | null

// 取消方法
cancelExecutionsByIds(executionIds: string[]): CancelResult
cancelExecutionsByTaskNames(taskNames: string[]): CancelResult
cancelAllExecutions(): number
```

**实现方式**:
- 通过 `getRunningTasks()` 获取数据
- 在本地进行查询和过滤
- 调用 AbortController 执行取消

### TaskController（HTTP 层）

**职责**:
- 处理 HTTP 请求
- 参数验证
- 响应格式化
- 错误处理

**路由**:
```
GET    /tasks                                    - 获取所有任务
POST   /tasks/:taskName/execute/manual           - 手动执行任务
POST   /tasks/:taskName/execute/api              - API 执行任务
GET    /tasks/:taskName                          - 获取任务详情
GET    /tasks/executions/history                 - 获取执行历史
GET    /tasks/executions/:id                     - 获取执行详情
GET    /tasks/running/:taskName                  - 查询任务执行
GET    /tasks/running/execution/:executionId     - 查询执行信息
DELETE /tasks/executions/cancel/by-ids           - 按 ID 取消
DELETE /tasks/executions/cancel/by-task-names    - 按任务名取消
DELETE /tasks/executions/cancel/all              - 取消全部
```

## 数据流

### 执行任务流程

```
1. Controller 接收请求
   ↓
2. Service 调用 Executor.execute()
   ↓
3. Executor 创建 Context 和 AbortController
   ↓
4. Executor 将任务信息存入 runningTasks
   ↓
5. Executor 执行任务（带重试和超时）
   ↓
6. 执行完成，从 runningTasks 删除
   ↓
7. 返回结果给 Controller
```

### 查询任务状态流程

```
1. Controller 接收查询请求
   ↓
2. Service 调用 Executor.getRunningTasks()
   ↓
3. Service 在本地进行查询和过滤
   ↓
4. Service 返回查询结果
   ↓
5. Controller 格式化响应
```

### 取消任务流程

```
1. Controller 接收取消请求
   ↓
2. Service 调用 Executor.getRunningTasks()
   ↓
3. Service 查找要取消的任务
   ↓
4. Service 调用 AbortController.abort()
   ↓
5. Service 更新 context.status = "cancelled"
   ↓
6. Executor 捕获 AbortSignal 并抛出异常
   ↓
7. 任务执行中止，从 runningTasks 删除
```

## RunningTaskInfo 结构

```typescript
interface RunningTaskInfo {
  executionId: string;           // 执行 ID
  taskName: string;              // 任务名称
  controller: AbortController;   // 取消控制器
  context: TaskContext<any>;     // 执行上下文
  startedAt: Date;               // 开始时间
}
```

## TaskContext 结构

```typescript
interface TaskContext {
  taskName: string;              // 任务名称
  params?: P;                    // 任务参数
  source: TaskSource;            // 触发来源
  executionId: string;           // 执行 ID
  triggeredAt: Date;             // 触发时间
  triggerName?: string;          // 触发器名称
  retryCount: number;            // 重试次数
  maxRetries: number;            // 最大重试次数
  startedAt: Date;               // 开始时间
  attemptStartedAt: Date;        // 当前尝试开始时间
  signal?: AbortSignal;          // 取消信号
  status: TaskExecutionStatus;   // 执行状态
  logs: TaskExecutionLog[];      // 执行日志
}
```

## 优势

### 1. 关注点分离
- **Executor**: 只关心如何执行任务
- **Service**: 只关心业务逻辑
- **Controller**: 只关心 HTTP 协议

### 2. 易于测试
- 可以独立测试 Executor 的执行逻辑
- 可以独立测试 Service 的业务逻辑
- 可以独立测试 Controller 的路由处理

### 3. 易于扩展
- 添加新的查询方法只需在 Service 中添加
- 添加新的取消策略只需在 Service 中添加
- 不需要修改 Executor 的核心逻辑

### 4. 性能优化空间
- 可以在 Service 层添加缓存
- 可以在 Service 层添加分页
- 可以在 Service 层添加排序和过滤

### 5. 安全性
- Executor 不暴露 AbortController，只暴露 Map
- Service 控制取消操作，可以添加权限检查
- Controller 可以添加速率限制和验证

## 未来改进方向

1. **缓存优化**: 在 Service 层添加查询缓存
2. **权限控制**: 在 Service 层添加权限检查
3. **事件系统**: 添加任务状态变化事件
4. **WebSocket**: 实时推送任务状态
5. **持久化**: 将执行历史持久化到数据库
6. **监控**: 添加性能监控和告警
7. **分布式**: 支持多进程/多服务器任务管理
