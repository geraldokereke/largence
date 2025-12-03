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
import { LogoUpload } from "./logo-upload";
import type { OnboardingFormData } from "@largence/hooks/use-onboarding";

interface CompanyInfoStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
}

const industries = [
  "Technology",
  "Financial Services",
  "Healthcare",
  "Legal",
  "Manufacturing",
  "Retail",
  "Education",
  "Government",
  "Other",
];

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Australia",
  "Singapore",
  "Netherlands",
  "Other",
];

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

export function CompanyInfoStep({
  formData,
  updateFormData,
}: CompanyInfoStepProps) {
  // Generate subdomain slug from company name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const subdomain = formData.companyName
    ? generateSlug(formData.companyName)
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name *</Label>
        <Input
          id="companyName"
          placeholder="Acme Corporation"
          value={formData.companyName}
          onChange={(e) => updateFormData({ companyName: e.target.value })}
          className="h-10 rounded-sm"
        />
        {subdomain && (
          <p className="text-xs text-muted-foreground">
            Your workspace will be:{" "}
            <span className="font-medium text-foreground">{subdomain}</span>
            {/* TODO: Show subdomain URL once wildcard domain is configured */}
            {/* <span className="font-medium text-foreground">{subdomain}.largence.com</span> */}
          </p>
        )}
      </div>

      <LogoUpload
        value={formData.logoUrl}
        onChange={(url, file) =>
          updateFormData({ logoUrl: url, logoFile: file })
        }
      />

      <div className="space-y-2">
        <Label htmlFor="industry">Industry *</Label>
        <Select
          value={formData.industry}
          onValueChange={(value) => updateFormData({ industry: value })}
        >
          <SelectTrigger className="h-10 rounded-sm">
            <SelectValue placeholder="Select your industry" />
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
    </motion.div>
  );
}
