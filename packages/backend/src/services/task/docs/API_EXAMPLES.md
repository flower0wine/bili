# 任务系统 API 使用示例

本文档提供任务系统相关 API 的使用示例。

## Tasks API

### 1. 获取所有已注册的任务

**请求**

```http
GET /tasks
```

**响应**

```json
[
  {
    "name": "user-space-sync",
    "description": "同步用户空间数据到数据库",
    "options": {
      "retries": 3,
      "timeout": 300000
    }
  },
  {
    "name": "user-card-sync",
    "description": "同步用户卡片数据",
    "options": {
      "retries": 2,
      "timeout": 180000
    }
  }
]
```

### 2. 获取任务详情

**请求**

```http
GET /tasks/user-space-sync
```

**响应**

```json
{
  "success": true,
  "data": {
    "name": "user-space-sync",
    "description": "同步用户空间数据到数据库",
    "options": {
      "retries": 3,
      "timeout": 300000
    }
  }
}
```

### 3. 手动执行任务

**请求**

```http
POST /tasks/user-space-sync/execute
Content-Type: application/json

{
  "params": {
    "mid": 12345
  }
}
```

**响应**

```json
{
  "executionId": "550e8400-e29b-41d4-a716-446655440000",
  "success": true,
  "data": {
    "mid": 12345,
    "name": "测试用户"
  },
  "startedAt": "2025-11-09T10:00:00Z",
  "finishedAt": "2025-11-09T10:05:30Z",
  "duration": 330000,
  "retryCount": 0
}
```

### 4. 获取任务执行历史（分页 + 过滤）

**请求 - 基本查询**

```http
GET /tasks/executions/history?page=1&pageSize=20
```

**请求 - 带过滤条件**

```http
GET /tasks/executions/history?taskName=user-space-sync&status=success&page=1&pageSize=20
```

**请求 - 时间范围过滤**

```http
GET /tasks/executions/history?startDate=2025-11-08T00:00:00Z&endDate=2025-11-09T23:59:59Z&page=1&pageSize=20
```

**支持的查询参数**

- `taskName` - 任务名称过滤
- `status` - 执行状态过滤（running, success, failed, cancelled）
- `triggerSource` - 触发源过滤（cron, api, manual）
- `triggerName` - 触发器名称过滤
- `startDate` - 开始时间（ISO 8601 格式）
- `endDate` - 结束时间（ISO 8601 格式）
- `page` - 页码（从1开始，默认1）
- `pageSize` - 每页数量（默认20）

**响应**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "taskName": "user-space-sync",
      "triggerSource": "cron",
      "triggerName": "daily-sync",
      "params": {
        "mid": 12345
      },
      "status": "success",
      "result": {
        "processed": 100
      },
      "error": null,
      "retryCount": 0,
      "maxRetries": 3,
      "startedAt": "2025-11-09T10:00:00Z",
      "finishedAt": "2025-11-09T10:05:30Z",
      "duration": 330000,
      "createdAt": "2025-11-09T10:00:00Z",
      "updatedAt": "2025-11-09T10:05:30Z"
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8
}
```

### 5. 获取单个任务执行记录详情

**请求**

```http
GET /tasks/executions/550e8400-e29b-41d4-a716-446655440000
```

**响应**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "taskName": "user-space-sync",
  "triggerSource": "api",
  "triggerName": null,
  "params": {
    "mid": 12345
  },
  "status": "success",
  "result": {
    "mid": 12345,
    "name": "测试用户"
  },
  "error": null,
  "retryCount": 0,
  "maxRetries": 3,
  "startedAt": "2025-11-09T10:00:00Z",
  "finishedAt": "2025-11-09T10:05:30Z",
  "duration": 330000,
  "createdAt": "2025-11-09T10:00:00Z",
  "updatedAt": "2025-11-09T10:05:30Z"
}
```

### 6. 获取任务执行统计信息

**请求 - 所有任务统计**

```http
GET /tasks/stats/summary
```

**请求 - 特定任务统计**

```http
GET /tasks/stats/summary?taskName=user-space-sync
```

**响应**

```json
{
  "total": 150,
  "running": 2,
  "success": 120,
  "failed": 25,
  "cancelled": 3,
  "avgDuration": 180000
}
```

## Triggers API

### 1. 获取所有触发器

**请求**

```http
GET /triggers/cron
```

**响应**

```json
[
  {
    "id": 1,
    "name": "daily-user-sync",
    "taskName": "user-space-sync",
    "cron": "0 0 * * *",
    "params": {
      "mid": 12345
    },
    "enabled": true,
    "description": "每天凌晨同步用户空间数据",
    "source": "database",
    "createdAt": "2025-11-09T10:00:00Z",
    "updatedAt": "2025-11-09T10:05:30Z"
  }
]
```

### 2. 创建触发器

**请求**

```http
POST /triggers/cron
Content-Type: application/json

{
  "name": "hourly-card-sync",
  "taskName": "user-card-sync",
  "cron": "0 * * * *",
  "params": {
    "mid": 67890
  },
  "description": "每小时同步用户卡片数据",
  "enabled": true
}
```

**响应**

```json
{
  "id": 2,
  "name": "hourly-card-sync",
  "taskName": "user-card-sync",
  "cron": "0 * * * *",
  "params": {
    "mid": 67890
  },
  "enabled": true,
  "description": "每小时同步用户卡片数据",
  "source": "database",
  "createdAt": "2025-11-09T11:00:00Z",
  "updatedAt": "2025-11-09T11:00:00Z"
}
```

### 3. 更新触发器

**请求**

```http
PUT /triggers/cron/1
Content-Type: application/json

{
  "cron": "0 2 * * *",
  "description": "每天凌晨2点同步用户空间数据"
}
```

**响应**

```json
{
  "id": 1,
  "name": "daily-user-sync",
  "taskName": "user-space-sync",
  "cron": "0 2 * * *",
  "params": {
    "mid": 12345
  },
  "enabled": true,
  "description": "每天凌晨2点同步用户空间数据",
  "source": "database",
  "createdAt": "2025-11-09T10:00:00Z",
  "updatedAt": "2025-11-09T11:30:00Z"
}
```

### 4. 删除触发器

**请求**

```http
DELETE /triggers/cron/1
```

**响应**

```json
{
  "success": true
}
```

### 5. 切换触发器启用状态

**请求**

```http
POST /triggers/cron/1/toggle
```

**响应**

```json
{
  "id": 1,
  "name": "daily-user-sync",
  "taskName": "user-space-sync",
  "cron": "0 0 * * *",
  "params": {
    "mid": 12345
  },
  "enabled": false,
  "description": "每天凌晨同步用户空间数据",
  "source": "database",
  "createdAt": "2025-11-09T10:00:00Z",
  "updatedAt": "2025-11-09T12:00:00Z"
}
```

## 常见使用场景

### 场景 1: 查看某个任务最近的失败记录

```http
GET /tasks/executions/history?taskName=user-space-sync&status=failed&page=1&pageSize=10
```

### 场景 2: 查看今天所有通过 API 触发的任务

```http
GET /tasks/executions/history?triggerSource=api&startDate=2025-11-09T00:00:00Z&endDate=2025-11-09T23:59:59Z
```

### 场景 3: 查看某个触发器的执行历史

```http
GET /tasks/executions/history?triggerName=daily-user-sync
```

### 场景 4: 查看正在运行的任务

```http
GET /tasks/executions/history?status=running
```

### 场景 5: 重新执行失败的任务

先查询失败记录获取参数：

```http
GET /tasks/executions/550e8400-e29b-41d4-a716-446655440000
```

使用相同参数重新执行：

```http
POST /tasks/user-space-sync/execute
Content-Type: application/json

{
  "params": {
    "mid": 12345
  }
}
```

