"use client";

import type { TaskVO } from "@/types/task";
import { JsonViewer } from "@/components/common/json-viewer";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface TaskDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskVO | null;
}

function DataRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground min-w-fit">{label}</span>
      <span className={cn("text-sm text-right wrap-break-word flex-1", mono && "font-mono text-xs")}>
        {value}
      </span>
    </div>
  );
}

export function TaskDetailSheet({
  open,
  onOpenChange,
  task,
}: TaskDetailSheetProps) {
  if (!task)
    return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>任务详情</SheetTitle>
          <SheetDescription>
            {task.name}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {/* 基本信息 */}
          <CollapsibleSection title="基本信息" defaultOpen={true}>
            <DataRow label="任务名称" value={task.name} />
            <DataRow label="描述" value={task.description || "-"} />
          </CollapsibleSection>

          {/* 选项配置 */}
          {task.options && Object.keys(task.options).length > 0 && (
            <CollapsibleSection title="选项配置" defaultOpen={true}>
              <JsonViewer
                data={task.options}
                editable={false}
                height="300px"
                className="border rounded-lg overflow-hidden"
              />
            </CollapsibleSection>
          )}

          {/* 完整数据 */}
          <CollapsibleSection title="完整数据" defaultOpen={true}>
            <JsonViewer
              data={task}
              editable={false}
              height="400px"
              showCopyButton={true}
            />
          </CollapsibleSection>
        </div>
      </SheetContent>
    </Sheet>
  );
}
