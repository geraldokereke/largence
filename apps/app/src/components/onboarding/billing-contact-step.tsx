"use client";

import { motion } from "framer-motion";
import { Mail, Phone, CreditCard } from "lucide-react";
import { Input } from "@largence/components/ui/input";
import { Label } from "@largence/components/ui/label";
import type { OnboardingFormData } from "@largence/hooks/use-onboarding";

interface BillingContactStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
}

export function BillingContactStep({
  formData,
  updateFormData,
}: BillingContactStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-medium mb-1">Billing & Contact</h3>
        <p className="text-sm text-muted-foreground">
          Where should we send invoices and important updates?
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="billingEmail">Billing Email *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="billingEmail"
            type="email"
            placeholder="billing@example.com"
            value={formData.billingEmail}
            onChange={(e) => updateFormData({ billingEmail: e.target.value })}
            className="h-10 rounded-sm pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Invoices and receipts will be sent here
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            className="h-10 rounded-sm pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Optional - for important account notifications
        </p>
      </div>

      <div className="p-4 bg-muted/50 rounded-sm border">
        <div className="flex items-start gap-3">
          <CreditCard className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium">Payment information</p>
            <p className="text-xs text-muted-foreground mt-1">
              You can add payment methods and manage your subscription after
              completing setup
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
