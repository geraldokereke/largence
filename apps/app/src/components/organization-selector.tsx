"use client";

import { useState } from "react";
import { useOrganization, useOrganizationList, useUser } from "@clerk/nextjs";
import { Button } from "@largence/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@largence/components/ui/dialog";
import { Building2, Check, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@largence/lib/utils";

interface OrganizationSelectorProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showCreateNew?: boolean;
}

export function OrganizationSelector({
  open,
  onOpenChange,
  showCreateNew = true,
}: OrganizationSelectorProps) {
  const { organization } = useOrganization();
  const { userMemberships, setActive } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectOrganization = async (orgId: string) => {
    if (!setActive) return;

    setIsLoading(true);
    try {
      await setActive({ organization: orgId });
      onOpenChange?.(false);
      router.refresh();
    } catch (err) {
      console.error("Error selecting organization:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    router.push("/onboarding");
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Workspace</DialogTitle>
          <DialogDescription>
            Choose a workspace to continue or create a new one
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {userMemberships?.data?.map(({ organization: org }) => (
            <button
              key={org.id}
              onClick={() => handleSelectOrganization(org.id)}
              disabled={isLoading}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-sm border transition-all",
                "hover:border-primary hover:bg-accent",
                organization?.id === org.id
                  ? "border-primary bg-accent"
                  : "border-border",
              )}
            >
              <div className="shrink-0 w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center">
                {org.imageUrl ? (
                  <img
                    src={org.imageUrl}
                    alt={org.name}
                    className="w-full h-full object-cover rounded-sm"
                  />
                ) : (
                  <Building2 className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">{org.name}</div>
                <div className="text-sm text-muted-foreground">
                  {org.membersCount}{" "}
                  {org.membersCount === 1 ? "member" : "members"}
                </div>
              </div>
              {organization?.id === org.id && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </button>
          ))}

          {showCreateNew && (
            <Button
              variant="outline"
              onClick={handleCreateNew}
              disabled={isLoading}
              className="w-full h-auto p-4 justify-start gap-3"
            >
              <div className="shrink-0 w-10 h-10 rounded-sm border-2 border-dashed border-primary/30 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">Create New Workspace</div>
                <div className="text-sm text-muted-foreground">
                  Set up a new organization
                </div>
              </div>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
