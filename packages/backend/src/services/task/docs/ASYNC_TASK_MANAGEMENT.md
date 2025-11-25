# 异步任务管理指南

## 概述

重构后的任务系统支持完整的异步任务管理，前端可以异步触发任务执行，然后通过 executionId 查询任务状态和日志。

## API 端点

### 1. 执行任务

```bash
# 手动执行任务
POST /tasks/:taskName/execute/manual
Body: { "params": {...} }

# 通过 API 执行任务
POST /tasks/:taskName/execute/api
Body: { "params": {...} }
```

**响应**: 返回立即响应，任务在后台异步执行

### 2. 查询任务执行状态

#### 通过执行 ID 查询

```bash
GET /tasks/running/execution/:executionId
```

**响应示例**:
```json
{
  "executionId": "550e8400-e29b-41d4-a716-446655440000",
  "taskName": "user-space-sync",
  "status": "running",
  "startedAt": "2025-11-25T11:05:00Z",
  "logs": [
    {
      "timestamp": "2025-11-25T11:05:00Z",
      "level": "info",
      "message": "开始执行任务 (超时限制: 30000ms)"
    },
    {
      "timestamp": "2025-11-25T11:05:05Z",
      "level": "info",
      "message": "任务执行成功"
    }
  ]
}
```

#### 通过任务名称查询所有执行

```bash
GET /tasks/running/:taskName
```

**响应示例**:
```json
[
  {
    "executionId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "running",
    "startedAt": "2025-11-25T11:05:00Z",
    "logs": [...]
  },
  {
    "executionId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "completed",
    "startedAt": "2025-11-25T11:04:00Z",
    "logs": [...]
  }
]
```

### 3. 取消任务执行

#### 通过执行 ID 数组取消

```bash
DELETE /tasks/executions/cancel/by-ids
Body: { "executionIds": ["id1", "id2", "id3"] }
```

**响应示例**:
```json
{
  "cancelled": ["id1", "id2"],
  "notFound": ["id3"]
}
```

#### 通过任务名称数组取消

```bash
DELETE /tasks/executions/cancel/by-task-names
Body: { "taskNames": ["user-space-sync", "feishu-sync"] }
```

**响应示例**:
```json
{
  "cancelled": ["exec-id-1", "exec-id-2"],
  "taskNotFound": []
}
```

#### 取消所有任务

```bash
DELETE /tasks/executions/cancel/all
```

**响应示例**:
```json
{
  "count": 5
}
```

## 前端使用示例

### React 示例

```typescript
// 1. 执行任务
const executeTask = async (taskName: string, params?: any) => {
  const response = await fetch(`/tasks/${taskName}/execute/manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ params })
  });
  
  // 任务已在后台执行，立即返回
  return response.json();
};

// 2. 轮询查询任务状态
const pollTaskStatus = async (executionId: string) => {
  const response = await fetch(`/tasks/running/execution/${executionId}`);
  const data = await response.json();
  
  return {
    status: data.status,
    logs: data.logs,
    isRunning: data.status === 'running'
  };
};

// 3. 使用 useEffect 定时查询
useEffect(() => {
  if (!executionId || !isRunning) return;
  
  const interval = setInterval(async () => {
    const { status, logs, isRunning: stillRunning } = await pollTaskStatus(executionId);
    setTaskStatus(status);
    setLogs(logs);
    
    if (!stillRunning) {
      setIsRunning(false);
      clearInterval(interval);
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, [executionId, isRunning]);

// 4. 取消任务
const cancelTask = async (executionId: string) => {
  const response = await fetch('/tasks/executions/cancel/by-ids', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ executionIds: [executionId] })
  });
  
  return response.json();
};

// 5. 批量取消
const cancelMultipleTasks = async (executionIds: string[]) => {
  const response = await fetch('/tasks/executions/cancel/by-ids', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ executionIds })
  });
  
  return response.json();
};
```

## 任务执行状态

任务可能处于以下状态之一：

- **running**: 任务正在执行
- **completed**: 任务执行成功
- **failed**: 任务执行失败
- **cancelled**: 任务被取消

## 执行日志

每个任务执行都会记录详细的日志，包括：

- **timestamp**: 日志时间戳
- **level**: 日志级别 (info/warn/error/debug)
- **message**: 日志消息
- **data**: 可选的额外数据

### 日志示例

```json
{
  "timestamp": "2025-11-25T11:05:00Z",
  "level": "info",
  "message": "开始执行任务 (超时限制: 30000ms)"
}
```

## 最佳实践

1. **异步执行**: 前端触发任务后立即返回，不要等待任务完成
2. **定时查询**: 使用定时器定期查询任务状态，而不是阻塞等待
3. **批量操作**: 使用数组参数进行批量取消，提高效率
4. **错误处理**: 检查响应中的 `notFound` 或 `taskNotFound` 字段处理不存在的任务
5. **日志监控**: 利用执行日志进行调试和监控

## 中间件支持

任务系统支持中间件链，可以在任务执行的不同阶段进行处理：

- **前置中间件**: 任务执行前
- **后置中间件**: 任务执行成功后
- **错误中间件**: 任务执行失败时

所有中间件都可以访问完整的 `TaskContext`，包括执行日志。
