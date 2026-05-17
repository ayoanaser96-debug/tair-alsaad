"use client";

import { format } from "date-fns";
import { CalendarRange } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DateRangePickerProps = {
  value?: DateRange;
  onChange?: (r: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  disabled,
  className,
}: DateRangePickerProps) {
  const label =
    value?.from && value?.to
      ? `${format(value.from, "LLL dd, y")} – ${format(value.to, "LLL dd, y")}`
      : value?.from
        ? format(value.from, "LLL dd, y")
        : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          disabled={disabled}
          className={cn("w-full justify-start text-left font-normal", !label && "text-muted-foreground", className)}
        >
          <CalendarRange className="mr-2 h-4 w-4" />
          {label ?? <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="range" defaultMonth={value?.from} selected={value} onSelect={onChange} numberOfMonths={2} />
      </PopoverContent>
    </Popover>
  );
}
