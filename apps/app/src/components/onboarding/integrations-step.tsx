"use client";

import { motion } from "framer-motion";
import { Label } from "@largence/components/ui/label";
import { Clock, Bell } from "lucide-react";
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
      {/* Coming Soon Banner */}
      <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-sm">
        <div className="p-2 bg-primary/10 rounded-sm">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">Integrations Coming Soon</p>
          <p className="text-xs text-muted-foreground">
            We're working hard to bring you powerful integrations. Select your favorites below to be notified when they launch!
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Which integrations interest you?</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Select all that apply — we'll notify you when they're available
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {availableIntegrations.map((integration) => {
            const Icon = integration.icon;
            const isSelected = formData.integrations.includes(integration.id);
            return (
              <button
                key={integration.id}
                onClick={() => toggleIntegration(integration.id)}
                className={`p-4 rounded-sm border-2 transition-all text-left relative ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {/* Coming Soon Badge */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-medium text-amber-600">
                  Soon
                </div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`p-2 rounded-sm ${
                      isSelected
                        ? "bg-primary/10"
                        : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isSelected
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  {isSelected && (
                    <Bell className="h-4 w-4 text-primary shrink-0 mt-1" />
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

      {formData.integrations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-sm"
        >
          <Bell className="h-4 w-4 text-emerald-600" />
          <p className="text-xs text-emerald-700">
            Great! You'll be notified when {formData.integrations.length === 1 ? 'this integration is' : 'these integrations are'} available.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
