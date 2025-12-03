"use client";

import { motion } from "framer-motion";
import { Label } from "@largence/components/ui/label";
import { Check } from "lucide-react";
import { SiNotion, SiGoogledrive, SiDropbox, SiSlack } from "react-icons/si";
import { FaFileSignature, FaMicrosoft } from "react-icons/fa";
import type { OnboardingFormData } from "@largence/hooks/use-onboarding";

interface IntegrationsStepProps {
  formData: OnboardingFormData;
  toggleIntegration: (id: string) => void;
}

const availableIntegrations = [
  {
    id: "notion",
    name: "Notion",
    icon: SiNotion,
    description: "Sync documents to Notion",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    icon: SiGoogledrive,
    description: "Save to Google Drive",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    icon: SiDropbox,
    description: "Backup to Dropbox",
  },
  {
    id: "slack",
    name: "Slack",
    icon: SiSlack,
    description: "Notifications in Slack",
  },
  {
    id: "microsoft-365",
    name: "Microsoft 365",
    icon: FaMicrosoft,
    description: "Collaborate in Teams",
  },
  {
    id: "docusign",
    name: "DocuSign",
    icon: FaFileSignature,
    description: "E-signature integration",
  },
];

export function IntegrationsStep({
  formData,
  toggleIntegration,
}: IntegrationsStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div>
          <Label>Which apps would you like to integrate?</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Select all that apply
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {availableIntegrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <button
                key={integration.id}
                onClick={() => toggleIntegration(integration.id)}
                className={`p-4 rounded-sm border-2 transition-all text-left ${
                  formData.integrations.includes(integration.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`p-2 rounded-sm ${
                      formData.integrations.includes(integration.id)
                        ? "bg-primary/10"
                        : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        formData.integrations.includes(integration.id)
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  {formData.integrations.includes(integration.id) && (
                    <Check className="h-5 w-5 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-sm font-medium mb-1">{integration.name}</p>
                <p className="text-xs text-muted-foreground">
                  {integration.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
