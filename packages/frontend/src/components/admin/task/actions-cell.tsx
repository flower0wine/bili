"use client";

import type { TaskVO } from "@/types/task";
import { useState } from "react";
import { toast } from "sonner";
import { TaskDetailSheet } from "@/components/admin/task/detail-sheet";
import { TsViewer } from "@/components/common/ts-viewer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExecuteTaskManually } from "@/hooks/apis/task.use";
import { toError } from "@/lib/error.util";
import { parseObjectString } from "@/lib/utils";

interface TaskActionsCellProps {
  task: TaskVO;
}

export function TaskActionsCell({ task }: TaskActionsCellProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [paramsJson, setParamsJson] = useState("{}");
  const executeTaskMutation = useExecuteTaskManually();

  const handleJsonHandle = (value: string) => {
    setParamsJson(value);
  };

  const handleExecuteTask = async () => {
    let params: Record<string, unknown>;
    try {
      params = parseObjectString(paramsJson);
    }
    catch (e) {
      const error = toError(e);
      toast.error(error.message);
      return;
    }

    try {
      await executeTaskMutation.mutateAsync({
        taskName: task.name,
        data: { params },
      });
      toast.success(`任务 ${task.name} 提交成功`);
      setAlertOpen(false);
      setParamsJson("{}");
    }
    catch (e) {
      const error = toError(e);
      toast.error(error.message);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => setAlertOpen(true)}
          disabled={executeTaskMutation.isPending}
        >
          {executeTaskMutation.isPending ? "提交中..." : "执行"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSheetOpen(true)}
        >
          详情
        </Button>
      </div>

      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>执行任务</DialogTitle>
            <DialogDescription>
              执行任务
              {" "}
              <span className="font-semibold text-foreground">{task.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">任务参数</label>
              <p className="text-xs text-muted-foreground mb-2">输入 JSON 格式的参数（必须是对象）</p>
              <TsViewer
                value={paramsJson}
                editable
                onChange={handleJsonHandle}
                height="250px"
                showCopyButton={false}
                title="任务参数对象"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAlertOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="default"
              onClick={handleExecuteTask}
              disabled={executeTaskMutation.isPending}
            >
              {executeTaskMutation.isPending ? "提交中..." : "确认执行"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TaskDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        task={task}
      />
    </>
  );
}
