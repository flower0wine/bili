# 正在运行的任务统计接口

## 概述

新增接口用于获取所有正在运行的任务统计信息，按任务名称分组，提供总数和每种任务的运行数量。

## 接口设计

### 后端实现

#### TaskService.getAllRunningTasks()

```typescript
/**
 * 获取所有正在运行的任务统计（按任务名称分组）
 * @returns 返回按任务名称分组的运行任务统计
 */
getAllRunningTasks() {
  const runningTasks = this.taskExecutor.getRunningTasks();
  const taskStats = new Map<string, number>();

  for (const taskInfo of runningTasks.values()) {
    const count = taskStats.get(taskInfo.taskName) || 0;
    taskStats.set(taskInfo.taskName, count + 1);
  }

  const stats = Array.from(taskStats.entries()).map(([taskName, count]) => ({
    taskName,
    count
  }));

  return {
    total: runningTasks.size,
    stats
  };
}
```

**特点**:
- 按 taskName 分组统计
- 返回总数和各任务的运行数量
- 不返回详细的任务信息，只返回统计数据

#### TaskController 路由

```typescript
/**
 * 获取所有正在运行的任务
 */
@Get("running")
getAllRunningTasks() {
  return this.taskService.getAllRunningTasks();
}
```

**路由**: `GET /v1/tasks/running`

### 前端类型定义

```typescript
/**
 * 任务运行统计（按任务名称分组）
 */
export interface TaskRunningStatVO {
  taskName: string;
  count: number;
}

/**
 * 所有正在运行的任务统计
 */
export interface AllRunningTasksStatsVO {
  total: number;
  stats: TaskRunningStatVO[];
}
```

### 前端 API

```typescript
getAllRunningTasks: async () => {
  return api.get<ApiResponse<AllRunningTasksStatsVO>>(
    "/v1/tasks/running",
  );
}
```

### 前端 Hook

```typescript
export function useAllRunningTasks() {
  return useQuery<AllRunningTasksStatsVO>({
    queryKey: ["tasks", "running"],
    queryFn: async () => {
      const response = await taskApi.getAllRunningTasks();
      return response.data.data!;
    },
  });
}
```

## 返回示例

### 请求

```bash
GET /v1/tasks/running
```

### 响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 5,
    "stats": [
      {
        "taskName": "user-sync",
        "count": 2
      },
      {
        "taskName": "data-sync",
        "count": 1
      },
      {
        "taskName": "report-generate",
        "count": 2
      }
    ]
  }
}
```

## 前端使用示例

### 基础使用

```typescript
import { useAllRunningTasks } from "@/hooks/apis/task.use";

function TaskStatsComponent() {
  const { data, isLoading, error } = useAllRunningTasks();

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <div>
      <h3>正在运行的任务统计</h3>
      <p>总数: {data?.total}</p>
      <ul>
        {data?.stats.map((stat) => (
          <li key={stat.taskName}>
            {stat.taskName}: {stat.count} 个
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 显示任务分类统计

```typescript
function TaskCategoryStats() {
  const { data } = useAllRunningTasks();

  return (
    <div className="task-stats">
      <div className="total">
        <span>总运行任务数: {data?.total}</span>
      </div>
      <div className="categories">
        {data?.stats.map((stat) => (
          <div key={stat.taskName} className="category">
            <span className="name">{stat.taskName}</span>
            <span className="badge">{stat.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 自动刷新

```typescript
function LiveTaskStats() {
  const { data, refetch } = useAllRunningTasks();

  useEffect(() => {
    // 每 5 秒刷新一次
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <div>
      <h3>实时任务统计</h3>
      <p>总数: {data?.total}</p>
      {data?.stats.map((stat) => (
        <div key={stat.taskName}>
          {stat.taskName}: {stat.count}
        </div>
      ))}
    </div>
  );
}
```

## 与其他接口的区别

### getAllRunningTasks() - 统计接口

- **用途**: 显示任务分类的运行数量统计
- **返回数据**: 按任务名称分组的统计数据
- **数据量**: 小（只有统计数据）
- **更新频率**: 可以较高（数据量小）
- **适用场景**: 仪表板、任务分类统计

### getTaskExecutionsByName(taskName) - 详情接口

- **用途**: 获取某个任务的所有运行实例详情
- **返回数据**: 该任务的所有运行实例的详细信息
- **数据量**: 大（包含完整的任务信息）
- **更新频率**: 较低（数据量大）
- **适用场景**: 任务详情页面、任务监控

### getTaskExecutionById(executionId) - 单个详情接口

- **用途**: 获取单个任务执行的详细信息
- **返回数据**: 单个任务执行的完整信息
- **数据量**: 中等
- **更新频率**: 按需
- **适用场景**: 任务执行详情页面

## 性能考虑

### 优势

1. **数据量小**: 只返回统计数据，网络传输快
2. **计算简单**: O(n) 时间复杂度，其中 n 是运行中的任务数
3. **适合实时更新**: 可以频繁调用而不会造成性能问题
4. **缓存友好**: 数据结构简单，易于缓存

### 使用建议

1. **刷新频率**: 建议 2-5 秒刷新一次
2. **缓存策略**: 可以使用 React Query 的缓存，设置较短的 staleTime
3. **批量操作**: 与其他查询接口配合使用，避免过多请求

## 相关接口路由

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/v1/tasks/running` | 获取所有正在运行的任务统计 |
| GET | `/v1/tasks/running/:taskName` | 获取特定任务名称的所有运行实例 |
| GET | `/v1/tasks/running/execution/:executionId` | 获取特定执行 ID 的详细信息 |

## 总结

新增的统计接口提供了一个轻量级的方式来获取正在运行的任务统计信息，特别适合在仪表板或任务分类页面中显示运行数量统计。通过按任务名称分组，前端可以清晰地展示各个任务分类的运行情况。
