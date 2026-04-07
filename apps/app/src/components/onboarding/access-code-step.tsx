"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@largence/components/ui/input";
import { Label } from "@largence/components/ui/label";
import { Button } from "@largence/components/ui/button";
import { Spinner } from "@largence/components/ui/spinner";
import { Sparkles, Check, AlertCircle } from "lucide-react";

interface AccessCodeStepProps {
  accessCode: string;
  onAccessCodeChange: (code: string) => void;
}

export function AccessCodeStep({
  accessCode,
  onAccessCodeChange,
}: AccessCodeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="space-y-3">
        <div>
          <Label>Access Code</Label>
          <p className="text-sm text-muted-foreground mt-1">
            If you have an access code, enter it below to unlock full access to
            Largence with your trial.
          </p>
        </div>

        <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-sm">
          <div className="p-1.5 bg-primary/10 rounded-sm shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">What does an access code do?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Access codes unlock Pro features including AI-powered drafting,
              compliance checks, e-signatures, and more — with up to 10 AI
              requests per day.
            </p>
          </div>
        </div>

        <Input
          placeholder="e.g. LARGENCE-BETA-2026"
          value={accessCode}
          onChange={(e) => onAccessCodeChange(e.target.value.toUpperCase())}
          className="font-mono tracking-wider"
        />
      </div>

      <div className="flex items-center gap-2 p-2.5 bg-muted/50 border border-border rounded-sm">
        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">
          Don't have a code? No worries — you can skip this step and redeem one
          later from your dashboard or account settings.
        </p>
      </div>
    </motion.div>
  );
}
