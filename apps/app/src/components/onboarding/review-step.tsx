"use client";

import { motion } from "framer-motion";
import { Label } from "@largence/components/ui/label";
import { SiNotion, SiGoogledrive, SiDropbox, SiSlack } from "react-icons/si";
import { FaFileSignature, FaMicrosoft } from "react-icons/fa";
import type { OnboardingFormData } from "@largence/hooks/use-onboarding";

interface ReviewStepProps {
  formData: OnboardingFormData;
}

const integrations = [
  { id: "notion", name: "Notion", icon: SiNotion },
  { id: "google-drive", name: "Google Drive", icon: SiGoogledrive },
  { id: "dropbox", name: "Dropbox", icon: SiDropbox },
  { id: "slack", name: "Slack", icon: SiSlack },
  { id: "microsoft-365", name: "Microsoft 365", icon: FaMicrosoft },
  { id: "docusign", name: "DocuSign", icon: FaFileSignature },
];

export function ReviewStep({ formData }: ReviewStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <Label>Review your information</Label>
        <div className="rounded-sm border p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Company</span>
            <span className="text-sm font-medium">
              {formData.companyName || "Not set"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Industry</span>
            <span className="text-sm font-medium">
              {formData.industry || "Not set"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Company Size</span>
            <span className="text-sm font-medium">
              {formData.companySize || "Not set"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Country</span>
            <span className="text-sm font-medium">
              {formData.country || "Not set"}
            </span>
          </div>
          {formData.website && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Website</span>
              <span className="text-sm font-medium truncate max-w-[200px]">
                {formData.website}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Team Size</span>
            <span className="text-sm font-medium">
              {formData.teamSize || "Not set"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Billing Email</span>
            <span className="text-sm font-medium truncate max-w-[200px]">
              {formData.billingEmail || "Not set"}
            </span>
          </div>
          {formData.phone && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span className="text-sm font-medium">{formData.phone}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Primary Use Case
            </span>
            <span className="text-sm font-medium capitalize">
              {formData.useCase
                ? formData.useCase.replace(/-/g, " ")
                : "Not set"}
            </span>
          </div>
          {formData.integrations.length > 0 && (
            <div className="pt-2 border-t">
              <span className="text-sm text-muted-foreground block mb-2">
                Integrations
              </span>
              <div className="flex flex-wrap gap-2">
                {formData.integrations.map((id) => {
                  const integration = integrations.find((i) => i.id === id);
                  if (!integration) return null;
                  const Icon = integration.icon;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2 py-1.5 rounded-sm"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {integration.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
