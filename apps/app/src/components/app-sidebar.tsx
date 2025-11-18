"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import {
  Home,
  FileText,
  Brain,
  ShieldCheck,
  Folder,
  Users,
  FileStack,
  Plus,
  ChevronsUpDown,
  Check,
  Plug2Icon,
  Building2,
} from "lucide-react";

import { NavMain } from "@largence/components/nav-main";
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

const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Documents",
      url: "/documents",
      icon: FileText,
      badge: "12",
    },
    {
      title: "AI Drafts",
      url: "/drafts",
      icon: Brain,
      badge: "3",
    },
    {
      title: "Compliance Checks",
      url: "/compliance",
      icon: ShieldCheck,
    },
    {
      title: "Templates Library",
      url: "/templates",
      icon: Folder,
    },
    {
      title: "Teams & Roles",
      url: "/teams",
      icon: Users,
    },
    {
      title: "Audit Trails",
      url: "/audit",
      icon: FileStack,
    },
    {
      title: "Integrations",
      url: "/integrations",
      icon: Plug2Icon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { organization } = useOrganization();
  const { userMemberships, setActive } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  // Persist sidebar state using cookies for SSR compatibility
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    
    // Restore sidebar state from localStorage
    const savedState = localStorage.getItem('sidebar:state');
    if (savedState) {
      const sidebar = document.querySelector('[data-sidebar="sidebar"]');
      if (sidebar) {
        const newState = savedState === 'expanded' ? 'expanded' : 'collapsed';
        sidebar.setAttribute('data-state', newState);
      }
    }

    // Save state on change
    const handleStateChange = (mutations: MutationRecord[]) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
          const state = (mutation.target as Element).getAttribute('data-state');
          if (state) {
            localStorage.setItem('sidebar:state', state);
            // Also save to cookie for SSR
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
        attributeFilter: ['data-state'] 
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
    router.push('/create');
  };

  return (
    <Sidebar
      collapsible="icon"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! border-r"
      
      {...props}
    >
      <SidebarContent className="gap-0 px-2 py-4">
        <NavMain items={data.navMain} currentPath={pathname} />
      </SidebarContent>

      <SidebarFooter className="border-t gap-0 px-4 py-4">
        <SidebarMenu className="gap-1 px-0">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-10 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:justify-center"
            >
              <button onClick={handleNewDocument} className="flex items-center gap-3 w-full">
                <Plus className="h-5 w-5 shrink-0" />
                <span className="font-medium text-sm group-data-[collapsible=icon]:hidden">New Document</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="h-10 rounded-md data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:justify-center"
                >
                  <div className="bg-primary text-primary-foreground flex aspect-square h-5 w-5 items-center justify-center rounded-md shrink-0">
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
                  <div className="flex flex-1 flex-col items-start text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium">
                      {organization?.name || "No Organization"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
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
                    onClick={() => handleSwitchOrganization(membership.organization.id)}
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
                      <span className="font-medium text-sm">{membership.organization.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {membership.organization.membersCount} {membership.organization.membersCount === 1 ? 'member' : 'members'}
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
    </Sidebar>
  );
}
