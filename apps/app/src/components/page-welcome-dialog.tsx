"use client";

import { useState, useEffect, ReactNode, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@largence/components/ui/dialog";
import { Button } from "@largence/components/ui/button";
import {
  FileText,
  Briefcase,
  MessageSquare,
  LayoutTemplate,
  ShieldCheck,
  Users,
  BarChart3,
  Home,
  Sparkles,
  Check,
  ArrowRight,
  LucideIcon,
} from "lucide-react";

// Page welcome configurations
interface PageWelcomeConfig {
  title: string;
  description: string;
  icon: LucideIcon;
  features: {
    icon: LucideIcon;
    title: string;
    description: string;
  }[];
  cta: string;
}

const PAGE_WELCOME_CONFIGS: Record<string, PageWelcomeConfig> = {
  "/": {
    title: "Welcome to Largence!",
    description: "Your AI-powered legal document management platform. Let's get you started with the key features.",
    icon: Home,
    features: [
      {
        icon: FileText,
        title: "Smart Documents",
        description: "Create and manage legal documents with AI assistance",
      },
      {
        icon: Briefcase,
        title: "Matter Management",
        description: "Organize cases, track time, and manage billing",
      },
      {
        icon: ShieldCheck,
        title: "Compliance",
        description: "Ensure your documents meet regulatory requirements",
      },
    ],
    cta: "Get Started",
  },
  "/documents": {
    title: "Documents Hub",
    description: "This is where all your legal documents live. Create new documents, collaborate with your team, and ensure compliance.",
    icon: FileText,
    features: [
      {
        icon: Sparkles,
        title: "AI-Powered Creation",
        description: "Generate documents using AI or start from templates",
      },
      {
        icon: ShieldCheck,
        title: "Compliance Checks",
        description: "Run automated compliance checks on any document",
      },
      {
        icon: Users,
        title: "Collaboration",
        description: "Share and collaborate with team members in real-time",
      },
    ],
    cta: "Create Your First Document",
  },
  "/matters": {
    title: "Matter Management",
    description: "Organize your legal work into matters (cases or projects). Track documents, time, and billing all in one place.",
    icon: Briefcase,
    features: [
      {
        icon: FileText,
        title: "Document Links",
        description: "Associate documents with specific matters",
      },
      {
        icon: BarChart3,
        title: "Time Tracking",
        description: "Log time entries and track billable hours",
      },
      {
        icon: Users,
        title: "Client Management",
        description: "Link contacts and manage client relationships",
      },
    ],
    cta: "Create Your First Matter",
  },
  "/messages": {
    title: "Team Messages",
    description: "Communicate with your team in organized channels. Discuss documents, matters, and collaborate efficiently.",
    icon: MessageSquare,
    features: [
      {
        icon: MessageSquare,
        title: "Channels",
        description: "Create public or private channels for different topics",
      },
      {
        icon: FileText,
        title: "Document Sharing",
        description: "Share and discuss documents directly in chat",
      },
      {
        icon: Users,
        title: "Direct Messages",
        description: "Have private conversations with team members",
      },
    ],
    cta: "Start a Conversation",
  },
  "/templates": {
    title: "Templates Library",
    description: "Browse and use pre-built legal document templates. Find community templates or create your own for reuse.",
    icon: LayoutTemplate,
    features: [
      {
        icon: Sparkles,
        title: "Community Templates",
        description: "Access templates created by the legal community",
      },
      {
        icon: FileText,
        title: "Custom Templates",
        description: "Create and save your own reusable templates",
      },
      {
        icon: Check,
        title: "Compliance Ready",
        description: "Templates designed with compliance in mind",
      },
    ],
    cta: "Browse Templates",
  },
  "/compliance": {
    title: "Compliance Center",
    description: "Monitor and ensure regulatory compliance across all your documents. Run checks and track compliance status.",
    icon: ShieldCheck,
    features: [
      {
        icon: Sparkles,
        title: "AI Analysis",
        description: "AI-powered compliance analysis for your documents",
      },
      {
        icon: Check,
        title: "Automated Checks",
        description: "Run automated compliance checks on demand",
      },
      {
        icon: BarChart3,
        title: "Compliance Dashboard",
        description: "Track compliance status across your organization",
      },
    ],
    cta: "Check Compliance",
  },
  "/analytics": {
    title: "Analytics Dashboard",
    description: "Get insights into your legal operations. Track document creation, team productivity, and more.",
    icon: BarChart3,
    features: [
      {
        icon: FileText,
        title: "Document Metrics",
        description: "Track document creation and completion rates",
      },
      {
        icon: Users,
        title: "Team Activity",
        description: "Monitor team productivity and collaboration",
      },
      {
        icon: ShieldCheck,
        title: "Compliance Trends",
        description: "View compliance check results over time",
      },
    ],
    cta: "View Analytics",
  },
  "/teams": {
    title: "Teams & Roles",
    description: "Manage your team members and their roles. Control access and permissions across your organization.",
    icon: Users,
    features: [
      {
        icon: Users,
        title: "Team Management",
        description: "Invite and manage team members",
      },
      {
        icon: ShieldCheck,
        title: "Role-Based Access",
        description: "Define roles and permissions for team members",
      },
      {
        icon: Briefcase,
        title: "Department Groups",
        description: "Organize teams by department or practice area",
      },
    ],
    cta: "Manage Team",
  },
};

// Storage key prefix for page visits
const STORAGE_PREFIX = "largence:page-visited:";

export function PageWelcomeDialog() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [showDialog, setShowDialog] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<PageWelcomeConfig | null>(null);

  // Check if page has been visited before
  useEffect(() => {
    if (!isLoaded || !pathname) return;

    const checkPageVisit = async () => {
      const config = PAGE_WELCOME_CONFIGS[pathname];
      if (!config) return;

      let hasVisited = false;

      // Check user metadata first (persists across devices)
      if (user) {
        const userMetadata = (user.unsafeMetadata as Record<string, any>) || {};
        const visitedPages = userMetadata.visitedPages || [];
        hasVisited = visitedPages.includes(pathname);
      }

      // Also check localStorage for faster response
      const localVisited = localStorage.getItem(`${STORAGE_PREFIX}${pathname}`);
      if (localVisited) {
        hasVisited = true;
      }

      if (!hasVisited) {
        // Small delay to let page render first
        setTimeout(() => {
          setCurrentConfig(config);
          setShowDialog(true);
        }, 800);
      }
    };

    checkPageVisit();
  }, [pathname, isLoaded, user]);

  const markPageAsVisited = useCallback(async () => {
    if (!pathname) return;

    // Save to localStorage immediately
    localStorage.setItem(`${STORAGE_PREFIX}${pathname}`, "true");

    // Save to user metadata for persistence across devices
    if (user) {
      try {
        const currentMetadata = (user.unsafeMetadata as Record<string, any>) || {};
        const visitedPages = currentMetadata.visitedPages || [];

        if (!visitedPages.includes(pathname)) {
          await user.update({
            unsafeMetadata: {
              ...currentMetadata,
              visitedPages: [...visitedPages, pathname],
            },
          });
        }
      } catch (error) {
        console.error("Failed to save page visit to user metadata:", error);
      }
    }
  }, [pathname, user]);

  const handleClose = useCallback(() => {
    setShowDialog(false);
    markPageAsVisited();
  }, [markPageAsVisited]);

  const handleGetStarted = useCallback(() => {
    setShowDialog(false);
    markPageAsVisited();
  }, [markPageAsVisited]);

  if (!currentConfig) return null;

  const Icon = currentConfig.icon;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="h-7 w-7 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl">{currentConfig.title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {currentConfig.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {currentConfig.features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <feature.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="sm:justify-center gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-sm"
          >
            Skip for now
          </Button>
          <Button onClick={handleGetStarted} className="rounded-sm gap-2">
            {currentConfig.cta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook to reset page visits (useful for testing or settings)
export function usePageVisits() {
  const { user } = useUser();

  const resetPageVisit = useCallback(async (pathname: string) => {
    localStorage.removeItem(`${STORAGE_PREFIX}${pathname}`);

    if (user) {
      try {
        const currentMetadata = (user.unsafeMetadata as Record<string, any>) || {};
        const visitedPages = (currentMetadata.visitedPages || []).filter(
          (p: string) => p !== pathname
        );

        await user.update({
          unsafeMetadata: {
            ...currentMetadata,
            visitedPages,
          },
        });
      } catch (error) {
        console.error("Failed to reset page visit:", error);
      }
    }
  }, [user]);

  const resetAllPageVisits = useCallback(async () => {
    // Clear localStorage
    Object.keys(localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));

    if (user) {
      try {
        const currentMetadata = (user.unsafeMetadata as Record<string, any>) || {};
        await user.update({
          unsafeMetadata: {
            ...currentMetadata,
            visitedPages: [],
          },
        });
      } catch (error) {
        console.error("Failed to reset all page visits:", error);
      }
    }
  }, [user]);

  return { resetPageVisit, resetAllPageVisits };
}
