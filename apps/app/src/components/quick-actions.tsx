"use client";

import { useState } from "react";
import { Button } from "@largence/components/ui/button";
import { NewDocumentDialog } from "@largence/components/new-document-dialog";
import {
  FilePlus,
  Upload,
  LayoutTemplate,
  ShieldCheck,
  Folder,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const router = useRouter();
  const [newDocOpen, setNewDocOpen] = useState(false);

  const actions = [
    {
      label: "New Document",
      icon: FilePlus,
      onClick: () => setNewDocOpen(true),
      primary: true,
    },
    {
      label: "Templates",
      icon: LayoutTemplate,
      onClick: () => router.push("/templates"),
    },
    {
      label: "Compliance",
      icon: ShieldCheck,
      onClick: () => router.push("/compliance"),
    },
    {
      label: "AI Create",
      icon: Sparkles,
      onClick: () => router.push("/create"),
    },
  ];

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant={action.primary ? "default" : "outline"}
              size="sm"
              onClick={action.onClick}
              className="rounded-sm h-8 text-xs shrink-0"
            >
              <Icon className="h-3.5 w-3.5 mr-1.5" />
              {action.label}
            </Button>
          );
        })}
      </div>
      <NewDocumentDialog open={newDocOpen} onOpenChange={setNewDocOpen} />
    </>
  );
}
