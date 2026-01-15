"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@largence/components/ui/button";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@largence/lib/utils";

export interface WalkthroughStep {
  target: string; // CSS selector for the target element
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  spotlight?: boolean; // Whether to highlight the target element
  action?: "click" | "hover" | "none"; // Action hint for the user
}

interface WalkthroughProps {
  steps: WalkthroughStep[];
  onComplete: () => void;
  onSkip?: () => void;
  storageKey?: string;
  showOnce?: boolean;
}

const POSITIONS = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-3",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-3",
  left: "right-full top-1/2 -translate-y-1/2 mr-3",
  right: "left-full top-1/2 -translate-y-1/2 ml-3",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

const ARROW_POSITIONS = {
  top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-background",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-background",
  left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-background",
  right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-background",
  center: "hidden",
};

export function InteractiveWalkthrough({
  steps,
  onComplete,
  onSkip,
  storageKey,
  showOnce = true,
}: WalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Check if walkthrough should be shown
  useEffect(() => {
    setMounted(true);
    if (storageKey && showOnce) {
      const hasCompleted = localStorage.getItem(storageKey);
      if (hasCompleted) return;
    }
    // Small delay to allow page to render
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [storageKey, showOnce]);

  // Find and position relative to target element
  const updateTargetPosition = useCallback(() => {
    if (!isVisible || currentStep >= steps.length) return;

    const step = steps[currentStep];
    const target = document.querySelector(step.target);

    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);

      // Scroll target into view if needed
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setTargetRect(null);
    }
  }, [currentStep, steps, isVisible]);

  useEffect(() => {
    updateTargetPosition();
    
    // Update on resize/scroll
    window.addEventListener("resize", updateTargetPosition);
    window.addEventListener("scroll", updateTargetPosition, true);
    
    return () => {
      window.removeEventListener("resize", updateTargetPosition);
      window.removeEventListener("scroll", updateTargetPosition, true);
    };
  }, [updateTargetPosition]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, "true");
    }
    setIsVisible(false);
    onComplete();
  }, [storageKey, onComplete]);

  const handleSkip = useCallback(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, "true");
    }
    setIsVisible(false);
    onSkip?.();
  }, [storageKey, onSkip]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      if (e.key === "ArrowRight" || e.key === "Enter") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "Escape") {
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, handleNext, handlePrevious, handleSkip]);

  if (!mounted || !isVisible || currentStep >= steps.length) return null;

  const step = steps[currentStep];
  const position = step.position || "bottom";
  const hasTarget = targetRect !== null;

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect || position === "center") {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = targetRect.top - tooltipHeight - padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - padding;
        break;
      case "right":
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + padding;
        break;
    }

    // Keep tooltip in viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < padding) left = padding;
    if (left + tooltipWidth > viewportWidth - padding) {
      left = viewportWidth - tooltipWidth - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipHeight > viewportHeight - padding) {
      top = viewportHeight - tooltipHeight - padding;
    }

    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
    };
  };

  // Create spotlight overlay
  const renderSpotlight = () => {
    if (!step.spotlight || !targetRect) return null;

    const padding = 8;
    const spotlightRect = {
      top: targetRect.top - padding,
      left: targetRect.left - padding,
      width: targetRect.width + padding * 2,
      height: targetRect.height + padding * 2,
    };

    return (
      <>
        {/* Dark overlay with cutout */}
        <div
          className="fixed inset-0 z-[9998] pointer-events-none"
          style={{
            background: `
              linear-gradient(to bottom, 
                rgba(0,0,0,0.7) 0%, 
                rgba(0,0,0,0.7) ${spotlightRect.top}px, 
                transparent ${spotlightRect.top}px, 
                transparent ${spotlightRect.top + spotlightRect.height}px, 
                rgba(0,0,0,0.7) ${spotlightRect.top + spotlightRect.height}px
              ),
              linear-gradient(to right, 
                rgba(0,0,0,0.7) 0%, 
                rgba(0,0,0,0.7) ${spotlightRect.left}px, 
                transparent ${spotlightRect.left}px, 
                transparent ${spotlightRect.left + spotlightRect.width}px, 
                rgba(0,0,0,0.7) ${spotlightRect.left + spotlightRect.width}px
              )
            `,
            backgroundBlendMode: "multiply",
          }}
        />
        {/* Spotlight border */}
        <div
          className="fixed z-[9998] border-2 border-primary rounded-md pointer-events-none ring-4 ring-primary/20 animate-pulse"
          style={{
            top: `${spotlightRect.top}px`,
            left: `${spotlightRect.left}px`,
            width: `${spotlightRect.width}px`,
            height: `${spotlightRect.height}px`,
          }}
        />
      </>
    );
  };

  const content = createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[9997] transition-opacity duration-300",
          step.spotlight ? "bg-transparent" : "bg-black/50"
        )}
        onClick={handleSkip}
      />

      {/* Spotlight */}
      {renderSpotlight()}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] w-80 bg-background border rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95 duration-200"
        style={getTooltipStyle()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-sm">{step.title}</span>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.content}
          </p>

          {step.action && step.action !== "none" && (
            <div className="mt-3 flex items-center gap-2 text-xs text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {step.action === "click" && "Click on the highlighted area to continue"}
              {step.action === "hover" && "Hover over the highlighted area"}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t bg-muted/30 gap-2">
          <div className="flex items-center gap-1 flex-shrink-0">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                    ? "bg-primary/40"
                    : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {currentStep > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePrevious}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="h-7 px-3 text-xs"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-0.5" />
                  Done
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Step counter */}
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-full border">
          {currentStep + 1} of {steps.length}
        </div>
      </div>
    </>,
    document.body
  );

  return content;
}

// Comprehensive app-wide walkthrough - covers entire application in one tour
export const APP_WALKTHROUGH_STEPS: WalkthroughStep[] = [
  // Welcome
  {
    target: '[data-walkthrough="sidebar"]',
    title: "Welcome to Largence",
    content: "Let's take a quick tour of your AI-powered legal document platform. This will only take a minute.",
    position: "right",
    spotlight: true,
  },
  // Navigation - Home
  {
    target: '[data-walkthrough="sidebar"]',
    title: "Navigation Sidebar",
    content: "This is your main navigation. Access all features from here. The sidebar can be collapsed for more workspace.",
    position: "right",
    spotlight: true,
  },
  // Documents
  {
    target: '[data-walkthrough="documents-nav"]',
    title: "Documents",
    content: "Your document hub. Create, edit, and manage all legal documents. Use AI to generate contracts, agreements, and more in seconds.",
    position: "right",
    spotlight: true,
  },
  // Matters
  {
    target: '[data-walkthrough="matters-nav"]',
    title: "Matters",
    content: "Organize work by matters (cases/projects). Link documents, track billable time, manage client contacts, and monitor progress.",
    position: "right",
    spotlight: true,
  },
  // Messages
  {
    target: '[data-walkthrough="messages-nav"]',
    title: "Messages",
    content: "Team communication channels. Discuss documents, collaborate on matters, and share files with your team in real-time.",
    position: "right",
    spotlight: true,
  },
  // Compliance
  {
    target: '[data-walkthrough="compliance-nav"]',
    title: "Compliance Checks",
    content: "AI-powered compliance analysis. Automatically check documents against regulatory requirements for your industry and jurisdiction.",
    position: "right",
    spotlight: true,
  },
  // Templates
  {
    target: '[data-walkthrough="templates-nav"]',
    title: "Templates Library",
    content: "Browse pre-built legal templates or create your own. Access community templates and save time on repetitive documents.",
    position: "right",
    spotlight: true,
  },
  // Quick Actions - Search
  {
    target: '[data-walkthrough="search"]',
    title: "Global Search",
    content: "Find anything instantly. Search documents, matters, contacts, and more. Press Cmd+K (or Ctrl+K) for quick access.",
    position: "bottom",
    spotlight: true,
  },
  // Quick Actions - Create
  {
    target: '[data-walkthrough="create-document"]',
    title: "Quick Create",
    content: "Create new documents with one click. Choose AI generation, templates, or start from scratch.",
    position: "bottom",
    spotlight: true,
  },
  // New Document in sidebar
  {
    target: '[data-walkthrough="new-document-btn"]',
    title: "New Document",
    content: "Another quick way to create documents. This button is always accessible in the sidebar.",
    position: "top",
    spotlight: true,
  },
  // User Menu
  {
    target: '[data-walkthrough="user-menu"]',
    title: "Your Account",
    content: "Access profile settings, organization management, billing, integrations (DocuSign, Google Drive, etc.), and sign out.",
    position: "left",
    spotlight: true,
  },
  // Final
  {
    target: '[data-walkthrough="sidebar"]',
    title: "You're All Set",
    content: "That's the basics. Start by creating your first document or exploring the templates. Need help? Check the Help section anytime.",
    position: "right",
    spotlight: true,
  },
];
