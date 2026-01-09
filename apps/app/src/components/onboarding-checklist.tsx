"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser, useOrganization } from "@clerk/nextjs";
import { Button } from "@largence/components/ui/button";
import { Progress } from "@largence/components/ui/progress";
import {
  Check,
  ChevronRight,
  FileText,
  ShieldCheck,
  Users,
  Sparkles,
  X,
  Lightbulb,
  ArrowRight,
  Rocket,
  PartyPopper,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  tip: string;
  icon: React.ElementType;
  action: string;
  path: string;
  checkKey: string;
}

const checklistItems: ChecklistItem[] = [
  {
    id: "create-document",
    title: "Create your first document",
    description: "Generate an AI-powered legal document tailored to your needs",
    tip: "Pro tip: Start with a simple NDA or employment contract to see how the AI adapts to your industry.",
    icon: FileText,
    action: "Create Document",
    path: "/create",
    checkKey: "onboarding:created_document",
  },
  {
    id: "run-compliance",
    title: "Run a compliance check",
    description: "Analyze a document for regulatory compliance issues",
    tip: "Pro tip: Upload an existing contract to see how our AI identifies potential compliance gaps.",
    icon: ShieldCheck,
    action: "Check Compliance",
    path: "/compliance",
    checkKey: "onboarding:ran_compliance",
  },
  {
    id: "invite-team",
    title: "Invite your team",
    description: "Collaborate with colleagues on legal documents",
    tip: "Pro tip: Team members can review, comment, and collaborate on documents in real-time.",
    icon: Users,
    action: "Invite Members",
    path: "/teams",
    checkKey: "onboarding:invited_team",
  },
  {
    id: "explore-templates",
    title: "Explore templates",
    description: "Browse our library of industry-specific templates",
    tip: "Pro tip: Save time by customizing templates that match your most common document types.",
    icon: Sparkles,
    action: "Browse Templates",
    path: "/templates",
    checkKey: "onboarding:explored_templates",
  },
];

export function OnboardingChecklist() {
  const router = useRouter();
  const { user } = useUser();
  const { organization } = useOrganization();
  const [dismissed, setDismissed] = useState(false);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    setMounted(true);
    const isDismissed = localStorage.getItem("onboarding:checklist_dismissed");
    if (isDismissed === "true") {
      setDismissed(true);
      return;
    }

    // Check completed items
    const completed: string[] = [];
    checklistItems.forEach((item) => {
      if (localStorage.getItem(item.checkKey) === "true") {
        completed.push(item.id);
      }
    });
    setCompletedItems(completed);

    // Expand first incomplete item
    const firstIncomplete = checklistItems.find(
      (item) => !completed.includes(item.id)
    );
    if (firstIncomplete) {
      setExpandedItem(firstIncomplete.id);
    }
  }, []);

  // Check for completion celebration
  useEffect(() => {
    if (completedItems.length === checklistItems.length && !showCelebration) {
      const celebrated = localStorage.getItem("onboarding:celebrated");
      if (celebrated !== "true") {
        setShowCelebration(true);
        localStorage.setItem("onboarding:celebrated", "true");
      }
    }
  }, [completedItems, showCelebration]);

  const handleDismiss = () => {
    localStorage.setItem("onboarding:checklist_dismissed", "true");
    setDismissed(true);
  };

  const handleItemAction = (item: ChecklistItem) => {
    router.push(item.path);
  };

  const markAsComplete = (itemId: string) => {
    const item = checklistItems.find((i) => i.id === itemId);
    if (item) {
      localStorage.setItem(item.checkKey, "true");
      setCompletedItems((prev) => [...prev, itemId]);
      
      // Expand next incomplete item
      const nextIncomplete = checklistItems.find(
        (i) => !completedItems.includes(i.id) && i.id !== itemId
      );
      if (nextIncomplete) {
        setExpandedItem(nextIncomplete.id);
      }
    }
  };

  const progress = (completedItems.length / checklistItems.length) * 100;

  if (!mounted || dismissed) return null;

  // All completed - show celebration then dismiss
  if (showCelebration) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-linear-to-br from-emerald-500/10 via-primary/5 to-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 mb-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-sm">
              <PartyPopper className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold font-heading text-lg">
                You're all set! 🎉
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Great job completing the setup! You're ready to make the most of Largence.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-sm"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-4 ml-16">
          <Button
            size="sm"
            className="rounded-sm"
            onClick={() => router.push("/create")}
          >
            <Rocket className="h-4 w-4 mr-2" />
            Create Another Document
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-sm"
            onClick={handleDismiss}
          >
            Dismiss
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-xl p-6 mb-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="h-5 w-5 text-primary" />
            <h3 className="font-semibold font-heading">Getting Started</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete these steps to get the most out of Largence
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-sm text-muted-foreground hover:text-foreground"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            {completedItems.length} of {checklistItems.length} completed
          </span>
          <span className="text-xs font-medium text-primary">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {checklistItems.map((item, index) => {
          const isCompleted = completedItems.includes(item.id);
          const isExpanded = expandedItem === item.id;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.id}
              initial={false}
              animate={{
                backgroundColor: isExpanded ? "var(--accent)" : "transparent",
              }}
              className={`rounded-sm border transition-colors ${
                isCompleted
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : isExpanded
                  ? "border-primary/30"
                  : "border-transparent hover:border-border"
              }`}
            >
              <button
                onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                className="w-full p-3 flex items-center gap-3 text-left"
              >
                {/* Step Number / Check */}
                <div
                  className={`h-8 w-8 shrink-0 rounded-sm flex items-center justify-center text-sm font-medium transition-colors ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isCompleted ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    {item.title}
                  </p>
                  {!isExpanded && !isCompleted && (
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Expand Icon */}
                {!isCompleted && (
                  <ChevronRight
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                )}
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && !isCompleted && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pt-0 ml-11">
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.description}
                      </p>

                      {/* Tip */}
                      <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-sm mb-3">
                        <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">{item.tip}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="rounded-sm"
                          onClick={() => handleItemAction(item)}
                        >
                          {item.action}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-sm text-muted-foreground"
                          onClick={() => markAsComplete(item.id)}
                        >
                          Mark as done
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Skip All Link */}
      <div className="mt-4 pt-4 border-t text-center">
        <button
          onClick={handleDismiss}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          I already know my way around — skip this
        </button>
      </div>
    </motion.div>
  );
}

// Hook to mark checklist items complete from other parts of the app
export function useOnboardingProgress() {
  const markComplete = (itemId: string) => {
    const item = checklistItems.find((i) => i.id === itemId);
    if (item) {
      localStorage.setItem(item.checkKey, "true");
      // Dispatch custom event to update UI
      window.dispatchEvent(new CustomEvent("onboarding:progress"));
    }
  };

  return { markComplete };
}
