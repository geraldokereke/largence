"use client";

import { motion } from "framer-motion";
import { Globe, Check } from "lucide-react";
import { Label } from "@largence/components/ui/label";
import type { OnboardingFormData } from "@largence/hooks/use-onboarding";

interface DataResidencyStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
}

const dataRegions = [
  {
    id: "us",
    label: "United States",
    desc: "Data stored in US-based data centers",
    flag: "US",
  },
  {
    id: "eu",
    label: "European Union",
    desc: "GDPR-compliant EU data centers",
    flag: "EU",
  },
  {
    id: "uk",
    label: "United Kingdom",
    desc: "UK-based data centers",
    flag: "GB",
  },
  {
    id: "ca",
    label: "Canada",
    desc: "Canadian data residency compliance",
    flag: "CA",
  },
  {
    id: "ap",
    label: "Asia Pacific",
    desc: "APAC region data centers",
    flag: "SG",
  },
  {
    id: "au",
    label: "Australia",
    desc: "Australian data sovereignty compliance",
    flag: "AU",
  },
];

export function DataResidencyStep({
  formData,
  updateFormData,
}: DataResidencyStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="space-y-3">
        <div>
          <Label>Where should your data be stored?</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Choose the region closest to your operations for optimal performance
            and compliance
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {dataRegions.map((region) => (
            <button
              key={region.id}
              onClick={() => updateFormData({ dataRegion: region.id })}
              className={`p-3 rounded-sm border-2 transition-all text-left h-full flex flex-col ${
                formData.dataRegion === region.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div
                  className={`p-1.5 rounded-sm ${
                    formData.dataRegion === region.id
                      ? "bg-primary/10"
                      : "bg-muted"
                  }`}
                >
                  <Globe
                    className={`h-4 w-4 ${
                      formData.dataRegion === region.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                {formData.dataRegion === region.id && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </div>
              <p className="text-sm font-medium mb-0.5">{region.label}</p>
              <p className="text-[11px] text-muted-foreground leading-tight flex-1">
                {region.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
