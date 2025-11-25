# 任务取消策略文档

## 概述

任务取消系统支持灵活的失败处理策略，允许在取消多个任务时选择是否在第一个失败时停止，或继续处理其他任务。

## 取消策略

### 1. 宽松模式（failFast = false，默认）

**行为**: 继续处理所有任务，即使某些任务不存在或取消失败

**适用场景**:
- 批量取消操作
- 不需要强制一致性
- 允许部分失败

**返回结果**:
```typescript
{
  cancelled: string[];           // 成功取消的任务 ID
  notFound: string[];            // 不存在的任务 ID
  failed: Array<{                // 取消失败的任务
    executionId: string;
    error: string;
  }>;
}
```

**示例**:
```bash
# 请求
DELETE /v1/tasks/executions/cancel/ids
{
  "executionIds": ["id1", "id2", "id3"],
  "failFast": false  // 或不传（默认）
}

# 响应
{
  "cancelled": ["id1"],
  "notFound": ["id3"],
  "failed": [
    { "executionId": "id2", "error": "取消失败: 原因" }
  ]
}
```

### 2. 严格模式（failFast = true）

**行为**: 任何失败都会立即抛出异常，停止处理

**适用场景**:
- 需要原子性操作
- 要求全部成功或全部失败
- 关键业务流程

**返回结果**:
- 成功: 返回部分结果（已处理的任务）
- 失败: 抛出异常，事务回滚

**示例**:
```bash
# 请求
DELETE /v1/tasks/executions/cancel/ids
{
  "executionIds": ["id1", "id2", "id3"],
  "failFast": true
}

# 响应（成功）
{
  "cancelled": ["id1"],
  "notFound": [],
  "failed": []
}

# 响应（失败）
HTTP 500
{
  "error": "任务执行不存在: id3"
}
```

## API 端点

### 通过执行 ID 取消

```
DELETE /v1/tasks/executions/cancel/ids
Content-Type: application/json

{
  "executionIds": ["id1", "id2", "id3"],
  "failFast": false  // 可选，默认 false
}
```

**返回**:
```typescript
{
  cancelled: string[];
  notFound: string[];
  failed: Array<{ executionId: string; error: string }>;
}
```

### 通过任务名称取消

```
DELETE /v1/tasks/executions/cancel/taskNames
Content-Type: application/json

{
  "taskNames": ["task1", "task2"],
  "failFast": false  // 可选，默认 false
}
```

**返回**:
```typescript
{
  cancelled: string[];
  taskNotFound: string[];
  failed: Array<{ executionId: string; error: string }>;
}
```

### 取消所有任务

```
DELETE /v1/tasks/executions/cancel/all
Content-Type: application/json

{
  "failFast": false  // 可选，默认 false
}
```

**返回**:
```typescript
{
  count: number;
  cancelled: string[];
  failed: Array<{ executionId: string; error: string }>;
}
```

## 前端使用示例

### 使用 Hook（宽松模式）

```typescript
import { useCancelExecutionsByIds } from "@/hooks/apis/task.use";

function TaskCancelComponent() {
  const cancelMutation = useCancelExecutionsByIds();

  const handleCancel = async () => {
    try {
      const result = await cancelMutation.mutateAsync({
        executionIds: ["id1", "id2", "id3"],
        failFast: false  // 继续处理所有任务
      });

      console.log(`成功取消: ${result.cancelled.length}`);
      console.log(`不存在: ${result.notFound.length}`);
      console.log(`失败: ${result.failed.length}`);
    } catch (error) {
      console.error("取消失败:", error);
    }
  };

  return <button onClick={handleCancel}>取消任务</button>;
}
```

### 使用 Hook（严格模式）

```typescript
const handleCancelStrict = async () => {
  try {
    const result = await cancelMutation.mutateAsync({
      executionIds: ["id1", "id2", "id3"],
      failFast: true  // 任何失败都停止
    });

    // 全部成功
    console.log("所有任务已取消");
  } catch (error) {
    // 任何失败都会抛出异常
    console.error("取消失败，已回滚:", error.message);
  }
};
```

### 通过任务名称取消

```typescript
import { useCancelExecutionsByTaskNames } from "@/hooks/apis/task.use";

const cancelByNameMutation = useCancelExecutionsByTaskNames();

const handleCancelByName = async () => {
  const result = await cancelByNameMutation.mutateAsync({
    taskNames: ["user-sync", "data-sync"],
    failFast: false
  });

  console.log(result);
};
```

### 取消所有任务

```typescript
import { useCancelAllExecutions } from "@/hooks/apis/task.use";

const cancelAllMutation = useCancelAllExecutions();

const handleCancelAll = async () => {
  const result = await cancelAllMutation.mutateAsync(false);
  console.log(`已取消 ${result.count} 个任务`);
};
```

## 错误处理

### 宽松模式错误处理

```typescript
const result = await cancelMutation.mutateAsync({
  executionIds: ["id1", "id2", "id3"],
  failFast: false
});

// 检查各类结果
if (result.notFound.length > 0) {
  console.warn(`以下任务不存在: ${result.notFound.join(", ")}`);
}

if (result.failed.length > 0) {
  console.warn("以下任务取消失败:");
  result.failed.forEach(({ executionId, error }) => {
    console.warn(`  - ${executionId}: ${error}`);
  });
}

// 处理成功取消的任务
result.cancelled.forEach(id => {
  console.log(`任务 ${id} 已取消`);
});
```

### 严格模式错误处理

```typescript
try {
  const result = await cancelMutation.mutateAsync({
    executionIds: ["id1", "id2", "id3"],
    failFast: true
  });

  // 全部成功
  console.log("所有任务已取消");
} catch (error) {
  // 任何失败都会进入这里
  console.error("取消失败:", error.message);
  
  // 根据错误类型处理
  if (error.message.includes("不存在")) {
    console.error("某个任务不存在");
  } else if (error.message.includes("取消失败")) {
    console.error("取消操作失败");
  }
}
```

## 最佳实践

### 1. 选择合适的模式

- **宽松模式**: 用于 UI 中的批量操作，允许用户看到部分结果
- **严格模式**: 用于自动化流程，需要确保一致性

### 2. 提供用户反馈

```typescript
const handleCancel = async () => {
  const result = await cancelMutation.mutateAsync({
    executionIds: selectedIds,
    failFast: false
  });

  // 显示详细的结果
  showNotification({
    type: "info",
    message: `成功取消 ${result.cancelled.length} 个任务`,
    details: {
      notFound: result.notFound,
      failed: result.failed
    }
  });
};
```

### 3. 处理部分失败

```typescript
const handleCancelWithRetry = async () => {
  const result = await cancelMutation.mutateAsync({
    executionIds: selectedIds,
    failFast: false
  });

  // 重试失败的任务
  if (result.failed.length > 0) {
    const failedIds = result.failed.map(f => f.executionId);
    setTimeout(() => {
      handleCancelWithRetry(failedIds);  // 重试
    }, 1000);
  }
};
```

### 4. 日志记录

```typescript
const handleCancel = async () => {
  const startTime = Date.now();
  
  const result = await cancelMutation.mutateAsync({
    executionIds: selectedIds,
    failFast: false
  });

  const duration = Date.now() - startTime;
  
  logger.info("任务取消完成", {
    duration,
    cancelled: result.cancelled.length,
    notFound: result.notFound.length,
    failed: result.failed.length
  });
};
```

## 性能考虑

### 1. 批量大小

- 建议单次取消不超过 100 个任务
- 对于大批量操作，考虑分批处理

### 2. 超时设置

- 严格模式下，如果任何任务取消失败，整个操作失败
- 考虑设置合理的超时时间

### 3. 并发控制

- 同时进行多个取消操作时，考虑使用队列
- 避免过多并发请求

## 总结

| 特性 | 宽松模式 | 严格模式 |
|------|---------|---------|
| 失败处理 | 继续处理 | 立即停止 |
| 返回结果 | 详细的部分结果 | 全部成功或异常 |
| 适用场景 | 批量操作、UI | 自动化、关键流程 |
| 用户体验 | 看到部分结果 | 全部成功或全部失败 |
| 性能 | 较好 | 可能较慢（需要回滚） |
