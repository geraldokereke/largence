"use client"

import { Input } from "@largence/components/ui/input"
import { Label } from "@largence/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@largence/components/ui/select"

interface BasicInfoStepProps {
  formData: {
    documentName: string
    jurisdiction: string
    industry: string
    startDate: string
    duration: string
  }
  jurisdictions: string[]
  industries: string[]
  onUpdate: (field: string, value: string) => void
}

export function BasicInfoStep({ formData, jurisdictions, industries, onUpdate }: BasicInfoStepProps) {
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
          <Label htmlFor="documentName">Document Name</Label>
          <Input
            id="documentName"
            placeholder="e.g., Senior Developer Employment Contract"
            className="h-10 rounded-sm mt-1.5"
            value={formData.documentName}
            onChange={(e) => onUpdate("documentName", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="jurisdiction">Jurisdiction</Label>
            <Select
              value={formData.jurisdiction}
              onValueChange={(value) => onUpdate("jurisdiction", value)}
            >
              <SelectTrigger className="h-10 rounded-sm mt-1.5">
                <SelectValue placeholder="Select jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                {jurisdictions.map((jurisdiction) => (
                  <SelectItem key={jurisdiction} value={jurisdiction}>
                    {jurisdiction}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="industry">Industry</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) => onUpdate("industry", value)}
            >
              <SelectTrigger className="h-10 rounded-sm mt-1.5">
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
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              className="h-10 rounded-sm mt-1.5"
              value={formData.startDate}
              onChange={(e) => onUpdate("startDate", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              placeholder="e.g., 12 months, 2 years"
              className="h-10 rounded-sm mt-1.5"
              value={formData.duration}
              onChange={(e) => onUpdate("duration", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
