"use client"

import { EmptyState } from "@largence/components/empty-state"
import { ShieldCheck } from "lucide-react"

export default function CompliancePage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold font-heading">
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
  )
}
