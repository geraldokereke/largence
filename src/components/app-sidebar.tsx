"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
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
  workspaces: [
    {
      name: "Enterprise Corp",
      plan: "Enterprise",
    },
    {
      name: "Acme Inc",
      plan: "Pro",
    },
    {
      name: "Personal",
      plan: "Free",
    },
  ],
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
  const [activeWorkspace, setActiveWorkspace] = React.useState(data.workspaces[0]);
  const pathname = usePathname();

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
              className="h-10 rounded-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:justify-center"
            >
              <button className="flex items-center gap-3 w-full">
                <Plus className="h-5 w-5 shrink-0" />
                <span className="font-medium text-sm group-data-[collapsible=icon]:hidden">New Document</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="h-10 rounded-sm data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:justify-center"
                >
                  <div className="bg-primary text-primary-foreground flex aspect-square h-5 w-5 items-center justify-center rounded-sm shrink-0">
                    <span className="text-[10px] font-semibold">
                      {activeWorkspace.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col items-start text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium">
                      {activeWorkspace.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {activeWorkspace.plan}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-sm"
                align="start"
                side="top"
                sideOffset={4}
              >
                {data.workspaces.map((workspace, index) => (
                  <DropdownMenuItem
                    key={workspace.name}
                    onClick={() => setActiveWorkspace(workspace)}
                    className="gap-2 p-2 rounded-sm cursor-pointer"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border bg-background">
                      <span className="text-xs font-medium">
                        {workspace.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">{workspace.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {workspace.plan}
                      </span>
                    </div>
                    {activeWorkspace.name === workspace.name && (
                      <Check className="ml-auto size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
