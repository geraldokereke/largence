"use client";

import { Button } from "@largence/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@largence/components/ui/dialog";
import { PenLine, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface NewDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewDocumentDialog({ open, onOpenChange }: NewDocumentDialogProps) {
  const router = useRouter();

  const handleScratch = () => {
    onOpenChange(false);
    router.push("/documents/new");
  };

  const handleAI = () => {
    onOpenChange(false);
    router.push("/create");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-sm p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-3 border-b">
          <DialogTitle className="text-base font-medium">Create New Document</DialogTitle>
          <DialogDescription className="text-sm">
            Choose how you&apos;d like to create your document
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-3 space-y-2">
          {/* Write from Scratch Option */}
          <button
            onClick={handleScratch}
            className="w-full group flex items-start gap-3 p-3 rounded-sm border bg-card hover:border-primary/30 hover:bg-accent/5 transition-all text-left"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10 transition-colors">
              <PenLine className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
                  Write from Scratch
                </h3>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Start with a blank document and write your own content
              </p>
            </div>
          </button>

          {/* Generate with AI Option */}
          <button
            onClick={handleAI}
            className="w-full group flex items-start gap-3 p-3 rounded-sm border bg-card hover:border-primary/30 hover:bg-accent/5 transition-all text-left"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary/10 group-hover:bg-primary/15 transition-colors">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
                  Generate with AI
                </h3>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Use AI to generate a legal document from a template
              </p>
            </div>
          </button>
        </div>

        <div className="px-4 py-3 border-t mx-3">
          <p className="text-[11px] text-muted-foreground text-center">
            You can always edit AI-generated documents after creation
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
