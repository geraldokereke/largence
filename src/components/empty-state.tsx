import { Button } from "@largence/components/ui/button";
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
  },
  { name: "NDA Agreement", icon: Shield, description: "Protect your IP" },
  {
    name: "Service Agreement",
    icon: BookOpen,
    description: "Client contracts",
  },
  { name: "Privacy Policy", icon: Shield, description: "GDPR compliant" },
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
}

export function EmptyState({
  icon: Icon = FileText,
  title = "No documents yet",
  description = "Get started by creating your first legal document with AI or uploading an existing one",
  primaryAction = { label: "Generate with AI" },
  secondaryAction = { label: "Upload Document" },
  showTemplates = true,
}: EmptyStateProps = {}) {
  return (
    <div className="rounded-sm border bg-card overflow-hidden">
      <div className="relative overflow-hidden border-b bg-card">
        <div className="relative flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative p-5 rounded-sm bg-muted/50 border">
              <Icon className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>

          <div className="max-w-2xl mb-8">
            <h2 className="text-3xl font-semibold mb-3 font-(family-name:--font-general-sans) tracking-tight">
              {title}
            </h2>
            <p className="text-muted-foreground">{description}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <Button className="flex-1 h-10 rounded-sm" onClick={primaryAction.onClick}>
              <Sparkles className="h-5 w-5" />
              {primaryAction.label}
            </Button>
            {secondaryAction && (
              <Button variant="outline" className="flex-1 h-10 rounded-sm" onClick={secondaryAction.onClick}>
                <Upload className="h-5 w-5" />
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>

      {showTemplates && (
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1 font-(family-name:--font-general-sans)">
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
                    className="group p-4 rounded-sm border bg-card hover:bg-accent/5 hover:border-primary/50 transition-all text-left flex items-start gap-4"
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
