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
import { useOrganization } from "@clerk/nextjs"

interface PartyDetailsStepProps {
  formData: {
    partyName: string
    partyEmail: string
    party2Name: string
    party2Email: string
    compensationType: string
    compensationAmount: string
  }
  onUpdate: (field: string, value: string) => void
  errors?: {
    partyName?: string
    party2Name?: string
  }
}

// Currency mapping based on country
const getCurrencySymbol = (country: string): string => {
  const currencyMap: Record<string, string> = {
    "Nigeria": "₦",
    "Ghana": "GH₵",
    "Kenya": "KSh",
    "South Africa": "R",
    "Egypt": "E£",
    "Tanzania": "TSh",
    "United Kingdom": "£",
    "Uganda": "USh",
    "Rwanda": "FRw",
    "Ethiopia": "Br",
    "Côte d'Ivoire": "CFA",
  };
  return currencyMap[country] || "$";
};

export function PartyDetailsStep({ formData, onUpdate, errors }: PartyDetailsStepProps) {
  const { organization } = useOrganization();
  const country = (organization?.publicMetadata?.country as string) || "";
  const currencySymbol = getCurrencySymbol(country);
  const formatAmount = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/[^0-9]/g, '')
    if (!numbers) return ''
    // Format with commas
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value)
    onUpdate('compensationAmount', formatted)
  }

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
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            First Party
          </div>
          <div>
            <Label htmlFor="partyName">Full Legal Name <span className="text-destructive">*</span></Label>
            <Input
              id="partyName"
              placeholder="e.g., John Doe, ABC Company Ltd"
              className={`h-10 rounded-sm mt-1.5 ${errors?.partyName ? 'border-destructive' : ''}`}
              value={formData.partyName}
              onChange={(e) => onUpdate("partyName", e.target.value)}
            />
            {errors?.partyName && (
              <p className="text-sm text-destructive mt-1">{errors.partyName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="partyEmail">Email Address (Optional)</Label>
            <Input
              id="partyEmail"
              type="email"
              placeholder="email@example.com"
              className="h-10 rounded-sm mt-1.5"
              value={formData.partyEmail}
              onChange={(e) => onUpdate("partyEmail", e.target.value)}
            />
          </div>
        </div>

        <div className="h-px bg-border my-6" />

        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Second Party
          </div>
          <div>
            <Label htmlFor="party2Name">Full Legal Name <span className="text-destructive">*</span></Label>
            <Input
              id="party2Name"
              placeholder="e.g., XYZ Corporation, Jane Smith"
              className={`h-10 rounded-sm mt-1.5 ${errors?.party2Name ? 'border-destructive' : ''}`}
              value={formData.party2Name}
              onChange={(e) => onUpdate("party2Name", e.target.value)}
            />
            {errors?.party2Name && (
              <p className="text-sm text-destructive mt-1">{errors.party2Name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="party2Email">Email Address (Optional)</Label>
            <Input
              id="party2Email"
              type="email"
              placeholder="email@example.com"
              className="h-10 rounded-sm mt-1.5"
              value={formData.party2Email}
              onChange={(e) => onUpdate("party2Email", e.target.value)}
            />
          </div>
        </div>

        <div className="h-px bg-border my-6" />

        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Compensation Terms (Optional)
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
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                {currencySymbol}
              </span>
              <Input
                id="compensationAmount"
                placeholder="5,000"
                className="h-10 rounded-sm pl-10"
                value={formData.compensationAmount}
                onChange={handleAmountChange}
              />
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
