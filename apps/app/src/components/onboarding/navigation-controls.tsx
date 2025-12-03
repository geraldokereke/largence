"use client";

import { Button } from "@largence/components/ui/button";
import { Spinner } from "@largence/components/ui/spinner";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

interface NavigationControlsProps {
  step: number;
  totalSteps: number;
  canProceed: boolean;
  isCompleting: boolean;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
}

export function NavigationControls({
  step,
  totalSteps,
  canProceed,
  isCompleting,
  onNext,
  onBack,
  onComplete,
}: NavigationControlsProps) {
  return (
    <div className="flex justify-between pt-4">
      {step > 1 && (
        <Button variant="outline" onClick={onBack} disabled={isCompleting}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}

      <div className="ml-auto">
        {step < totalSteps ? (
          <Button onClick={onNext} disabled={!canProceed}>
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={onComplete} disabled={isCompleting}>
            {isCompleting ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Setting up...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Setup
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
