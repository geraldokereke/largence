"use client";

import { Button } from "@largence/components/ui/button";
import { useRouter } from "next/navigation";
import {
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  BookOpen,
  Shield,
  LucideIcon,
} from "lucide-react";

const templates = [
  {
    name: "Employment Contract",
    icon: FileText,
    description: "Hire with confidence",
    type: "employment",
  },
  {
    name: "NDA Agreement",
    icon: Shield,
    description: "Protect your IP",
    type: "nda",
  },
  {
    name: "Service Agreement",
    icon: BookOpen,
    description: "Client contracts",
    type: "service",
  },
  {
    name: "Privacy Policy",
    icon: Shield,
    description: "GDPR compliant",
    type: "privacy",
  },
];

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
  } | null;
  showTemplates?: boolean;
  variant?: "default" | "documents" | "drafts" | "templates";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  showTemplates,
  variant = "default",
}: EmptyStateProps = {}) {
  const router = useRouter();

  // Dynamic content based on variant
  const variantConfig = {
    default: {
      icon: FileText,
      title: "No documents yet",
      description:
        "Get started by creating your first legal document with AI or uploading an existing one",
      primaryAction: {
        label: "Generate with AI",
        onClick: undefined as (() => void) | undefined,
      },
      secondaryAction: {
        label: "Upload Document",
        onClick: undefined as (() => void) | undefined,
      },
      showTemplates: true,
    },
    documents: {
      icon: FileText,
      title: "No documents yet",
      description:
        "Generate your first AI-powered legal document to get started",
      primaryAction: {
        label: "Generate Document",
        onClick: undefined as (() => void) | undefined,
      },
      secondaryAction: null,
      showTemplates: true,
    },
    drafts: {
      icon: FileText,
      title: "No drafts yet",
      description:
        "Your draft documents will appear here. Start creating a document to see it in drafts.",
      primaryAction: {
        label: "Create Document",
        onClick: undefined as (() => void) | undefined,
      },
      secondaryAction: null,
      showTemplates: false,
    },
    templates: {
      icon: BookOpen,
      title: "No templates saved",
      description:
        "Save your frequently used documents as templates for quick access",
      primaryAction: {
        label: "Browse Documents",
        onClick: undefined as (() => void) | undefined,
      },
      secondaryAction: null,
      showTemplates: false,
    },
  };

  const config = variantConfig[variant];
  const FinalIcon = Icon || config.icon;
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalPrimaryAction = primaryAction || config.primaryAction;
  const finalSecondaryAction =
    secondaryAction !== undefined ? secondaryAction : config.secondaryAction;
  const finalShowTemplates =
    showTemplates !== undefined ? showTemplates : config.showTemplates;

  const handleGenerateClick = () => {
    if (finalPrimaryAction.onClick) {
      finalPrimaryAction.onClick();
    } else {
      router.push("/create");
    }
  };

  const handleUploadClick = () => {
    if (finalSecondaryAction?.onClick) {
      finalSecondaryAction.onClick();
    } else {
      // TODO: Implement upload functionality
      console.log("Upload document");
    }
  };

  const handleTemplateClick = (templateType: string) => {
    // Navigate to create page with the template type as a query parameter
    router.push(`/create?type=${templateType}`);
  };

  return (
    <div className="rounded-sm border bg-card overflow-hidden">
      <div className="relative overflow-hidden border-b bg-card">
        <div className="relative flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative p-5 rounded-sm bg-muted/50 border">
              <FinalIcon className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>

          <div className="max-w-2xl mb-8">
            <h2 className="text-3xl font-semibold mb-3 font-display tracking-tight">
              {finalTitle}
            </h2>
            <p className="text-muted-foreground">{finalDescription}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <Button
              className="flex-1 h-10 rounded-sm cursor-pointer"
              onClick={handleGenerateClick}
            >
              <Sparkles className="h-5 w-5" />
              {finalPrimaryAction.label}
            </Button>
            {finalSecondaryAction && (
              <Button
                variant="outline"
                className="flex-1 h-10 rounded-sm cursor-pointer"
                onClick={handleUploadClick}
              >
                <Upload className="h-5 w-5" />
                {finalSecondaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>

      {finalShowTemplates && (
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1 font-heading">
                Popular Templates
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose from pre-built templates to get started instantly
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates.map((template) => {
                const TemplateIcon = template.icon;
                return (
                  <button
                    key={template.name}
                    onClick={() => handleTemplateClick(template.type)}
                    className="group p-4 rounded-sm border bg-card hover:bg-accent/5 hover:border-primary/50 transition-all text-left flex items-start gap-4 cursor-pointer"
                  >
                    <div className="p-2.5 rounded-sm bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                      <TemplateIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{template.name}</p>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex items-start gap-3 p-4 rounded-sm bg-muted/50">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">
                    Need help getting started?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Our AI assistant can guide you through document creation,
                    suggest clauses, and ensure compliance with your
                    jurisdiction's regulations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
