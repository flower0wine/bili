# 代码优化总结

## 优化背景

三个取消任务的方法（`cancelExecutionsByIds`、`cancelExecutionsByTaskNames`、`cancelAllExecutions`）存在大量重复代码，主要是取消操作的核心逻辑。

## 优化方案

### 1. 提取公共方法 `performCancelTasks`

**目的**: 将取消操作的核心逻辑提取为私有方法

**方法签名**:
```typescript
private performCancelTasks(
  taskInfos: Array<{ executionId: string; taskInfo: RunningTaskInfo }>,
  failFast: boolean
): {
  cancelled: string[];
  failed: Array<{ executionId: string; error: string }>;
}
```

**职责**:
- 遍历任务信息数组
- 执行 abort 操作
- 更新任务状态
- 记录日志
- 处理异常（根据 failFast 决定是否继续）

### 2. 重构三个公共方法

每个方法现在只负责：
1. 获取运行中的任务
2. 根据条件（ID、任务名称、全部）筛选任务
3. 调用 `performCancelTasks` 执行取消
4. 返回结果

### 3. 代码对比

#### 优化前
```typescript
// cancelExecutionsByIds - ~40 行
// cancelExecutionsByTaskNames - ~50 行
// cancelAllExecutions - ~25 行
// 总计: ~115 行，大量重复代码
```

#### 优化后
```typescript
// performCancelTasks - ~30 行（公共方法）
// cancelExecutionsByIds - ~20 行
// cancelExecutionsByTaskNames - ~25 行
// cancelAllExecutions - ~15 行
// 总计: ~90 行，减少 ~22% 代码量
```

## 优化效果

### 优势

1. **代码复用**: 取消操作的核心逻辑只需维护一份
2. **易于维护**: 修改取消逻辑只需改一个地方
3. **一致性**: 确保所有取消操作行为一致
4. **可读性**: 每个方法的职责更清晰
5. **可测试性**: 可以单独测试 `performCancelTasks` 方法

### 改进点

| 方面 | 改进 |
|------|------|
| 代码行数 | 减少 ~22% |
| 重复代码 | 完全消除 |
| 维护成本 | 降低 |
| 测试覆盖 | 更容易 |
| 扩展性 | 更好 |

## 实现细节

### performCancelTasks 方法

```typescript
private performCancelTasks(
  taskInfos: Array<{ executionId: string; taskInfo: RunningTaskInfo }>,
  failFast: boolean
): {
  cancelled: string[];
  failed: Array<{ executionId: string; error: string }>;
} {
  const cancelled: string[] = [];
  const failed: Array<{ executionId: string; error: string }> = [];

  for (const { executionId, taskInfo } of taskInfos) {
    try {
      // 执行取消
      taskInfo.controller.abort();
      taskInfo.context.status = TaskExecutionStatus.CANCELED;
      cancelled.push(executionId);
      this.logger.debug(`已取消任务执行: ${executionId}`);
    } catch (e) {
      // 处理异常
      const error = toError(e);
      const errorMsg = `取消任务执行失败: ${executionId}, 错误: ${error.message}`;
      this.logger.error(errorMsg);
      failed.push({ executionId, error: error.message });
      if (failFast) {
        throw new Error(errorMsg);
      }
    }
  }

  return { cancelled, failed };
}
```

### 重构后的方法

#### cancelExecutionsByIds
```typescript
cancelExecutionsByIds(
  executionIds: string[],
  options?: { failFast?: boolean }
) {
  const runningTasks = this.taskExecutor.getRunningTasks();
  const notFound: string[] = [];
  const failFast = options?.failFast ?? false;
  const taskInfos: Array<{
    executionId: string;
    taskInfo: RunningTaskInfo;
  }> = [];

  // 筛选任务
  for (const executionId of executionIds) {
    const taskInfo = runningTasks.get(executionId);
    if (!taskInfo) {
      notFound.push(executionId);
      if (failFast) {
        throw new Error(`任务执行不存在: ${executionId}`);
      }
    } else {
      taskInfos.push({ executionId, taskInfo });
    }
  }

  // 执行取消
  const { cancelled, failed } = this.performCancelTasks(taskInfos, failFast);
  return { cancelled, notFound, failed };
}
```

#### cancelExecutionsByTaskNames
```typescript
cancelExecutionsByTaskNames(
  taskNames: string[],
  options?: { failFast?: boolean }
) {
  const runningTasks = this.taskExecutor.getRunningTasks();
  const taskNotFound: string[] = [];
  const failFast = options?.failFast ?? false;
  const taskInfos: Array<{
    executionId: string;
    taskInfo: RunningTaskInfo;
  }> = [];

  // 筛选任务
  for (const taskName of taskNames) {
    let found = false;

    for (const taskInfo of runningTasks.values()) {
      if (taskInfo.taskName === taskName) {
        found = true;
        taskInfos.push({ executionId: taskInfo.executionId, taskInfo });
      }
    }

    if (!found) {
      taskNotFound.push(taskName);
      if (failFast) {
        throw new Error(`任务不存在: ${taskName}`);
      }
    }
  }

  // 执行取消
  const { cancelled, failed } = this.performCancelTasks(taskInfos, failFast);
  return { cancelled, taskNotFound, failed };
}
```

#### cancelAllExecutions
```typescript
cancelAllExecutions(options?: { failFast?: boolean }) {
  const runningTasks = this.taskExecutor.getRunningTasks();
  const failFast = options?.failFast ?? false;
  const taskInfos: Array<{
    executionId: string;
    taskInfo: RunningTaskInfo;
  }> = [];

  // 获取所有任务
  for (const taskInfo of runningTasks.values()) {
    taskInfos.push({ executionId: taskInfo.executionId, taskInfo });
  }

  // 执行取消
  const { cancelled, failed } = this.performCancelTasks(taskInfos, failFast);
  return { count: cancelled.length, cancelled, failed };
}
```

## 测试建议

### 单元测试

```typescript
describe('TaskService - Cancel Operations', () => {
  describe('performCancelTasks', () => {
    it('should cancel all tasks successfully', () => {
      // 测试成功取消
    });

    it('should handle failures in loose mode', () => {
      // 测试宽松模式下的失败处理
    });

    it('should throw on first failure in strict mode', () => {
      // 测试严格模式下的失败处理
    });
  });

  describe('cancelExecutionsByIds', () => {
    it('should cancel tasks by IDs', () => {
      // 测试按 ID 取消
    });

    it('should report not found IDs', () => {
      // 测试报告不存在的 ID
    });
  });

  describe('cancelExecutionsByTaskNames', () => {
    it('should cancel tasks by names', () => {
      // 测试按任务名称取消
    });

    it('should report not found task names', () => {
      // 测试报告不存在的任务名称
    });
  });

  describe('cancelAllExecutions', () => {
    it('should cancel all running tasks', () => {
      // 测试取消所有任务
    });
  });
});
```

## 未来优化方向

1. **进一步提取**: 可以提取任务筛选逻辑为独立方法
2. **性能优化**: 对于大量任务，考虑使用并发取消
3. **事件系统**: 添加取消事件，便于监听和统计
4. **重试机制**: 为失败的取消操作添加重试逻辑

## 总结

通过提取公共方法 `performCancelTasks`，我们成功地：
- ✅ 消除了代码重复
- ✅ 提高了代码可维护性
- ✅ 保持了功能完整性
- ✅ 改进了代码结构
- ✅ 便于未来扩展
