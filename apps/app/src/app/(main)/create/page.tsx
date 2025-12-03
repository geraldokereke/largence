"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@largence/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Users,
  Shield,
  Scale,
  Briefcase,
} from "lucide-react";
import { CreateHeader } from "@largence/components/create/create-header";
import { DocumentTypeStep } from "@largence/components/create/document-type-step";
import { BasicInfoStep } from "@largence/components/create/basic-info-step";
import { PartyDetailsStep } from "@largence/components/create/party-details-step";
import { SpecialClausesStep } from "@largence/components/create/special-clauses-step";
import { ReviewStep } from "@largence/components/create/review-step";
import { Spinner } from "@largence/components/ui/spinner";
import { UpgradeModal } from "@largence/components/upgrade-modal";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";

const documentTypes = [
  { id: "employment", name: "Employment Contract", icon: Users },
  { id: "nda", name: "Non-Disclosure Agreement", icon: Shield },
  { id: "service", name: "Service Agreement", icon: Briefcase },
  { id: "consulting", name: "Consulting Agreement", icon: Briefcase },
  { id: "partnership", name: "Partnership Agreement", icon: Users },
  { id: "sales", name: "Sales Contract", icon: Scale },
];

const jurisdictions = [
  "Nigeria",
  "Ghana",
  "Cameroon",
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
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const upgradeModal = useUpgradeModal();
  const [formData, setFormData] = useState({
    documentType: "",
    documentName: "",
    jurisdiction: "",
    industry: "",
    partyName: "",
    partyEmail: "",
    party2Name: "",
    party2Email: "",
    startDate: "",
    endDate: "",
    duration: "",
    compensationType: "",
    compensationAmount: "",
    specialClauses: [] as string[],
    additionalNotes: "",
  });
  const [errors, setErrors] = useState<{
    documentName?: string;
    jurisdiction?: string;
    industry?: string;
    startDate?: string;
    partyName?: string;
    party2Name?: string;
  }>({});

  // Pre-select document type from query parameter
  useEffect(() => {
    const type = searchParams.get("type");
    if (type) {
      setFormData((prev) => ({ ...prev, documentType: type }));
    }
  }, [searchParams]);

  const totalSteps = 5; // Added review step

  const validateStep = (currentStep: number): boolean => {
    const newErrors: typeof errors = {};

    if (currentStep === 2) {
      if (!formData.documentName.trim()) {
        newErrors.documentName = "Document name is required";
      }
      if (!formData.jurisdiction) {
        newErrors.jurisdiction = "Jurisdiction is required";
      }
      if (!formData.industry) {
        newErrors.industry = "Industry is required";
      }
      if (!formData.startDate) {
        newErrors.startDate = "Start date is required";
      }
    }

    if (currentStep === 3) {
      if (!formData.partyName.trim()) {
        newErrors.partyName = "First party name is required";
      }
      if (!formData.party2Name.trim()) {
        newErrors.party2Name = "Second party name is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step < totalSteps) {
      // Validate current step before proceeding
      if (validateStep(step)) {
        setStep(step + 1);
        setErrors({});
      }
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Build comprehensive instructions from form data
      const additionalInstructions = `
Document Name: ${formData.documentName}
Industry: ${formData.industry}
Effective Date: ${formData.startDate}
Duration: ${formData.duration || "Not specified"}

PARTIES INVOLVED:
Party 1 (First Party): ${formData.partyName}${formData.partyEmail ? ` (${formData.partyEmail})` : ""}
Party 2 (Second Party): ${formData.party2Name || "[Company Name]"}${formData.party2Email ? ` (${formData.party2Email})` : ""}

COMPENSATION TERMS:
${formData.compensationType ? `Type: ${formData.compensationType}` : "Not specified"}
${formData.compensationAmount ? `Amount: ${formData.compensationAmount}` : ""}

SPECIAL CLAUSES TO INCLUDE:
${formData.specialClauses.length > 0 ? formData.specialClauses.map((c) => `- ${c}`).join("\n") : "None specified"}

ADDITIONAL REQUIREMENTS:
${formData.additionalNotes || "None"}

Please generate a comprehensive, legally sound document with:
- Professional formatting and structure
- Clear section headings and numbering
- All standard clauses for this document type
- Specific provisions for ${formData.jurisdiction} jurisdiction
- Industry-specific considerations for ${formData.industry}
- Signature blocks for both parties
      `.trim();

      const response = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: documentTypes.find(
            (d) => d.id === formData.documentType,
          )?.name,
          jurisdiction: formData.jurisdiction,
          parties: {
            party1: formData.partyName || "Party A",
            party2: formData.party2Name || "[Company Name]",
          },
          additionalInstructions,
        }),
      });

      if (!response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();

          // Handle payment required - show upgrade modal
          if (response.status === 402 || data.requiresUpgrade) {
            upgradeModal.openUpgradeModal({
              reason: data.error,
              feature: "document",
              currentPlan: data.currentPlan,
            });
            setIsGenerating(false);
            return;
          }

          throw new Error(data.error || "Failed to generate document");
        } else {
          // Non-JSON response (likely HTML error page)
          const text = await response.text();
          console.error("Non-JSON response:", text);
          throw new Error(
            `Server error: ${response.status} ${response.statusText}`,
          );
        }
      }

      const data = await response.json();
      setGeneratedContent(data.document.content);
      setDocumentId(data.documentId);
      setIsGenerated(true);
      toast.success("Document generated successfully", {
        description: "Your legal document has been created.",
      });
    } catch (err: any) {
      console.error("Generate error:", err);
      setError(err.message || "Failed to generate document. Please try again.");
      toast.error("Failed to generate document", {
        description:
          err.message || "Please check your information and try again.",
      });
    } finally {
      setIsGenerating(false);
    }
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
  if (isGenerated && documentId) {
    // Redirect to the document editor page
    router.push(`/documents/${documentId}`);
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Spinner size="sm" />
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
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

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
                  errors={errors}
                />
              )}

              {/* Step 3: Party Details */}
              {step === 3 && (
                <PartyDetailsStep
                  formData={formData}
                  onUpdate={updateFormData}
                  errors={errors}
                />
              )}

              {/* Step 4: Special Clauses */}
              {step === 4 && (
                <SpecialClausesStep
                  formData={formData}
                  onToggleClause={toggleClause}
                  onUpdate={updateFormData}
                />
              )}

              {/* Step 5: Review */}
              {step === 5 && (
                <ReviewStep
                  formData={formData}
                  documentTypes={documentTypes}
                  onEdit={(editStep) => setStep(editStep)}
                />
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1 || isGenerating}
                  className="h-10 rounded-sm"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={
                    isGenerating || (step === 1 && !formData.documentType)
                  }
                  className="h-10 rounded-sm cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      Generating
                      <Spinner size="sm" variant="white" />
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

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={upgradeModal.closeUpgradeModal}
        reason={upgradeModal.reason}
        feature={upgradeModal.feature}
        currentPlan={upgradeModal.currentPlan}
      />
    </div>
  );
}
