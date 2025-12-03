"use client";

import { motion } from "framer-motion";
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
import { Globe } from "lucide-react";
import type { OnboardingFormData } from "@largence/hooks/use-onboarding";

interface CompanyDetailsStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
}

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

export function CompanyDetailsStep({
  formData,
  updateFormData,
}: CompanyDetailsStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="companySize">Company Size *</Label>
        <Select
          value={formData.companySize}
          onValueChange={(value) => updateFormData({ companySize: value })}
        >
          <SelectTrigger className="h-10 rounded-sm">
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent>
            {companySizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Primary Country *</Label>
        <CountryCombobox
          value={formData.country?.toLowerCase().replace(/ /g, "-")}
          onValueChange={(value) => {
            const country = value
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
            updateFormData({ country });
          }}
          placeholder="Select your country"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Company Website</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="website"
            type="url"
            placeholder="https://example.com"
            value={formData.website}
            onChange={(e) => updateFormData({ website: e.target.value })}
            className="h-10 rounded-sm pl-10"
          />
        </div>
      </div>
    </motion.div>
  );
}
