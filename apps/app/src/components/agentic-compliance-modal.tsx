"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@largence/components/ui/dialog";
import { Button } from "@largence/components/ui/button";
import { Sparkles, Zap, ShieldCheck, FileEdit } from "lucide-react";

interface AgenticComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

const STORAGE_KEY = "largence:agentic-compliance-intro-seen";

export function AgenticComplianceModal({
  isOpen,
  onClose,
  onProceed,
}: AgenticComplianceModalProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if user has seen the intro modal before
    const hasSeenIntro = localStorage.getItem(STORAGE_KEY);
    setShouldShow(!hasSeenIntro);
  }, []);

  const handleProceed = () => {
    // Mark as seen so it never shows again
    localStorage.setItem(STORAGE_KEY, "true");
    setShouldShow(false);
    onProceed();
  };

  const handleClose = () => {
    onClose();
  };

  // If user has already seen the intro, don't show the modal
  // Instead, directly proceed with the agentic compliance
  useEffect(() => {
    if (isOpen && !shouldShow) {
      onProceed();
    }
  }, [isOpen, shouldShow, onProceed]);

  // Only render if user hasn't seen intro before
  if (!shouldShow) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              Introducing Agentic Compliance
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Let AI automatically fix compliance issues in your document in
            real-time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Intelligent Analysis</h4>
              <p className="text-sm text-muted-foreground">
                AI analyzes your document for compliance issues based on your
                jurisdiction and document type.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10">
              <FileEdit className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Live Editing</h4>
              <p className="text-sm text-muted-foreground">
                Watch as AI streams corrections directly into your editor,
                fixing issues as it goes.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
              <Zap className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Instant Results</h4>
              <p className="text-sm text-muted-foreground">
                Your document is updated in real-time with compliant language
                and required clauses.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Agentic
            Compliance will modify your document directly. You can always use
            Undo (Ctrl+Z) to revert changes, or save a copy before proceeding.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleProceed} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Start Agentic Compliance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useAgenticComplianceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(
    null,
  );

  const openModal = (onProceedCallback: () => void) => {
    // Check if user has seen the intro
    const hasSeenIntro = localStorage.getItem(STORAGE_KEY);
    if (hasSeenIntro) {
      // Skip modal, directly run the callback
      onProceedCallback();
    } else {
      setPendingCallback(() => onProceedCallback);
      setIsOpen(true);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setPendingCallback(null);
  };

  const handleProceed = () => {
    setIsOpen(false);
    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
  };

  return {
    isOpen,
    openModal,
    closeModal,
    handleProceed,
  };
}
