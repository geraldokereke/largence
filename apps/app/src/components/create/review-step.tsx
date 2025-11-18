"use client"

import { Edit2 } from "lucide-react"
import { Button } from "@largence/components/ui/button"

interface ReviewStepProps {
  formData: {
    documentType: string
    documentName: string
    jurisdiction: string
    industry: string
    partyName: string
    partyEmail: string
    party2Name: string
    party2Email: string
    startDate: string
    duration: string
    compensationType: string
    compensationAmount: string
    specialClauses: string[]
    additionalNotes: string
  }
  documentTypes: Array<{
    id: string
    name: string
  }>
  onEdit: (step: number) => void
}

export function ReviewStep({ formData, documentTypes, onEdit }: ReviewStepProps) {
  const sections = [
    {
      title: "Document Type",
      step: 1,
      items: [
        {
          label: "Type",
          value: documentTypes.find((d) => d.id === formData.documentType)?.name || "Not specified",
        },
      ],
    },
    {
      title: "Basic Information",
      step: 2,
      items: [
        { label: "Document Name", value: formData.documentName || "Not specified" },
        { label: "Jurisdiction", value: formData.jurisdiction || "Not specified" },
        { label: "Industry", value: formData.industry || "Not specified" },
        { label: "Start Date", value: formData.startDate || "Not specified" },
        { label: "Duration", value: formData.duration || "Not specified" },
      ],
    },
    {
      title: "Party Details",
      step: 3,
      items: [
        { label: "First Party", value: formData.partyName || "Not specified" },
        ...(formData.partyEmail ? [{ label: "First Party Email", value: formData.partyEmail }] : []),
        { label: "Second Party", value: formData.party2Name || "Not specified" },
        ...(formData.party2Email ? [{ label: "Second Party Email", value: formData.party2Email }] : []),
        ...(formData.compensationType
          ? [
              { label: "Compensation Type", value: formData.compensationType },
              { label: "Compensation Amount", value: formData.compensationAmount || "Not specified" },
            ]
          : []),
      ],
    },
    {
      title: "Special Clauses & Notes",
      step: 4,
      items: [
        {
          label: "Special Clauses",
          value: formData.specialClauses.length > 0 ? formData.specialClauses.join(", ") : "None selected",
        },
        ...(formData.additionalNotes
          ? [{ label: "Additional Notes", value: formData.additionalNotes }]
          : []),
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 font-title">Review & Generate</h2>
        <p className="text-muted-foreground">
          Review your information before generating the document
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="border rounded-sm p-4 bg-muted/30">
            <div className="flex items-center justify-between mb-3 pb-3 border-b">
              <h3 className="font-semibold text-sm">{section.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(section.step)}
                className="h-8 px-3 text-xs"
              >
                <Edit2 className="h-3 w-3 mr-1.5" />
                Edit
              </Button>
            </div>
            <div className="space-y-2">
              {section.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start text-sm"
                >
                  <span className="text-muted-foreground font-medium min-w-40">
                    {item.label}:
                  </span>
                  <span className="text-foreground flex-1">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-sm bg-primary/5 border border-primary/20">
        <p className="text-sm text-foreground">
          <strong>Ready to generate?</strong> Your document will be created using AI based on
          the information provided. You'll be able to edit it after generation.
        </p>
      </div>
    </div>
  )
}
