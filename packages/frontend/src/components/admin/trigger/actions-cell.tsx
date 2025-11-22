"use client";

import type { TriggerVO } from "@/types/trigger";
import { useState } from "react";
import { TriggerDetailSheet } from "@/components/admin/trigger/detail-sheet";
import { Button } from "@/components/ui/button";

interface TriggerActionsCellProps {
  trigger: TriggerVO;
}

export function TriggerActionsCell({ trigger }: TriggerActionsCellProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // TODO: 编辑触发器
            console.log("Edit trigger:", trigger.id);
          }}
        >
          编辑
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSheetOpen(true)}
        >
          详情
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // TODO: 删除触发器
            console.log("Delete trigger:", trigger.id);
          }}
        >
          删除
        </Button>
      </div>
      <TriggerDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        trigger={trigger}
      />
    </>
  );
}
