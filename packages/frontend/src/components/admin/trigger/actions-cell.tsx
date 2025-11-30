"use client";

import type { TriggerVO } from "@/types/trigger";
import { useState } from "react";

import { TriggerDeleteDialog } from "@/components/admin/trigger/delete-dialog";
import { TriggerDetailSheet } from "@/components/admin/trigger/detail-sheet";
import { TriggerFormSheet } from "@/components/admin/trigger/form-sheet";
import { Button } from "@/components/ui/button";

interface TriggerActionsCellProps {
  trigger: TriggerVO;
}

export function TriggerActionsCell({ trigger }: TriggerActionsCellProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditOpen(true)}
        >
          编辑
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDetailOpen(true)}
        >
          详情
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteOpen(true)}
        >
          删除
        </Button>
      </div>
      <TriggerFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        trigger={trigger}
      />
      <TriggerDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        trigger={trigger}
      />
      <TriggerDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        trigger={trigger}
      />
    </>
  );
}
