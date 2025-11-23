"use client";

import type { TaskExecutionQueryDTO, TaskStatus, TriggerSource } from "@/types/task";
import dayjs from "dayjs";
import { X } from "lucide-react";
import { useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { TaskSelector } from "@/components/admin/trigger/task-selector";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TaskStatus as TaskStatusEnum, TriggerSource as TriggerSourceEnum } from "@/types/task";

interface ExecutionFiltersProps {
  filters: TaskExecutionQueryDTO;
  onFiltersChange: (filters: TaskExecutionQueryDTO) => void;
}

interface FilterFormData {
  taskName?: string;
  status?: TaskStatus | "all";
  triggerSource?: TriggerSource | "all";
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

export function ExecutionFilters({ filters, onFiltersChange }: ExecutionFiltersProps) {
  const form = useForm<FilterFormData>({
    defaultValues: {
      taskName: filters.taskName || "",
      status: filters.status || "all",
      triggerSource: filters.triggerSource || "all",
      dateRange: {
        from: filters.startedAt ? new Date(filters.startedAt) : undefined,
        to: filters.finishedAt ? new Date(filters.finishedAt) : undefined,
      },
    },
  });

  const handleSubmit = useCallback((data: FilterFormData) => {
    const newFilters: TaskExecutionQueryDTO = {
      taskName: data.taskName || undefined,
      status: data.status === "all" ? undefined : data.status,
      triggerSource: data.triggerSource === "all" ? undefined : data.triggerSource,
      startedAt: data.dateRange?.from ? dayjs(data.dateRange.from).toISOString() : undefined,
      finishedAt: data.dateRange?.to ? dayjs(data.dateRange.to).toISOString() : undefined,
    };

    onFiltersChange(newFilters);
  }, [onFiltersChange]);

  const handleClearFilters = useCallback(() => {
    form.reset({
      taskName: "",
      status: "all",
      triggerSource: "all",
      dateRange: { from: undefined, to: undefined },
    });
    onFiltersChange({});
  }, [form, onFiltersChange]);

  const hasActiveFilters = useMemo(() => {
    return filters.taskName || filters.status || filters.triggerSource || filters.startedAt || filters.finishedAt;
  }, [filters]);

  return (
    <form
      onChange={() => handleSubmit(form.getValues())}
      className="space-y-4"
    >
      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 任务名称筛选器 */}
        <Field orientation="vertical">
          <FieldLabel>任务名称</FieldLabel>
          <Controller
            name="taskName"
            control={form.control}
            render={({ field }) => (
              <TaskSelector
                value={field.value || ""}
                onValueChange={(value) => {
                  field.onChange(value);
                  handleSubmit({
                    ...form.getValues(),
                    taskName: value,
                  });
                }}
              />
            )}
          />
        </Field>

        {/* 任务状态筛选器 */}
        <Field orientation="vertical">
          <FieldLabel>任务状态</FieldLabel>
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value || "all"} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value={TaskStatusEnum.RUNNING}>运行中</SelectItem>
                  <SelectItem value={TaskStatusEnum.SUCCESS}>成功</SelectItem>
                  <SelectItem value={TaskStatusEnum.FAILED}>失败</SelectItem>
                  <SelectItem value={TaskStatusEnum.CANCELLED}>已取消</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {/* 触发源筛选器 */}
        <Field orientation="vertical">
          <FieldLabel>触发源</FieldLabel>
          <Controller
            name="triggerSource"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value || "all"} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择触发源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部触发源</SelectItem>
                  <SelectItem value={TriggerSourceEnum.MANUAL}>手动触发</SelectItem>
                  <SelectItem value={TriggerSourceEnum.CRON}>定时任务</SelectItem>
                  <SelectItem value={TriggerSourceEnum.API}>API调用</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {/* 日期范围筛选器 */}
        <Field orientation="vertical">
          <FieldLabel>日期范围</FieldLabel>
          <Controller
            name="dateRange"
            control={form.control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value?.from && "text-muted-foreground"
                    )}
                  >
                    {field.value?.from && field.value?.to
                      ? `${dayjs(field.value.from).format("YYYY-MM-DD")} ~ ${dayjs(field.value.to).format("YYYY-MM-DD")}`
                      : field.value?.from
                        ? dayjs(field.value.from).format("YYYY-MM-DD")
                        : "选择日期范围"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{
                      from: field.value?.from,
                      to: field.value?.to,
                    }}
                    onSelect={(range) => {
                      const newDateRange = {
                        from: range?.from,
                        to: range?.to,
                      };
                      field.onChange(newDateRange);

                      handleSubmit({
                        ...form.getValues(),
                        dateRange: newDateRange,
                      });
                    }}
                    disabled={date => date > dayjs().toDate()}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        </Field>
      </FieldGroup>

      {/* 清除筛选器按钮 */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
          >
            <X className="w-4 h-4 mr-1" />
            清除筛选
          </Button>
        </div>
      )}
    </form>
  );
}
