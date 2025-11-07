# 任务执行状态管理方案

## 问题描述

当服务器异常关闭时,正在运行的任务会在数据库中留下 `running` 状态的记录,这些记录永远不会被更新为最终状态(success/failed),导致数据不一致。

## 解决方案

我们采用了三层防护机制来确保任务状态的最终一致性:

### 1. 启动时清理孤儿任务 (PersistenceMiddleware)

**实现位置**: `persistence.middleware.ts`

**原理**:

- 实现 `OnModuleInit` 接口
- 服务启动时自动执行一次清理
- 将所有 `running` 状态的任务标记为 `failed`
- 错误信息设置为 "服务异常关闭,任务被强制终止"

**优点**:

- 立即解决上次异常关闭遗留的问题
- 不影响正常运行的任务
- 实现简单,性能开销小

**代码示例**:

```typescript
async onModuleInit() {
  const result = await this.prisma.taskExecution.updateMany({
    where: { status: "running" },
    data: {
      status: "failed",
      error: "服务异常关闭,任务被强制终止",
      finishedAt: dayjs().toDate()
    }
  });
}
```

### 2. 优雅关闭机制 (TaskExecutorService)

**实现位置**: `task-executor.service.ts`

**原理**:

- 实现 `OnModuleDestroy` 接口
- 使用 `Map<executionId, AbortController>` 跟踪所有运行中的任务
- 服务关闭时通过 `AbortController` 取消所有任务
- 中间件捕获 `AbortSignal` 并正确更新状态

**优点**:

- 真正实现任务的优雅取消
- 避免资源泄漏
- 任务可以感知到取消信号并执行清理逻辑

**代码示例**:

```typescript
async onModuleDestroy() {
  for (const [executionId, controller] of this.runningTasks.entries()) {
    controller.abort(); // 发送取消信号
  }
  this.runningTasks.clear();
}
```

### 3. 定期超时检测 (CleanupMiddleware)

**实现位置**: `cleanup.middleware.ts`

**原理**:

- 独立的清理中间件,定期扫描数据库
- 检测状态为 `running` 且运行时间超过阈值的任务
- 自动将超时任务标记为 `failed`
- 可配置的扫描间隔和超时阈值

**配置参数**:

- `CLEANUP_INTERVAL_MS`: 清理间隔时间,默认 5 分钟
- `TASK_TIMEOUT_THRESHOLD_MS`: 任务超时阈值,默认 30 分钟

**优点**:

- 作为兜底机制,防止所有异常情况
- 自动检测和修复僵尸任务
- 可独立配置,灵活调整

**代码示例**:

```typescript
async onModuleInit() {
  // 立即执行一次清理
  await this.cleanupStaleRunningTasks();

  // 启动定期清理
  this.cleanupInterval = setInterval(async () => {
    await this.cleanupStaleRunningTasks();
  }, this.CLEANUP_INTERVAL_MS);
}
```

## 数据库优化

### Schema 改进

在 `TaskExecution` 模型的 `error` 字段添加了 `@db.Text` 注解,允许存储更长的错误信息:

```prisma
error String? @db.Text
```

添加状态枚举注释便于理解:

```prisma
status String // running, success, failed, cancelled
```

## 使用方式

### 1. 运行数据库迁移

```bash
cd packages/backend
npx prisma migrate dev --name add_task_cleanup
```

### 2. 启动服务

无需额外配置,所有机制会自动启用:

```bash
pnpm dev
```

### 3. 查看日志

启动时会看到类似日志:

```
[PersistenceMiddleware] 服务启动时检测到 3 个孤儿任务(状态为 running),已标记为失败
[CleanupMiddleware] 启动任务清理定时器，间隔: 300秒，超时阈值: 1800秒
[TaskExecutorService] 正在取消 2 个正在运行的任务...
```

## 配置调优

### 调整超时阈值

如果任务通常运行时间较长,可以修改 `cleanup.middleware.ts`:

```typescript
// 将超时阈值调整为 1 小时
private readonly TASK_TIMEOUT_THRESHOLD_MS = 60 * 60 * 1000;
```

### 调整清理间隔

如果需要更频繁的检查:

```typescript
// 将清理间隔调整为 2 分钟
private readonly CLEANUP_INTERVAL_MS = 2 * 60 * 1000;
```

## 监控建议

### 关键指标

1. **孤儿任务数量**: 启动时清理的 `running` 任务数
2. **超时任务数量**: 定期清理检测到的超时任务数
3. **优雅关闭取消数**: `onModuleDestroy` 取消的任务数

### 告警规则

- 如果孤儿任务数量持续增长,说明可能存在异常关闭问题
- 如果超时任务数量较多,可能需要调整超时阈值
- 如果某个任务频繁超时,需要检查任务实现

## 最佳实践

### 1. 任务应响应 AbortSignal

```typescript
@Task("my-task")
async execute(params: any, signal?: AbortSignal) {
  for (const item of items) {
    // 检查是否被取消
    if (signal?.aborted) {
      throw new Error("任务已被取消");
    }

    await processItem(item);
  }
}
```

### 2. 设置合理的任务超时

```typescript
@Task("long-running-task", {
  timeout: 10 * 60 * 1000, // 10分钟
  retries: 2
})
```

### 3. 记录详细的执行日志

便于排查超时原因和优化任务性能

## 总结

通过三层防护机制,我们确保了:

✅ **即时清理**: 启动时立即清理上次异常遗留的任务  
✅ **优雅关闭**: 正常关闭时取消所有运行中任务  
✅ **兜底保障**: 定期检测并清理僵尸任务

这种设计保证了任务状态的最终一致性,即使在各种异常情况下也能正确处理。
