"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@largence/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@largence/components/ui/sidebar";

export function NavMain({
  items,
  currentPath,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    badge?: string;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  currentPath?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (url: string) => {
    router.push(url);
  };

  return (
    <SidebarGroup>
      <SidebarMenu className="gap-1 px-0 relative">
        {items.map((item, index) => {
          const isActive = pathname === item.url;
          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item.url);
                  }}
                  className="h-10 rounded-md data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:shadow-sm data-[active=true]:shadow-primary/5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="font-medium text-sm group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                    {item.badge && (
                      <span
                        className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-xs font-medium group-data-[collapsible=icon]:hidden ${
                          isActive
                            ? "bg-primary/20 text-primary"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90 group-data-[collapsible=icon]:hidden">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              onClick={(e) => {
                                e.preventDefault();
                                router.push(subItem.url);
                              }}
                              className="h-9 cursor-pointer"
                            >
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
