"use client";

import * as React from "react";
import { Input } from "@largence/components/ui/input";
import { Label } from "@largence/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@largence/components/ui/select";
import { CountryCombobox } from "@largence/components/ui/country-combobox";
import { DatePicker } from "@largence/components/ui/date-picker";
import { format } from "date-fns";

interface BasicInfoStepProps {
  formData: {
    documentName: string;
    jurisdiction: string;
    industry: string;
    startDate: string;
    endDate: string;
    duration: string;
  };
  jurisdictions: string[];
  industries: string[];
  onUpdate: (field: string, value: string) => void;
  errors?: {
    documentName?: string;
    jurisdiction?: string;
    industry?: string;
    startDate?: string;
  };
}

export function BasicInfoStep({
  formData,
  jurisdictions,
  industries,
  onUpdate,
  errors,
}: BasicInfoStepProps) {
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      onUpdate("startDate", format(date, "yyyy-MM-dd"));
    } else {
      onUpdate("startDate", "");
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      onUpdate("endDate", format(date, "yyyy-MM-dd"));
    } else {
      onUpdate("endDate", "");
    }
  };

  // Calculate duration between start and end date
  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return "";

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end <= start) return "Invalid date range";

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;

    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
    if (days > 0 && years === 0)
      parts.push(`${days} day${days > 1 ? "s" : ""}`);

    return parts.join(", ") || "Less than a day";
  };

  const selectedDate = formData.startDate
    ? new Date(formData.startDate)
    : undefined;
  const selectedEndDate = formData.endDate
    ? new Date(formData.endDate)
    : undefined;
  const calculatedDuration = calculateDuration();

  // Update duration field when dates change
  React.useEffect(() => {
    if (
      calculatedDuration &&
      calculatedDuration !== "Invalid date range" &&
      calculatedDuration !== ""
    ) {
      onUpdate("duration", calculatedDuration);
    }
  }, [formData.startDate, formData.endDate]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 font-title">
          Basic Information
        </h2>
        <p className="text-muted-foreground">
          Provide the essential details for your document
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="documentName">
            Document Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="documentName"
            placeholder="e.g., Senior Developer Employment Contract"
            className={`h-10 rounded-sm mt-1.5 ${errors?.documentName ? "border-destructive" : ""}`}
            value={formData.documentName}
            onChange={(e) => onUpdate("documentName", e.target.value)}
          />
          {errors?.documentName && (
            <p className="text-sm text-destructive mt-1">
              {errors.documentName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="jurisdiction">
              Jurisdiction <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1.5">
              <CountryCombobox
                value={formData.jurisdiction.toLowerCase().replace(/ /g, "-")}
                onValueChange={(value) => {
                  const country = value
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
                  onUpdate("jurisdiction", country);
                }}
                placeholder="Select jurisdiction"
              />
            </div>
            {errors?.jurisdiction && (
              <p className="text-sm text-destructive mt-1">
                {errors.jurisdiction}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="industry">
              Industry <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.industry}
              onValueChange={(value) => onUpdate("industry", value)}
            >
              <SelectTrigger
                className={`h-10 rounded-sm mt-1.5 ${errors?.industry ? "border-destructive" : ""}`}
              >
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.industry && (
              <p className="text-sm text-destructive mt-1">{errors.industry}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="startDate">
              Start Date <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1.5">
              <DatePicker
                date={selectedDate}
                onDateChange={handleDateChange}
                placeholder="Select start date"
                className={errors?.startDate ? "border-destructive" : ""}
              />
            </div>
            {errors?.startDate && (
              <p className="text-sm text-destructive mt-1">
                {errors.startDate}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <div className="mt-1.5">
              <DatePicker
                date={selectedEndDate}
                onDateChange={handleEndDateChange}
                placeholder="Select end date"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              placeholder="- - -"
              className="h-10 rounded-sm mt-1.5 bg-muted"
              value={calculatedDuration}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}
