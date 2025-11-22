"use client";

import { useState } from "react";
import { TaskDetailSheet } from "@/components/admin/task/detail-sheet";
import { Button } from "@/components/ui/button";

interface TaskActionsCellProps {
  task: Task.TaskVO;
}

export function TaskActionsCell({ task }: TaskActionsCellProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            // TODO: 执行任务
            console.log("Execute task:", task.name);
          }}
        >
          执行
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSheetOpen(true)}
        >
          详情
        </Button>
      </div>
      <TaskDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        task={task}
      />
    </>
  );
}
