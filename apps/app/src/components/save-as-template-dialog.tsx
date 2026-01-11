"use client";

import { useState } from "react";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { Textarea } from "@largence/components/ui/textarea";
import { Label } from "@largence/components/ui/label";
import { Switch } from "@largence/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@largence/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@largence/components/ui/select";
import { toast } from "sonner";
import { FileStack, Globe, Lock, Loader2, Sparkles } from "lucide-react";

interface SaveAsTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentTitle: string;
  documentContent: string;
  documentType?: string;
  jurisdiction?: string;
}

const TEMPLATE_CATEGORIES = [
  "Contracts",
  "Employment",
  "Corporate",
  "Real Estate",
  "Intellectual Property",
  "Privacy & Data",
  "Finance",
  "Litigation",
  "Compliance",
  "Other",
];

export function SaveAsTemplateDialog({
  open,
  onOpenChange,
  documentTitle,
  documentContent,
  documentType,
  jurisdiction,
}: SaveAsTemplateDialogProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: documentTitle || "",
    description: "",
    category: documentType || "Other",
    documentType: documentType || "Other",
    jurisdiction: jurisdiction || "",
    tags: "",
    isPublic: false,
    publishToDirectory: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Template name is required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          documentType: formData.documentType,
          jurisdiction: formData.jurisdiction || null,
          content: documentContent,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
          isPublic: formData.isPublic,
          publishToDirectory: formData.publishToDirectory,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save template");
      }

      const data = await response.json();
      
      toast.success(
        formData.publishToDirectory
          ? "Template published to Largence directory!"
          : "Template saved successfully!",
        {
          description: formData.publishToDirectory
            ? "Your template is now available in the public template directory."
            : "You can access it from your templates library.",
        }
      );
      
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "Other",
        documentType: "Other",
        jurisdiction: "",
        tags: "",
        isPublic: false,
        publishToDirectory: false,
      });
    } catch (error: any) {
      console.error("Save template error:", error);
      toast.error("Failed to save template", {
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-sm bg-primary/10">
              <FileStack className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle className="text-base">Save as Template</DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            Turn this document into a reusable template for you or your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm">
              Template Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Standard Employment Contract"
              className="h-8 rounded-sm text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe what this template is for..."
              className="rounded-sm text-sm min-h-[60px] resize-none"
              rows={2}
            />
          </div>

          {/* Category and Document Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="h-8 rounded-sm text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-sm">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jurisdiction" className="text-sm">
                Jurisdiction
              </Label>
              <Input
                id="jurisdiction"
                value={formData.jurisdiction}
                onChange={(e) =>
                  setFormData({ ...formData, jurisdiction: e.target.value })
                }
                placeholder="e.g., Nigeria, Kenya"
                className="h-8 rounded-sm text-sm"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="tags" className="text-sm">
              Tags <span className="text-muted-foreground text-xs">(comma separated)</span>
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="e.g., employment, full-time, benefits"
              className="h-8 rounded-sm text-sm"
            />
          </div>

          {/* Visibility Options */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {formData.isPublic ? (
                  <Globe className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="isPublic" className="text-sm font-medium">
                    Make Public
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Allow others in your organization to use this template
                  </p>
                </div>
              </div>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, isPublic: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <div>
                  <Label htmlFor="publishToDirectory" className="text-sm font-medium">
                    Publish to Largence Directory
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Share with the Largence community and help others
                  </p>
                </div>
              </div>
              <Switch
                id="publishToDirectory"
                checked={formData.publishToDirectory}
                onCheckedChange={(checked: boolean) =>
                  setFormData({
                    ...formData,
                    publishToDirectory: checked,
                    isPublic: checked ? true : formData.isPublic,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-8 rounded-sm text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="h-8 rounded-sm text-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : formData.publishToDirectory ? (
                <>
                  <Globe className="h-3.5 w-3.5" />
                  Publish Template
                </>
              ) : (
                <>
                  <FileStack className="h-3.5 w-3.5" />
                  Save Template
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
