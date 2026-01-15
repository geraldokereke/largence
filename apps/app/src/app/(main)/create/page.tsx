"use client";

import { useState, useEffect, useRef } from "react";
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
import { useOnboardingProgress } from "@largence/components/onboarding-checklist";
import { motion, AnimatePresence } from "framer-motion";
import { shouldShowField } from "@largence/lib/document-types";

const documentTypes = [
  { id: "employment", name: "Employment Contract", icon: Users },
  { id: "nda", name: "Non-Disclosure Agreement", icon: Shield },
  { id: "service", name: "Service Agreement", icon: Briefcase },
  { id: "consulting", name: "Consulting Agreement", icon: Briefcase },
  { id: "partnership", name: "Partnership Agreement", icon: Users },
  { id: "sales", name: "Sales Contract", icon: Scale },
  { id: "privacy", name: "Privacy Policy", icon: Shield },
  { id: "board", name: "Board Resolution", icon: Scale },
  { id: "crossborder", name: "Cross-Border Agreement", icon: Scale },
  { id: "lease", name: "Lease Agreement", icon: Scale },
  { id: "shareholder", name: "Shareholder Agreement", icon: Scale },
  { id: "vendor", name: "Vendor Agreement", icon: Briefcase },
  { id: "software", name: "Software License Agreement", icon: Briefcase },
  { id: "loan", name: "Loan Agreement", icon: Scale },
  { id: "dpa", name: "Data Processing Agreement", icon: Shield },
  { id: "franchise", name: "Franchise Agreement", icon: Scale },
  { id: "distribution", name: "Distribution Agreement", icon: Briefcase },
  { id: "website-terms", name: "Website Terms and Conditions", icon: Shield },
  { id: "internship", name: "Internship Agreement", icon: Users },
  { id: "freelance", name: "Freelance Contract", icon: Briefcase },
  { id: "mou", name: "Memorandum of Understanding", icon: Scale },
  { id: "poa", name: "Power of Attorney", icon: Scale },
  { id: "noncompete", name: "Non-Compete Agreement", icon: Shield },
  { id: "terms", name: "Terms of Service", icon: Shield },
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
  const [generationStep, setGenerationStep] = useState(0);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const upgradeModal = useUpgradeModal();
  
  // Generation timeline steps
  const generationSteps = [
    { label: "Analyzing requirements", description: "Understanding document parameters" },
    { label: "Reviewing jurisdiction", description: "Checking regional compliance standards" },
    { label: "Structuring framework", description: "Building legal document structure" },
    { label: "Drafting core clauses", description: "Writing essential provisions" },
    { label: "Adding details", description: "Incorporating party and industry specifics" },
    { label: "Finalizing document", description: "Polishing and formatting" },
  ];
  
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
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // Track if template creation has been attempted to prevent double execution
  const templateCreationAttempted = useRef(false);

  // Pre-select document type from query parameter or load template
  useEffect(() => {
    const type = searchParams.get("type");
    const templateId = searchParams.get("template");
    
    if (templateId && !templateCreationAttempted.current) {
      // Mark as attempted immediately to prevent double execution in StrictMode
      templateCreationAttempted.current = true;
      
      // Load template from API and create document
      setLoadingTemplate(true);
      fetch(`/api/templates/${templateId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Template not found");
          return res.json();
        })
        .then((data) => {
          // Create a new document from the template content
          return fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: `${data.template.name} - Copy`,
              content: data.template.content,
              documentType: data.template.documentType,
              jurisdiction: data.template.jurisdiction || "Nigeria",
              status: "DRAFT",
            }),
          });
        })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to create document");
          return res.json();
        })
        .then((data) => {
          toast.success("Document created from template");
          router.push(`/documents/${data.document.id}`);
        })
        .catch((err) => {
          console.error("Template load error:", err);
          toast.error("Failed to load template");
          setLoadingTemplate(false);
          // Reset the ref on error so user can retry
          templateCreationAttempted.current = false;
        });
    } else if (type) {
      setFormData((prev) => ({ ...prev, documentType: type }));
    }
  }, [searchParams, router]);

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
      // Only validate industry if it's shown for this document type
      const showIndustry = formData.documentType ? shouldShowField(formData.documentType, "industry") : true;
      if (showIndustry && !formData.industry) {
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
    setGenerationStep(0);
    
    // Start cycling through generation steps
    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev < generationSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);

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
            clearInterval(stepInterval);
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
      clearInterval(stepInterval);
      setGenerationStep(generationSteps.length); // Mark all complete
      setGeneratedContent(data.document.content);
      setDocumentId(data.documentId);
      setIsGenerated(true);
      toast.success("Document generated successfully", {
        description: "Your legal document has been created.",
      });
      
      // Mark onboarding item as complete
      if (typeof window !== "undefined") {
        localStorage.setItem("onboarding:created_document", "true");
        window.dispatchEvent(new CustomEvent("onboarding:progress"));
      }
    } catch (err: any) {
      clearInterval(stepInterval);
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

  // Redirect to document when generation is complete
  useEffect(() => {
    if (isGenerated && documentId) {
      router.push(`/documents/${documentId}`);
    }
  }, [isGenerated, documentId, router]);

  // If loading template, show loading state
  if (loadingTemplate) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full gap-3">
        <Spinner size="sm" />
        <p className="text-sm text-muted-foreground">Loading template...</p>
      </div>
    );
  }

  // If document is generated, show loading while redirecting
  if (isGenerated && documentId) {
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
        <div className="flex flex-col items-center justify-center min-h-full p-3 bg-muted/30">
          <div className="w-full max-w-xl">
            {/* Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Step {step} of {totalSteps}
                </span>
                <span className="text-xs font-medium text-primary">
                  {Math.round((step / totalSteps) * 100)}% Complete
                </span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Card */}
            <div className="bg-card rounded-sm border shadow-sm p-4">
              {/* Error Message */}
              {error && (
                <div className="mb-3 p-2 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {error}
                </div>
              )}

              {/* Step 1: Document Type */}
              {step === 1 && !isGenerating && (
                <DocumentTypeStep
                  documentTypes={documentTypes}
                  selectedType={formData.documentType}
                  onSelect={(id) => updateFormData("documentType", id)}
                />
              )}

              {/* Step 2: Basic Information */}
              {step === 2 && !isGenerating && (
                <BasicInfoStep
                  formData={formData}
                  documentType={formData.documentType}
                  jurisdictions={jurisdictions}
                  industries={industries}
                  onUpdate={updateFormData}
                  errors={errors}
                />
              )}

              {/* Step 3: Party Details */}
              {step === 3 && !isGenerating && (
                <PartyDetailsStep
                  formData={formData}
                  documentType={formData.documentType}
                  onUpdate={updateFormData}
                  errors={errors}
                />
              )}

              {/* Step 4: Special Clauses */}
              {step === 4 && !isGenerating && (
                <SpecialClausesStep
                  formData={formData}
                  documentType={formData.documentType}
                  onToggleClause={toggleClause}
                  onUpdate={updateFormData}
                />
              )}

              {/* Step 5: Review - Show timeline when generating */}
              {step === 5 && !isGenerating && (
                <ReviewStep
                  formData={formData}
                  documentTypes={documentTypes}
                  onEdit={(editStep) => setStep(editStep)}
                />
              )}
              
              {/* Generation Timeline */}
              {isGenerating && (
                <div className="py-2">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-1 font-title">
                      Generating Document
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Creating your {documentTypes.find(d => d.id === formData.documentType)?.name || 'document'}...
                    </p>
                  </div>
                  
                  <div className="relative">
                    {generationSteps.map((genStep, index) => {
                      const isCompleted = index < generationStep;
                      const isCurrent = index === generationStep;
                      const isPending = index > generationStep;
                      const isLast = index === generationSteps.length - 1;
                      
                      return (
                        <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
                          {/* Vertical line - positioned behind the dots */}
                          {!isLast && (
                            <div 
                              className={`absolute left-[7px] top-[18px] w-0.5 h-[calc(100%-6px)] ${
                                isCompleted ? "bg-primary" : "bg-border"
                              }`}
                            />
                          )}
                          
                          {/* Dot */}
                          <div className="relative z-10 flex-shrink-0">
                            <motion.div
                              animate={{ 
                                scale: isCurrent ? [1, 1.15, 1] : 1,
                              }}
                              transition={{ 
                                scale: { duration: 1, repeat: isCurrent ? Infinity : 0, ease: "easeInOut" },
                              }}
                              className={`w-[15px] h-[15px] rounded-full border-2 flex items-center justify-center ${
                                isCompleted 
                                  ? "bg-primary border-primary" 
                                  : isCurrent 
                                    ? "bg-primary/20 border-primary" 
                                    : "bg-background border-muted-foreground/30"
                              }`}
                            >
                              {isCompleted && (
                                <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {isCurrent && (
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              )}
                            </motion.div>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <motion.p
                              initial={{ opacity: 0.5 }}
                              animate={{ opacity: isPending ? 0.4 : 1 }}
                              className={`text-sm font-medium leading-tight ${
                                isCompleted ? "text-primary" : isCurrent ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {genStep.label}
                            </motion.p>
                            <AnimatePresence>
                              {(isCurrent || isCompleted) && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 0.7, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="text-xs text-muted-foreground mt-0.5"
                                >
                                  {genStep.description}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation */}
              {!isGenerating && (
                <div className="flex items-center justify-between mt-5 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={step === 1}
                    className="h-8 rounded-sm text-sm"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={step === 1 && !formData.documentType}
                    className="h-8 rounded-sm cursor-pointer text-sm"
                  >
                    {step === totalSteps ? (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Generate Document
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              )}
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
