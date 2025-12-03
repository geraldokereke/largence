"use client";

import { motion } from "framer-motion";
import { Briefcase, Shield, Building2, Check } from "lucide-react";
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
    desc: "Drafting, negotiation, and lifecycle management of legal agreements",
  },
  {
    id: "compliance",
    icon: Shield,
    label: "Compliance & Risk",
    desc: "Regulatory compliance tracking and risk assessment workflows",
  },
  {
    id: "governance",
    icon: Building2,
    label: "Corporate Governance",
    desc: "Board resolutions, policies, and corporate document management",
  },
];

export function UseCaseStep({ formData, updateFormData }: UseCaseStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div>
          <Label>What will you primarily use Largence for?</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Select your main focus area
          </p>
        </div>
        <div className="space-y-3">
          {useCases.map((useCase) => (
            <button
              key={useCase.id}
              onClick={() => updateFormData({ useCase: useCase.id })}
              className={`w-full p-4 rounded-sm border-2 transition-all text-left ${
                formData.useCase === useCase.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div
                  className={`p-2 rounded-sm ${
                    formData.useCase === useCase.id
                      ? "bg-primary/10"
                      : "bg-muted"
                  }`}
                >
                  <useCase.icon
                    className={`h-5 w-5 ${
                      formData.useCase === useCase.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                {formData.useCase === useCase.id && (
                  <Check className="h-5 w-5 text-primary shrink-0" />
                )}
              </div>
              <p className="text-sm font-medium mb-1">{useCase.label}</p>
              <p className="text-xs text-muted-foreground">{useCase.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
