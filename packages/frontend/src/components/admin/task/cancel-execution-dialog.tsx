import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CancelExecutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  executionId?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export function CancelExecutionDialog({
  open,
  onOpenChange,
  executionId,
  onConfirm,
  isLoading = false,
  title = "确认停止任务",
  description,
}: CancelExecutionDialogProps) {
  const defaultDescription = executionId
    ? `确定要停止执行 ID 为 ${executionId} 的任务吗？此操作无法撤销。`
    : "确定要停止任务吗？此操作无法撤销。";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "停止中..." : "确认停止"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
