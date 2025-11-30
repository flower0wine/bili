# 任务管理 API 快速参考

## 执行任务

### 手动执行
```bash
POST /tasks/{taskName}/execute/manual
Content-Type: application/json

{
  "params": {
    // 任务参数
  }
}
```

### 通过 API 执行
```bash
POST /tasks/{taskName}/execute/api
Content-Type: application/json

{
  "params": {
    // 任务参数
  }
}
```

## 查询任务状态

### 查询特定执行 ID 的状态
```bash
GET /tasks/running/execution/{executionId}
```

**响应**:
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
    }
  ]
}
```

### 查询任务名称的所有执行
```bash
GET /tasks/running/{taskName}
```

**响应**:
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

## 取消任务

### 通过执行 ID 取消
```bash
DELETE /tasks/executions/cancel/by-ids
Content-Type: application/json

{
  "executionIds": ["id1", "id2", "id3"]
}
```

**响应**:
```json
{
  "cancelled": ["id1", "id2"],
  "notFound": ["id3"]
}
```

### 通过任务名称取消
```bash
DELETE /tasks/executions/cancel/by-task-names
Content-Type: application/json

{
  "taskNames": ["user-space-sync", "feishu-sync"]
}
```

**响应**:
```json
{
  "cancelled": ["exec-id-1", "exec-id-2"],
  "taskNotFound": []
}
```

### 取消所有任务
```bash
DELETE /tasks/executions/cancel/all
```

**响应**:
```json
{
  "count": 5
}
```

## 任务状态值

- `running` - 任务正在执行
- `completed` - 任务执行成功
- `failed` - 任务执行失败
- `cancelled` - 任务被取消

## 日志级别

- `info` - 信息日志
- `warn` - 警告日志
- `error` - 错误日志
- `debug` - 调试日志

## 常见场景

### 场景 1: 执行任务并轮询状态

```javascript
// 1. 执行任务
const response = await fetch('/tasks/user-space-sync/execute/manual', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ params: {} })
});

// 2. 轮询查询状态
const executionId = response.data.executionId;
const interval = setInterval(async () => {
  const status = await fetch(`/tasks/running/execution/${executionId}`);
  const data = await status.json();
  
  if (data.status !== 'running') {
    clearInterval(interval);
    console.log('任务完成:', data.status);
  }
}, 1000);
```

### 场景 2: 批量取消任务

```javascript
// 获取所有执行
const response = await fetch('/tasks/running/user-space-sync');
const executions = await response.json();

// 提取所有 ID
const ids = executions.map(e => e.executionId);

// 批量取消
await fetch('/tasks/executions/cancel/by-ids', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ executionIds: ids })
});
```

### 场景 3: 查看任务执行日志

```javascript
const response = await fetch('/tasks/running/execution/{executionId}');
const data = await response.json();

// 打印所有日志
data.logs.forEach(log => {
  console.log(`[${log.level}] ${log.timestamp}: ${log.message}`);
  if (log.data) {
    console.log('  Data:', log.data);
  }
});
```

## 错误处理

所有 API 都遵循标准 HTTP 状态码：

- `200` - 成功
- `400` - 请求参数错误
- `404` - 资源不存在
- `500` - 服务器错误

## 性能建议

1. **轮询间隔**: 建议 1-2 秒，避免过于频繁
2. **批量操作**: 使用数组参数进行批量操作，而不是多次单个请求
3. **日志大小**: 长时间运行的任务日志可能很大，考虑分页查询
4. **并发限制**: 避免同时执行过多任务，根据系统资源调整
