"use client";

import { motion } from "framer-motion";
import { Users, Mail, Phone } from "lucide-react";
import { Input } from "@largence/components/ui/input";
import { Label } from "@largence/components/ui/label";
import type { OnboardingFormData } from "@largence/hooks/use-onboarding";

interface TeamSizeStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
}

const teamSizes = ["1-10", "11-50", "51-200", "200+"];

export function TeamSizeStep({ formData, updateFormData }: TeamSizeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <Label>How large is your team?</Label>
        <div className="grid grid-cols-2 gap-3">
          {teamSizes.map((size) => (
            <button
              key={size}
              onClick={() => updateFormData({ teamSize: size })}
              className={`p-4 rounded-sm border-2 transition-all ${
                formData.teamSize === size
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Users className="h-6 w-6 mb-2 mx-auto" />
              <p className="text-sm font-medium">{size} people</p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
