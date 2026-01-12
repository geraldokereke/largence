"use client";

import { Check } from "lucide-react";
import { Label } from "@largence/components/ui/label";
import { getSuggestedClauses } from "@largence/lib/document-types";

interface SpecialClausesStepProps {
  formData: {
    specialClauses: string[];
    additionalNotes: string;
  };
  documentType?: string;
  onToggleClause: (clause: string) => void;
  onUpdate: (field: string, value: string) => void;
}

// Default clauses for fallback
const defaultClauses = [
  "Non-compete clause",
  "Intellectual property rights",
  "Termination provisions",
  "Force majeure clause",
  "Dispute resolution mechanism",
  "Data protection compliance",
];

export function SpecialClausesStep({
  formData,
  documentType,
  onToggleClause,
  onUpdate,
}: SpecialClausesStepProps) {
  // Get suggested clauses based on document type
  const clauses = documentType ? getSuggestedClauses(documentType) : defaultClauses;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 font-title">
          Special Clauses & Notes
        </h2>
        <p className="text-muted-foreground">
          Select special clauses to include in your document
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="mb-3 block">Recommended Clauses</Label>
          <div className="space-y-2">
            {clauses.map((clause) => (
              <button
                key={clause}
                onClick={() => onToggleClause(clause)}
                className={`w-full p-3 rounded-sm border text-left transition-all ${
                  formData.specialClauses.includes(clause)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-5 w-5 rounded-sm border-2 flex items-center justify-center shrink-0 ${
                      formData.specialClauses.includes(clause)
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
                  >
                    {formData.specialClauses.includes(clause) && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{clause}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
          <textarea
            id="additionalNotes"
            placeholder="Any additional requirements or specifications..."
            className="w-full min-h-24 px-3 py-2 rounded-sm border border-input bg-transparent mt-1.5 text-sm resize-none"
            value={formData.additionalNotes}
            onChange={(e) => onUpdate("additionalNotes", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
