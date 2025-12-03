"use client";

import { Button } from "@largence/components/ui/button";
import { Skeleton } from "@largence/components/ui/skeleton";
import { ArrowRight, Sparkles } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function WelcomeCTA() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <Skeleton className="w-full h-[168px] rounded-xl" />;
  }

  return (
    <div className="w-full bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-primary/10" />

      <div className="max-w-4xl relative z-10">
        <h1 className="text-3xl font-semibold mb-2 font-display">
          {`Hi ${user?.lastName || "there"}, Welcome to Largence`}
        </h1>
        <p className="text-lg text-white/70 mb-6">
          Get started with AI-powered legal document generation and team
          collaboration.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-white text-slate-900 hover:bg-white/90 rounded-sm h-10 px-4 font-medium cursor-pointer">
            <Sparkles className="h-5 w-5" />
            Get Started with Generation
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
