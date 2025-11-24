"use client";

import type { CreateTriggerDTO, TriggerVO, UpdateTriggerDTO } from "@/types/trigger";
import { zodResolver } from "@hookform/resolvers/zod";

import * as devalue from "devalue";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import * as z from "zod";
import { TaskSelector } from "@/components/admin/trigger/task-selector";
import { TsViewer } from "@/components/common/ts-viewer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTrigger, useUpdateTrigger } from "@/hooks/apis/trigger.use";
import { toError } from "@/lib/error.util";
import { formatJS } from "@/lib/formatJS.util";
import { ApiError } from "@/lib/request/axios";
import { parseObjectString } from "@/lib/utils";


// Form schema validation
const triggerFormSchema = z.object({
  name: z.string().min(1, "请输入触发器名称").default(""),
  taskName: z.string().min(1, "请选择关联任务").default(""),
  cron: z.string().min(1, "请输入 Cron 表达式").default(""),
  description: z.string().default(""),
  enabled: z.boolean().default(true),
  paramsJson: z.string().default("{}").refine(
    (val) => {
      if (!val.trim())
        return true;
      const parsed = parseObjectStringInner(val);
      return parsed !== null;
    },
    { message: "参数必须是有效的 JSON 对象" }
  ),
});

type TriggerFormData = z.infer<typeof triggerFormSchema>;

interface TriggerFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: TriggerVO | null;
}

function parseObjectStringInner(val: string) {
  try {
    return parseObjectString(val);
  }
  catch (e) {
    const error = toError(e);
    console.error(error.message);
    return null;
  }
}

export function TriggerFormSheet({ open, onOpenChange, trigger }: TriggerFormSheetProps) {
  const isEdit = !!trigger;
  const createMutation = useCreateTrigger();
  const updateMutation = useUpdateTrigger();
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const form = useForm<TriggerFormData>({
    resolver: zodResolver(triggerFormSchema) as any,
    defaultValues: {
      name: "",
      taskName: "",
      cron: "",
      description: "",
      enabled: true,
      paramsJson: "{}",
    } as TriggerFormData,
  });

  // Reset form when trigger changes or sheet opens
  useEffect(() => {
    if (open) {
      let paramsJson = "{}";
      try {
        paramsJson = formatJS(devalue.uneval(trigger?.params || {}));
      }
      catch (e) {
        const error = toError(e);
        console.error(error.message);

        try {
          paramsJson = JSON.stringify(trigger?.params || {}, null, 2);
        }
        catch (e) {
          const error = toError(e);
          console.error(error.message);
          toast.error("解析失败");
        }
      }

      form.reset({
        name: trigger?.name || "",
        taskName: trigger?.taskName || "",
        cron: trigger?.cron || "",
        description: trigger?.description || "",
        enabled: trigger?.enabled ?? true,
        paramsJson,
      });
    }
  }, [open, trigger, form]);

  const onSubmit = (data: TriggerFormData): void => {
    // Parse params from JSON string
    let params: Record<string, unknown> = {};
    if (data.paramsJson.trim()) {
      try {
        params = parseObjectString(data.paramsJson);
      }
      catch (e) {
        const error = toError(e);
        toast.error(error.message);
        return;
      }
    }

    if (isEdit && trigger) {
      const updateData: UpdateTriggerDTO = {
        name: data.name,
        taskName: data.taskName,
        cron: data.cron,
        description: data.description || undefined,
        enabled: data.enabled,
        params: Object.keys(params).length > 0 ? params : undefined,
      };
      updateMutation.mutate(
        { id: trigger.id.toString(), data: updateData },
        {
          onSuccess: () => {
            toast.success("触发器更新成功");
            onOpenChange(false);
            form.reset();
          },
          onError: (error) => {
            if (ApiError.isApiError(error)) {
              toast.error(error.getDisplayMessage());
            }
            else {
              toast.error("更新触发器失败，请重试");
            }
          },
        }
      );
    }
    else {
      const createData: CreateTriggerDTO = {
        name: data.name,
        taskName: data.taskName,
        cron: data.cron,
        description: data.description || undefined,
        enabled: data.enabled,
        params: Object.keys(params).length > 0 ? params : undefined,
      };
      createMutation.mutate(createData, {
        onSuccess: () => {
          toast.success("触发器创建成功");
          onOpenChange(false);
          form.reset();
        },
        onError: (error) => {
          if (ApiError.isApiError(error)) {
            toast.error(
              <div dangerouslySetInnerHTML={{ __html: error.message }}>
              </div>
            );
          }
          else {
            toast.error("创建触发器失败，请重试");
          }
        },
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-2xl overflow-y-auto px-4">
        <SheetHeader>
          <SheetTitle>{isEdit ? "编辑触发器" : "新建触发器"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "修改触发器配置" : "创建新的 Cron 触发器"}
          </SheetDescription>
        </SheetHeader>

        <form id="trigger-form" onSubmit={form.handleSubmit(onSubmit)} className="py-6">
          <FieldSet>
            <FieldGroup>
              {/* 触发器名称 */}
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="trigger-name">触发器名称</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        id="trigger-name"
                        placeholder="例如：每天凌晨执行"
                        disabled={isLoading}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* 关联任务 */}
              <Controller
                name="taskName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>关联任务</FieldLabel>
                    <FieldContent>
                      <TaskSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Cron 表达式 */}
              <Controller
                name="cron"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="trigger-cron">Cron 表达式</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        id="trigger-cron"
                        placeholder="例如：0 0 * * *"
                        disabled={isLoading}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldDescription>
                        标准 Cron 格式：分 小时 日期 月份 星期
                      </FieldDescription>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* 描述 */}
              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="trigger-description">描述（可选）</FieldLabel>
                    <FieldContent>
                      <Textarea
                        {...field}
                        id="trigger-description"
                        placeholder="输入触发器的描述信息"
                        disabled={isLoading}
                        rows={3}
                      />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* 启用状态 */}
              <Controller
                name="enabled"
                control={form.control}
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id="trigger-enabled"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="trigger-enabled">启用此触发器</FieldLabel>
                    </FieldContent>
                  </Field>
                )}
              />

              {/* 参数配置 */}
              <Controller
                name="paramsJson"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>参数配置（可选）</FieldLabel>
                    <FieldContent>
                      <FieldDescription>
                        输入有效的对象作为触发器参数
                      </FieldDescription>
                      <TsViewer
                        value={field.value}
                        editable
                        onChange={field.onChange}
                        height="250px"
                        showCopyButton={false}
                        title="触发器参数对象"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
        </form>

        <SheetFooter className="flex flex-row justify-end">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            type="submit"
            form="trigger-form"
            disabled={isLoading}
          >
            {isLoading ? "保存中..." : "保存"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
