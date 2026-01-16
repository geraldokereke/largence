"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOrganization, useOrganizationList, useAuth } from "@clerk/nextjs";
import {
  Home,
  FileText,
  ShieldCheck,
  Folder,
  Users,
  FileStack,
  Plus,
  ChevronsUpDown,
  Check,
  Plug2Icon,
  Building2,
  Sparkles,
  Briefcase,
  ScrollText,
  BarChart3,
  MessageSquare,
} from "lucide-react";

import { NavMain } from "@largence/components/nav-main";
import { NewDocumentDialog } from "@largence/components/new-document-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@largence/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@largence/components/ui/dropdown-menu";
import { Button } from "@largence/components/ui/button";
import { UpgradeModal } from "@largence/components/upgrade-modal";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { userId } = useAuth();
  const { organization } = useOrganization();
  const { userMemberships, setActive } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const [documentCounts, setDocumentCounts] = React.useState<{
    my: number;
    team: number;
    shared: number;
    total: number;
  } | null>(null);
  const [plan, setPlan] = React.useState<string | null>(null);
  const [newDocDialogOpen, setNewDocDialogOpen] = React.useState(false);
  const upgradeModal = useUpgradeModal();

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    if (!userId) return;

    const fetchCounts = async () => {
      try {
        const response = await fetch("/api/documents/counts");
        if (response.ok) {
          const data = await response.json();
          setDocumentCounts(data);
        }
      } catch (error) {
        console.error("Failed to fetch document counts:", error);
      }
    };

    const fetchBilling = async () => {
      try {
        const response = await fetch("/api/billing");
        if (response.ok) {
          const data = await response.json();
          // Plan is inside subscription object, default to FREE if no subscription
          setPlan(data.subscription?.plan || "FREE");
        } else {
          // If billing API fails (e.g., no org), default to FREE
          setPlan("FREE");
        }
      } catch (error) {
        console.error("Failed to fetch billing:", error);
        // Default to FREE plan on error
        setPlan("FREE");
      }
    };

    fetchCounts();
    fetchBilling();
  }, [userId]);

  const navSections = [
    {
      header: "Workspace",
      items: [
        { title: "Home", url: "/", icon: Home },
        { title: "Documents", url: "/documents", icon: FileText, badge: documentCounts?.total ? String(documentCounts.total) : undefined },
        { title: "Matters", url: "/matters", icon: Briefcase },
        { title: "Messages", url: "/messages", icon: MessageSquare },
      ],
    },
    {
      header: "Libraries",
      items: [
        { title: "Clause Library", url: "/clauses", icon: ScrollText },
        { title: "Templates Library", url: "/templates", icon: Folder },
      ],
    },
    {
      header: "Compliance & Analytics",
      items: [
        { title: "Compliance Checks", url: "/compliance", icon: ShieldCheck },
        { title: "Analytics", url: "/analytics", icon: BarChart3 },
      ],
    },
    {
      header: "Tools",
      items: [
        { title: "Teams & Roles", url: "/teams", icon: Users },
        { title: "Audit Trails", url: "/audit", icon: FileStack },
        { title: "Integrations", url: "/integrations", icon: Plug2Icon },
      ],
    },
  ];

  React.useEffect(() => {
    setIsClient(true);

    const savedState = localStorage.getItem("sidebar:state");
    if (savedState) {
      const sidebar = document.querySelector('[data-sidebar="sidebar"]');
      if (sidebar) {
        const newState = savedState === "expanded" ? "expanded" : "collapsed";
        sidebar.setAttribute("data-state", newState);
      }
    }

    const handleStateChange = (mutations: MutationRecord[]) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-state"
        ) {
          const state = (mutation.target as Element).getAttribute("data-state");
          if (state) {
            localStorage.setItem("sidebar:state", state);
            document.cookie = `sidebar:state=${state};path=/;max-age=31536000;samesite=lax`;
          }
        }
      });
    };

    const observer = new MutationObserver(handleStateChange);
    const sidebar = document.querySelector('[data-sidebar="sidebar"]');

    if (sidebar) {
      observer.observe(sidebar, {
        attributes: true,
        attributeFilter: ["data-state"],
      });
    }

    return () => observer.disconnect();
  }, []);

  const handleSwitchOrganization = async (orgId: string) => {
    if (!setActive) return;

    try {
      await setActive({ organization: orgId });
      // Use router.refresh() for smoother transition
      router.refresh();
    } catch (error) {
      console.error("Failed to switch organization:", error);
    }
  };

  const handleNewDocument = () => {
    setNewDocDialogOpen(true);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! border-r"
      data-walkthrough="sidebar"
      {...props}
    >
      <SidebarContent className="gap-0 px-2 py-1">
        {navSections.map((section, idx) => (
          <React.Fragment key={section.header}>
            <div className="px-2 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide group-data-[collapsible=icon]:hidden">
              {section.header}
            </div>
            <NavMain items={section.items} currentPath={pathname} />
            {idx < navSections.length - 1 && (
              <hr className="my-2 border-sidebar-accent/30" />
            )}
          </React.Fragment>
        ))}
      </SidebarContent>
       {(plan === "FREE" || plan === null) && (
          <div className="mb-3 mx-3 p-3 rounded-sm border bg-gradient-to-br from-primary/5 to-primary/10 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold text-xs">Free Plan</span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">
              Upgrade to Pro for unlimited documents, compliance checks, and team collaboration.
            </p>
            <Button
              size="sm"
              className="w-full h-7 text-xs rounded-sm cursor-pointer"
              onClick={() =>
                upgradeModal.openUpgradeModal({
                  reason: "Upgrade to unlock all features",
                })
              }
            >
              Upgrade to Pro
            </Button>
          </div>
        )}

      <SidebarFooter className="border-t gap-0 px-3 py-3">
       
        <SidebarMenu className="gap-1 px-0">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-8 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:justify-center"
              data-walkthrough="new-document-btn"
            >
              <button
                onClick={handleNewDocument}
                className="flex items-center gap-2 w-full"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="font-medium text-[13px] group-data-[collapsible=icon]:hidden">
                  New Document
                </span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-8 rounded-md data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:justify-center">
                  <div className="bg-primary text-primary-foreground flex aspect-square h-4 w-4 items-center justify-center rounded-md shrink-0">
                    {organization?.imageUrl ? (
                      <img
                        src={organization.imageUrl}
                        alt={organization.name}
                        className="h-full w-full rounded-md object-cover"
                      />
                    ) : (
                      <Building2 className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col items-start text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium">
                      {organization?.name || "No Organization"}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {organization?.membersCount || 0} members
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-md"
                align="start"
                side="top"
                sideOffset={4}
              >
                {userMemberships?.data?.map((membership) => (
                  <DropdownMenuItem
                    key={membership.organization.id}
                    onClick={() =>
                      handleSwitchOrganization(membership.organization.id)
                    }
                    className="gap-2 p-2 rounded-md cursor-pointer"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      {membership.organization.imageUrl ? (
                        <img
                          src={membership.organization.imageUrl}
                          alt={membership.organization.name}
                          className="h-full w-full rounded-md object-cover"
                        />
                      ) : (
                        <Building2 className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">
                        {membership.organization.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {membership.organization.membersCount}{" "}
                        {membership.organization.membersCount === 1
                          ? "member"
                          : "members"}
                      </span>
                    </div>
                    {organization?.id === membership.organization.id && (
                      <Check className="ml-auto size-4" />
                    )}
                  </DropdownMenuItem>
                ))}

                {userMemberships?.data && userMemberships.data.length === 0 && (
                  <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                    No organizations found
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={upgradeModal.closeUpgradeModal}
        reason={upgradeModal.reason}
        feature={upgradeModal.feature}
        currentPlan={upgradeModal.currentPlan}
      />
      <NewDocumentDialog open={newDocDialogOpen} onOpenChange={setNewDocDialogOpen} />
    </Sidebar>
  );
}
