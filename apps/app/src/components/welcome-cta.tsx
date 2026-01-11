"use client";

import { useState } from "react";
import { Button } from "@largence/components/ui/button";
import { Skeleton } from "@largence/components/ui/skeleton";
import { NewDocumentDialog } from "@largence/components/new-document-dialog";
import { ArrowRight, Sparkles } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function WelcomeCTA() {
  const { user, isLoaded } = useUser();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!isLoaded) {
    return <Skeleton className="w-full h-[168px] rounded-xl" />;
  }

  return (
    <>
      <div className="w-full bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg p-5 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-primary/10" />

        <div className="max-w-4xl relative z-10">
          <h1 className="text-2xl font-semibold mb-1.5 font-display">
            {`Hi ${user?.lastName || "there"}, Welcome to Largence`}
          </h1>
          <p className="text-sm text-white/70 mb-4">
            Get started with AI-powered legal document generation and team
            collaboration.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-white text-slate-900 hover:bg-white/90 rounded-sm h-8 px-3 text-sm font-medium cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              Create New Document
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <NewDocumentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
