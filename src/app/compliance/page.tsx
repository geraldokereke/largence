import { AppSidebar } from "@largence/components/app-sidebar"
import { SiteHeader } from "@largence/components/site-header"
import { EmptyState } from "@largence/components/empty-state"
import {
  SidebarInset,
  SidebarProvider,
} from "@largence/components/ui/sidebar"
import { ShieldCheck } from "lucide-react"

export default function CompliancePage() {
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
                  Compliance Center
                </h1>
                <p className="text-sm text-muted-foreground">
                  Monitor regulatory compliance and audit your documents
                </p>
              </div>
              
              <EmptyState 
                icon={ShieldCheck}
                title="No compliance audits yet"
                description="Start auditing your documents for compliance gaps, missing clauses, and regulatory alignment across NDPR, GDPR, CCPA, and African data protection laws."
                primaryAction={{ label: "Run Compliance Check" }}
                secondaryAction={{ label: "Upload for Audit" }}
                showTemplates={false}
              />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
