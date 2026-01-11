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
import { ReactNode } from "react";

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
  icon?: LucideIcon | ReactNode;
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
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  showTemplates,
  variant = "default",
  action,
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
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalPrimaryAction = primaryAction || config.primaryAction;
  const finalSecondaryAction =
    secondaryAction !== undefined ? secondaryAction : config.secondaryAction;
  const finalShowTemplates =
    showTemplates !== undefined ? showTemplates : config.showTemplates;

  // Determine if Icon is a component (LucideIcon) or ReactNode
  const isIconComponent = Icon && typeof Icon === "function";
  const FinalIconComponent = isIconComponent ? (Icon as LucideIcon) : config.icon;

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
    }
    // TODO: Implement upload functionality
  };

  const handleTemplateClick = (templateType: string) => {
    // Navigate to create page with the template type as a query parameter
    router.push(`/create?type=${templateType}`);
  };

  // Render icon - either as ReactNode or as LucideIcon component
  const renderIcon = () => {
    if (Icon && !isIconComponent) {
      // Icon is already a ReactNode (JSX element)
      return Icon;
    }
    // Icon is a LucideIcon component or fallback to config icon
    return <FinalIconComponent className="h-8 w-8 text-muted-foreground" />;
  };

  return (
    <div className="rounded-sm border bg-card overflow-hidden">
      <div className="relative overflow-hidden border-b bg-card">
        <div className="relative flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <div className="relative p-3 rounded-sm bg-muted/50 border">
              {renderIcon()}
            </div>
          </div>

          <div className="max-w-lg mb-5">
            <h2 className="text-lg font-semibold mb-1.5 font-display tracking-tight">
              {finalTitle}
            </h2>
            <p className="text-sm text-muted-foreground">{finalDescription}</p>
          </div>

          {/* Render custom action if provided, otherwise default buttons */}
          {action ? (
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm justify-center">
              {action}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
              <Button
                size="sm"
                className="flex-1 h-8 rounded-sm cursor-pointer text-xs"
                onClick={handleGenerateClick}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {finalPrimaryAction.label}
              </Button>
              {finalSecondaryAction && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 rounded-sm cursor-pointer text-xs"
                  onClick={handleUploadClick}
                >
                  <Upload className="h-3.5 w-3.5" />
                  {finalSecondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {finalShowTemplates && (
        <div className="p-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-3">
              <h3 className="text-sm font-semibold mb-0.5 font-heading">
                Popular Templates
              </h3>
              <p className="text-xs text-muted-foreground">
                Choose from pre-built templates to get started instantly
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {templates.map((template) => {
                const TemplateIcon = template.icon;
                return (
                  <button
                    key={template.name}
                    onClick={() => handleTemplateClick(template.type)}
                    className="group p-3 rounded-sm border bg-card hover:bg-accent/5 hover:border-primary/50 transition-all text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1.5 rounded-sm bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                        <TemplateIcon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all ml-auto" />
                    </div>
                    <p className="font-medium text-xs">{template.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {template.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Help Text */}
            <div className="mt-4 pt-3 border-t">
              <div className="flex items-start gap-2 p-2.5 rounded-sm bg-muted/50">
                <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium mb-0.5">
                    Need help getting started?
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Our AI assistant can guide you through document creation and ensure compliance.
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
