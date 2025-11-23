"use client";

import type { TriggerVO } from "@/types/trigger";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteTrigger } from "@/hooks/apis/trigger.use";

interface TriggerDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: TriggerVO | null;
}

export function TriggerDeleteDialog({ open, onOpenChange, trigger }: TriggerDeleteDialogProps) {
  const deleteMutation = useDeleteTrigger();
  const isLoading = deleteMutation.isPending;

  if (!trigger) {
    return null;
  }

  const handleConfirm = () => {
    deleteMutation.mutate(trigger.id.toString(), {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除触发器</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除触发器
            {" "}
            <span className="font-medium text-foreground">{trigger.name}</span>
            {" "}
            吗？此操作无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-end">
          <AlertDialogCancel disabled={isLoading}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "删除中..." : "删除"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
