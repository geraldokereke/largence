import { AppSidebar } from "@largence/components/app-sidebar"
import { SiteHeader } from "@largence/components/site-header"
import { EmptyState } from "@largence/components/empty-state"
import {
  SidebarInset,
  SidebarProvider,
} from "@largence/components/ui/sidebar"
import { Brain } from "lucide-react"

export default function DraftsPage() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider defaultOpen={false} className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="mb-2">
                <h1 className="text-2xl font-semibold font-(family-name:--font-general-sans)">
                  AI Drafts
                </h1>
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
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
