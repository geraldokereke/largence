"use client";

import { motion } from "framer-motion";
import { 
  Briefcase, 
  Shield, 
  Building2, 
  Check, 
  FileText, 
  Scale, 
  Users, 
  Landmark,
  Gavel,
  FileSignature
} from "lucide-react";
import { Label } from "@largence/components/ui/label";
import type { OnboardingFormData } from "@largence/hooks/use-onboarding";

interface UseCaseStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
}

const useCases = [
  {
    id: "contracts",
    icon: Briefcase,
    label: "Contract Management",
    desc: "Drafting, negotiation, and lifecycle management",
  },
  {
    id: "compliance",
    icon: Shield,
    label: "Compliance & Risk",
    desc: "Regulatory compliance and risk assessment",
  },
  {
    id: "governance",
    icon: Building2,
    label: "Corporate Governance",
    desc: "Board resolutions and corporate documents",
  },
  {
    id: "litigation",
    icon: Gavel,
    label: "Litigation Support",
    desc: "Case management and legal filings",
  },
  {
    id: "ip",
    icon: FileSignature,
    label: "Intellectual Property",
    desc: "IP agreements, patents, and trademarks",
  },
  {
    id: "employment",
    icon: Users,
    label: "Employment & HR",
    desc: "Employment contracts and HR policies",
  },
  {
    id: "real-estate",
    icon: Landmark,
    label: "Real Estate",
    desc: "Lease agreements and property documents",
  },
  {
    id: "general",
    icon: FileText,
    label: "General Legal Work",
    desc: "Multiple practice areas and document types",
  },
];

export function UseCaseStep({ formData, updateFormData }: UseCaseStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="space-y-3">
        <div>
          <Label>What will you primarily use Largence for?</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Select your main focus area
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {useCases.map((useCase) => (
            <button
              key={useCase.id}
              onClick={() => updateFormData({ useCase: useCase.id })}
              className={`p-3 rounded-sm border-2 transition-all text-left h-full flex flex-col ${
                formData.useCase === useCase.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div
                  className={`p-1.5 rounded-sm ${
                    formData.useCase === useCase.id
                      ? "bg-primary/10"
                      : "bg-muted"
                  }`}
                >
                  <useCase.icon
                    className={`h-4 w-4 ${
                      formData.useCase === useCase.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                {formData.useCase === useCase.id && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </div>
              <p className="text-sm font-medium mb-0.5">{useCase.label}</p>
              <p className="text-[11px] text-muted-foreground leading-tight flex-1">{useCase.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
