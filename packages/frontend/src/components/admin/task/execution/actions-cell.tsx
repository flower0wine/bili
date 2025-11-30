"use client";

import type { TaskExecutionVO } from "@/types/task";
import { useState } from "react";
import { ExecutionDetailSheet } from "@/components/admin/task/execution/detail-sheet";
import { Button } from "@/components/ui/button";

interface ExecutionActionsCellProps {
  execution: TaskExecutionVO;
}

export function ExecutionActionsCell({ execution }: ExecutionActionsCellProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSheetOpen(true)}
        >
          详情
        </Button>
      </div>
      <ExecutionDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        execution={execution}
      />
    </>
  );
}
