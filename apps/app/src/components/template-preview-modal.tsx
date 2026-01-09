"use client";

import { Button } from "@largence/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@largence/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle2,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { Separator } from "@largence/components/ui/separator";

interface TemplatePreviewModalProps {
  template: {
    id: number;
    name: string;
    category: string;
    type: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    jurisdictions: string[];
    popularity: number;
    usageCount: number;
    lastUpdated: string;
    featured: boolean;
    detailedDescription?: string;
    keyFeatures?: string[];
    includedClauses?: string[];
    suitableFor?: string[];
    previewContent?: string;
  } | null;
  open: boolean;
  onClose: () => void;
  onUseTemplate: (templateType: string) => void;
}

export function TemplatePreviewModal({
  template,
  open,
  onClose,
  onUseTemplate,
}: TemplatePreviewModalProps) {
  if (!template) return null;

  const Icon = template.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="inline-flex p-3 rounded-sm bg-primary/10">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-heading mb-2">
                {template.name}
              </DialogTitle>
              <DialogDescription className="text-base">
                {template.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-6">
            {/* Jurisdictions */}
            <div>
              <h3 className="text-sm font-semibold mb-2">
                Supported Jurisdictions
              </h3>
              <div className="flex flex-wrap gap-2">
                {template.jurisdictions.map((jurisdiction, idx) => (
                  <Badge key={idx} variant="outline" className="rounded-sm">
                    {jurisdiction}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Detailed Description */}
            {template.detailedDescription && (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    About This Template
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {template.detailedDescription}
                  </p>
                </div>
                <Separator />
              </>
            )}

            {/* Key Features */}
            {template.keyFeatures && template.keyFeatures.length > 0 && (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {template.keyFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
              </>
            )}

            {/* Included Clauses */}
            {template.includedClauses && template.includedClauses.length > 0 && (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-3">
                    Included Clauses
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {template.includedClauses.map((clause, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-sm p-2 rounded-sm bg-muted/50"
                      >
                        <Shield className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{clause}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Suitable For */}
            {template.suitableFor && template.suitableFor.length > 0 && (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Suitable For</h3>
                  <div className="flex flex-wrap gap-2">
                    {template.suitableFor.map((item, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="rounded-sm"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Preview Content */}
            {template.previewContent && (
              <div>
                <h3 className="text-sm font-semibold mb-3">
                  Template Preview
                </h3>
                <div className="rounded-sm border bg-muted/30 p-4">
                  <div className="flex items-start gap-2 mb-3 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5 mt-0.5" />
                    <span>Sample structure - actual content will be customized to your needs</span>
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-sm"
                    dangerouslySetInnerHTML={{
                      __html: template.previewContent,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Legal Notice */}
            <div className="rounded-sm border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-medium mb-1">Legal Notice</p>
                  <p className="text-amber-800 dark:text-amber-300">
                    This template is provided as a starting point. Always have
                    legal documents reviewed by a qualified attorney in your
                    jurisdiction before use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t bg-background shrink-0">
          <Button variant="outline" onClick={onClose} className="rounded-sm">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onUseTemplate(template.type);
              onClose();
            }}
            className="rounded-sm"
          >
            Use This Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
