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

interface PartyDetailsStepProps {
  formData: {
    partyName: string
    partyEmail: string
    compensationType: string
    compensationAmount: string
  }
  onUpdate: (field: string, value: string) => void
}

export function PartyDetailsStep({ formData, onUpdate }: PartyDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 font-title">
          Party Details
        </h2>
        <p className="text-muted-foreground">
          Enter information about the parties involved
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="partyName">Party Name</Label>
          <Input
            id="partyName"
            placeholder="Full legal name"
            className="h-10 rounded-sm mt-1.5"
            value={formData.partyName}
            onChange={(e) => onUpdate("partyName", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="partyEmail">Party Email</Label>
          <Input
            id="partyEmail"
            type="email"
            placeholder="email@example.com"
            className="h-10 rounded-sm mt-1.5"
            value={formData.partyEmail}
            onChange={(e) => onUpdate("partyEmail", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="compensationType">Compensation Type</Label>
            <Select
              value={formData.compensationType}
              onValueChange={(value) => onUpdate("compensationType", value)}
            >
              <SelectTrigger className="h-10 rounded-sm mt-1.5">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly Salary</SelectItem>
                <SelectItem value="annual">Annual Salary</SelectItem>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
                <SelectItem value="fixed">Fixed Fee</SelectItem>
                <SelectItem value="commission">Commission Based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="compensationAmount">Amount</Label>
            <Input
              id="compensationAmount"
              placeholder="e.g., $5,000, ₦500,000"
              className="h-10 rounded-sm mt-1.5"
              value={formData.compensationAmount}
              onChange={(e) => onUpdate("compensationAmount", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
