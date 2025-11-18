"use client";

import * as React from "react";
import { X } from "lucide-react";

interface ScheduleDemoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleDemoDialog({ open, onOpenChange }: ScheduleDemoDialogProps) {
  const calendarUrl = "https://cal.com/grayoj/30min";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50 bg-background/80 backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-border">
          <h2 className="text-2xl sm:text-3xl font-bold font-display mb-2">Schedule a Demo</h2>
          <p className="text-muted-foreground">
            See how Largence can transform your legal operations. Choose a time that works for you.
          </p>
        </div>

        {/* Embedded Calendar */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={calendarUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            className="w-full h-full min-h-[600px]"
            title="Schedule a demo with Largence"
          />
        </div>
      </div>
    </div>
  );
}
