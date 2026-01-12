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
      className="space-y-4"
    >
      {/* Coming Soon Banner */}
      <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-sm">
        <div className="p-1 bg-amber-500/20 rounded-sm">
          <svg className="h-3.5 w-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-500">Integrations Coming Soon</p>
          <p className="text-[10px] text-amber-600/80 dark:text-amber-500/70">Select your preferences below to be notified when available</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label>Connect your favorite tools</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Select integrations to streamline your workflow
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-70 overflow-y-auto pr-1">
          {availableIntegrations.map((integration) => {
            const Icon = integration.icon;
            const isSelected = formData.integrations.includes(integration.id);
            return (
              <button
                key={integration.id}
                onClick={() => toggleIntegration(integration.id)}
                className={`p-3 rounded-sm border-2 transition-all text-left relative ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div
                    className={`p-1.5 rounded-sm ${
                      isSelected
                        ? "bg-primary/10"
                        : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isSelected
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-sm font-medium mb-0.5">{integration.name}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {integration.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {formData.integrations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-2.5 bg-primary/5 border border-primary/20 rounded-sm"
        >
          <Check className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs text-primary">
            {formData.integrations.length} integration{formData.integrations.length !== 1 ? 's' : ''} selected
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
