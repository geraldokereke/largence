"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@largence/lib/utils";
import { Button } from "@largence/components/ui/button";
import { Calendar } from "@largence/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@largence/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disablePast?: boolean;
  minDate?: Date;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  disablePast = true,
  minDate,
}: DatePickerProps) {
  // Calculate the minimum selectable date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const effectiveMinDate = minDate || (disablePast ? today : undefined);
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-9 rounded-sm justify-start text-left font-normal text-sm overflow-hidden",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{date ? format(date, "PPP") : placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          disabled={effectiveMinDate ? { before: effectiveMinDate } : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
