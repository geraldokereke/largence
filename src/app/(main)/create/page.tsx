"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@largence/components/ui/button";
import { ArrowRight, ArrowLeft, Sparkles, Users, Shield, Scale, Briefcase, Building2 } from "lucide-react";
import { CreateHeader } from "@largence/components/create/create-header";
import { EditorHeader } from "@largence/components/create/editor-header";
import { EditorToolbar } from "@largence/components/create/editor-toolbar";
import { DocumentTypeStep } from "@largence/components/create/document-type-step";
import { BasicInfoStep } from "@largence/components/create/basic-info-step";
import { PartyDetailsStep } from "@largence/components/create/party-details-step";
import { SpecialClausesStep } from "@largence/components/create/special-clauses-step";

const documentTypes = [
  { id: "employment", name: "Employment Contract", icon: Users },
  { id: "nda", name: "Non-Disclosure Agreement", icon: Shield },
  { id: "service", name: "Service Agreement", icon: Briefcase },
  { id: "privacy", name: "Privacy Policy", icon: Scale },
  { id: "board", name: "Board Resolution", icon: Building2 },
  { id: "consulting", name: "Consulting Agreement", icon: Briefcase },
];

const jurisdictions = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Egypt",
  "Tanzania",
  "United Kingdom",
  "Uganda",
  "Rwanda",
  "Ethiopia",
  "Côte d'Ivoire",
];

const industries = [
  "Technology & Software",
  "Financial Services",
  "Healthcare & Medical",
  "Legal Services",
  "Real Estate",
  "Manufacturing",
  "Retail & E-commerce",
  "Education",
  "Energy & Utilities",
  "Telecommunications",
];

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [formData, setFormData] = useState({
    documentType: "",
    documentName: "",
    jurisdiction: "",
    industry: "",
    partyName: "",
    partyEmail: "",
    startDate: "",
    duration: "",
    compensationType: "",
    compensationAmount: "",
    specialClauses: [] as string[],
    additionalNotes: "",
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 3000);
  };

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleClause = (clause: string) => {
    setFormData((prev) => ({
      ...prev,
      specialClauses: prev.specialClauses.includes(clause)
        ? prev.specialClauses.filter((c) => c !== clause)
        : [...prev.specialClauses, clause],
    }));
  };

  // If document is generated, show the editor
  if (isGenerated) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col z-50">
        <EditorHeader
          documentName={formData.documentName}
          documentType={documentTypes.find((d) => d.id === formData.documentType)?.name || ""}
          jurisdiction={formData.jurisdiction}
        />
        <EditorToolbar />

        <div className="flex-1 overflow-auto bg-muted/30 p-8">
          <div className="max-w-4xl mx-auto bg-card rounded-sm shadow-sm border min-h-full p-16">
            <div className="prose prose-slate max-w-none">
              <h1 className="text-3xl font-bold mb-6 font-display">
                {
                  documentTypes.find((d) => d.id === formData.documentType)
                    ?.name
                }
              </h1>

              <div className="mb-8 text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>Document Name:</strong> {formData.documentName}
                </p>
                <p>
                  <strong>Jurisdiction:</strong> {formData.jurisdiction}
                </p>
                <p>
                  <strong>Industry:</strong> {formData.industry}
                </p>
                <p>
                  <strong>Effective Date:</strong> {formData.startDate}
                </p>
              </div>

              <div className="h-px bg-border my-8" />

              <p className="mb-4">
                This{" "}
                {
                  documentTypes.find((d) => d.id === formData.documentType)
                    ?.name
                }{" "}
                ("Agreement") is entered into on {formData.startDate} between:
              </p>

              <p className="mb-4">
                <strong>Party A:</strong> {formData.partyName} (
                {formData.partyEmail})
              </p>

              <p className="mb-4">
                <strong>Party B:</strong> [Company Name] ("Company")
              </p>

              <div className="h-px bg-border my-8" />

              <h2 className="text-2xl font-semibold mb-4 font-heading">
                1. Purpose
              </h2>
              <p className="mb-6">
                This Agreement sets forth the terms and conditions under which
                the parties agree to collaborate in the {formData.industry}{" "}
                industry, subject to the laws and regulations of{" "}
                {formData.jurisdiction}.
              </p>

              <h2 className="text-2xl font-semibold mb-4 font-heading">
                2. Term and Duration
              </h2>
              <p className="mb-6">
                This Agreement shall commence on {formData.startDate} and
                continue for a period of {formData.duration || "[DURATION]"},
                unless terminated earlier in accordance with the provisions set
                forth herein.
              </p>

              {formData.compensationType && (
                <>
                  <h2 className="text-2xl font-semibold mb-4 font-heading">
                    3. Compensation
                  </h2>
                  <p className="mb-6">
                    The compensation structure is defined as{" "}
                    {formData.compensationType} in the amount of{" "}
                    {formData.compensationAmount || "[AMOUNT]"}, payable in
                    accordance with the payment schedule outlined in Appendix A.
                  </p>
                </>
              )}

              <h2 className="text-2xl font-semibold mb-4 font-heading">
                {formData.compensationType ? "4" : "3"}. Confidentiality
              </h2>
              <p className="mb-6">
                Both parties acknowledge that they may have access to
                confidential information and agree to maintain the
                confidentiality of such information during and after the term of
                this Agreement.
              </p>

              <h2 className="text-2xl font-semibold mb-4 font-heading">
                {formData.compensationType ? "5" : "4"}. Governing Law
              </h2>
              <p className="mb-6">
                This Agreement shall be governed by and construed in accordance
                with the laws of {formData.jurisdiction}, and any disputes
                arising hereunder shall be subject to the exclusive jurisdiction
                of the courts of {formData.jurisdiction}.
              </p>

              {formData.specialClauses.length > 0 && (
                <>
                  <h2 className="text-2xl font-semibold mb-4 font-heading">
                    {formData.compensationType ? "6" : "5"}. Special Provisions
                  </h2>
                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    {formData.specialClauses.map((clause, idx) => (
                      <li key={idx}>{clause}</li>
                    ))}
                  </ul>
                </>
              )}

              {formData.additionalNotes && (
                <>
                  <h2 className="text-2xl font-semibold mb-4 font-heading">
                    Additional Notes
                  </h2>
                  <p className="mb-6">{formData.additionalNotes}</p>
                </>
              )}

              <div className="h-px bg-border my-8" />

              <div className="grid grid-cols-2 gap-8 mt-12">
                <div>
                  <p className="font-semibold mb-2">Party A Signature</p>
                  <div className="border-t border-foreground pt-2">
                    <p>{formData.partyName}</p>
                    <p className="text-sm text-muted-foreground">
                      Date: _______________
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold mb-2">Party B Signature</p>
                  <div className="border-t border-foreground pt-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generation wizard
  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50">
      <CreateHeader />

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col items-center justify-center min-h-full p-8 bg-muted/30">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round((step / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-card rounded-sm border shadow-sm p-8">
          {/* Step 1: Document Type */}
          {step === 1 && (
            <DocumentTypeStep
              documentTypes={documentTypes}
              selectedType={formData.documentType}
              onSelect={(id) => updateFormData("documentType", id)}
            />
          )}

          {/* Step 2: Basic Information */}
          {step === 2 && (
            <BasicInfoStep
              formData={formData}
              jurisdictions={jurisdictions}
              industries={industries}
              onUpdate={updateFormData}
            />
          )}

          {/* Step 3: Party Details */}
          {step === 3 && (
            <PartyDetailsStep formData={formData} onUpdate={updateFormData} />
          )}

          {/* Step 4: Special Clauses */}
          {step === 4 && (
            <SpecialClausesStep
              formData={formData}
              onToggleClause={toggleClause}
              onUpdate={updateFormData}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="h-10 rounded-sm"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={
                (step === 1 && !formData.documentType) ||
                (step === 2 &&
                  (!formData.documentName ||
                    !formData.jurisdiction ||
                    !formData.industry))
              }
              className="h-10 rounded-sm"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-5 w-5 animate-pulse" />
                  Generating...
                </>
              ) : step === totalSteps ? (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Document
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
