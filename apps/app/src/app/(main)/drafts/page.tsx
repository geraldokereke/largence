"use client";

import { EmptyState } from "@largence/components/empty-state";
import { Brain } from "lucide-react";

export default function DraftsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold font-heading">AI Drafts</h1>
        <p className="text-sm text-muted-foreground">
          Review and manage your AI-generated document drafts
        </p>
      </div>

      <EmptyState
        icon={Brain}
        title="No AI drafts yet"
        description="Start generating legal documents with AI assistance. Your drafts will appear here for review and editing."
        primaryAction={{ label: "Start AI Generation" }}
        secondaryAction={null}
        showTemplates={false}
      />
    </div>
  );
}
