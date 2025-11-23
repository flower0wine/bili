"use client";

import { X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MultiSelectProps {
  value?: string | string[];
  onValueChange: (value: string | string[]) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
}

export function MultiSelect({
  value,
  onValueChange,
  options,
  placeholder = "选择选项",
  multiple = false,
  disabled = false,
}: MultiSelectProps) {
  const selectedValues = useMemo(() => {
    if (!value)
      return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const selectedOptions = useMemo(() => {
    return options.filter(opt => selectedValues.includes(opt.value));
  }, [options, selectedValues]);

  // 多选时，被选中的元素排在最上方
  const sortedSelectedOptions = useMemo(() => {
    if (!multiple)
      return selectedOptions;
    return selectedOptions;
  }, [selectedOptions, multiple]);

  const handleSelect = (selectedValue: string) => {
    if (!multiple) {
      onValueChange(selectedValue);
      return;
    }

    const newValues = selectedValues.includes(selectedValue)
      ? selectedValues.filter(v => v !== selectedValue)
      : [...selectedValues, selectedValue];

    onValueChange(newValues);
  };

  const handleRemove = (removedValue: string) => {
    if (!multiple) {
      onValueChange("");
      return;
    }

    const newValues = selectedValues.filter(v => v !== removedValue);
    onValueChange(newValues);
  };

  const displayText = useMemo(() => {
    if (selectedValues.length === 0) {
      return placeholder;
    }

    if (!multiple) {
      return selectedOptions[0]?.label || placeholder;
    }

    return `已选择 ${selectedValues.length} 项`;
  }, [selectedValues, selectedOptions, placeholder, multiple]);

  return (
    <div className="space-y-2">
      <Select
        value={multiple ? "" : selectedValues[0] || ""}
        onValueChange={handleSelect}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={displayText} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {multiple && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sortedSelectedOptions.map(option => (
            <div
              key={option.value}
              className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-md text-sm"
            >
              <span>{option.label}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-primary/20"
                onClick={() => handleRemove(option.value)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
