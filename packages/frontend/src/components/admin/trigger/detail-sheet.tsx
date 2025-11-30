"use client";

import type { TriggerVO } from "@/types/trigger";
import { JsonViewer } from "@/components/common/json-viewer";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn, formatDateTime } from "@/lib/utils";

interface TriggerDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: TriggerVO | null;
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

export function TriggerDetailSheet({
  open,
  onOpenChange,
  trigger,
}: TriggerDetailSheetProps) {
  if (!trigger)
    return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>触发器详情</SheetTitle>
          <SheetDescription>
            {trigger.name}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {/* 基本信息 */}
          <CollapsibleSection title="基本信息" defaultOpen={true}>
            <DataRow label="触发器 ID" value={String(trigger.id)} mono />
            <DataRow label="触发器名称" value={trigger.name} />
            <DataRow label="关联任务" value={trigger.taskName} />
            <DataRow label="Cron 表达式" value={trigger.cron} mono />
            <DataRow label="描述" value={trigger.description || "-"} />
            <DataRow
              label="状态"
              value={(
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  trigger.enabled
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                }`}
                >
                  {trigger.enabled ? "启用" : "禁用"}
                </span>
              )}
            />
            <DataRow label="来源" value={trigger.source} />
            <DataRow
              label="创建时间"
              value={formatDateTime(trigger.createdAt)}
            />
            <DataRow
              label="更新时间"
              value={formatDateTime(trigger.updatedAt)}
            />
          </CollapsibleSection>

          {/* 参数配置 */}
          {trigger.params && Object.keys(trigger.params).length > 0 && (
            <CollapsibleSection title="参数配置" defaultOpen={true}>
              <JsonViewer
                data={trigger.params}
                editable={false}
                height="300px"
                className="border rounded-lg overflow-hidden"
              />
            </CollapsibleSection>
          )}

          {/* 完整数据 */}
          <CollapsibleSection title="完整数据" defaultOpen={true}>
            <JsonViewer
              data={trigger}
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
