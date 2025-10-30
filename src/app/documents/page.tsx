import { AppSidebar } from "@largence/components/app-sidebar"
import { SiteHeader } from "@largence/components/site-header"
import { EmptyState } from "@largence/components/empty-state"
import {
  SidebarInset,
  SidebarProvider,
} from "@largence/components/ui/sidebar"

export default function DocumentsPage() {
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
                  Documents
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage and organize your legal documents
                </p>
              </div>
              
              <EmptyState />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
