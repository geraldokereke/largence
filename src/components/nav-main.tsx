"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@largence/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@largence/components/ui/sidebar"

export function NavMain({
  items,
  currentPath,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    badge?: string
    items?: {
      title: string
      url: string
    }[]
  }[]
  currentPath?: string
}) {
  return (
    <SidebarGroup>
      <SidebarMenu className="gap-1 px-0">
        {items.map((item) => {
          const isActive = currentPath === item.url;
          return (
          <Collapsible key={item.title} asChild defaultOpen={isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title}
                isActive={isActive}
                className="h-10 rounded-sm data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
              >
                <a href={item.url} className="flex items-center gap-3 w-full">
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="font-medium text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-sm bg-primary/10 px-1.5 text-xs font-medium text-primary group-data-[collapsible=icon]:hidden">
                      {item.badge}
                    </span>
                  )}
                </a>
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
                          <SidebarMenuSubButton asChild className="h-9">
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        )})}
      </SidebarMenu>
    </SidebarGroup>
  )
}
