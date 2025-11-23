"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAllTasks } from "@/hooks/apis/task.use";
import { cn } from "@/lib/utils";

interface TaskSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function TaskSelector({ value, onValueChange, disabled = false }: TaskSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const { data: tasks = [] } = useAllTasks();

  const selectedTask = tasks.find(task => task.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value
            ? selectedTask?.name || "选择任务..."
            : "选择任务..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="搜索任务..." className="h-9" />
          <CommandList className="max-h-64">
            <CommandEmpty>未找到任务</CommandEmpty>
            <CommandGroup>
              {tasks.map(task => (
                <CommandItem
                  key={task.name}
                  value={task.name}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === task.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{task.name}</span>
                    {task.description && (
                      <span className="text-xs text-muted-foreground">
                        {task.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
