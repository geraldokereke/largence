"use client"

import { useState } from "react"
import { AppSidebar } from "@largence/components/app-sidebar"
import { SiteHeader } from "@largence/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@largence/components/ui/sidebar"
import { Button } from "@largence/components/ui/button"
import { Input } from "@largence/components/ui/input"
import { Label } from "@largence/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@largence/components/ui/select"
import { 
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Building2,
  MapPin,
  Calendar,
  Users,
  Shield,
  Scale,
  Briefcase,
  Download,
  Share2,
  Clock,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Image as ImageIcon,
  Undo,
  Redo,
  Save
} from "lucide-react"

const documentTypes = [
  { id: "employment", name: "Employment Contract", icon: Users },
  { id: "nda", name: "Non-Disclosure Agreement", icon: Shield },
  { id: "service", name: "Service Agreement", icon: Briefcase },
  { id: "privacy", name: "Privacy Policy", icon: Scale },
  { id: "board", name: "Board Resolution", icon: Building2 },
  { id: "consulting", name: "Consulting Agreement", icon: Briefcase },
]

const jurisdictions = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Egypt",
  "Tanzania",
  "Uganda",
  "Rwanda",
  "Ethiopia",
  "Côte d'Ivoire",
]

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
]

export default function CreatePage() {
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
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
  })

  const totalSteps = 4

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleGenerate()
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false)
      setIsGenerated(true)
    }, 3000)
  }

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleClause = (clause: string) => {
    setFormData(prev => ({
      ...prev,
      specialClauses: prev.specialClauses.includes(clause)
        ? prev.specialClauses.filter(c => c !== clause)
        : [...prev.specialClauses, clause]
    }))
  }

  // If document is generated, show the editor
  if (isGenerated) {
    return (
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider defaultOpen={false} className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <div className="flex flex-1 flex-col">
                {/* Editor Header */}
                <div className="border-b bg-card px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-semibold font-(family-name:--font-general-sans)">
                        {formData.documentName || "Untitled Document"}
                      </h1>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Last saved 2 minutes ago</span>
                        </div>
                        <span>•</span>
                        <span>{documentTypes.find(d => d.id === formData.documentType)?.name}</span>
                        <span>•</span>
                        <span>{formData.jurisdiction}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="h-9 rounded-sm">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                      <Button variant="outline" className="h-9 rounded-sm">
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                      <Button className="h-9 rounded-sm">
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="border-b bg-card px-6 py-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm">
                      <Undo className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm">
                      <Redo className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-2" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm">
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm">
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm">
                      <Underline className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-2" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm">
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm">
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm">
                      <AlignRight className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-2" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm">
                      <List className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm">
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-2" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm">
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Editor Content */}
                <div className="flex-1 overflow-auto bg-muted/30 p-8">
                  <div className="max-w-4xl mx-auto bg-card rounded-sm shadow-sm border min-h-full p-16">
                    <div className="prose prose-slate max-w-none">
                      <h1 className="text-3xl font-bold mb-6 font-(family-name:--font-general-sans)">
                        {documentTypes.find(d => d.id === formData.documentType)?.name}
                      </h1>
                      
                      <div className="mb-8 text-sm text-muted-foreground space-y-1">
                        <p><strong>Document Name:</strong> {formData.documentName}</p>
                        <p><strong>Jurisdiction:</strong> {formData.jurisdiction}</p>
                        <p><strong>Industry:</strong> {formData.industry}</p>
                        <p><strong>Effective Date:</strong> {formData.startDate}</p>
                      </div>

                      <div className="h-px bg-border my-8" />

                      <p className="mb-4">
                        This {documentTypes.find(d => d.id === formData.documentType)?.name} ("Agreement") is entered into on {formData.startDate} between:
                      </p>

                      <p className="mb-4">
                        <strong>Party A:</strong> {formData.partyName} ({formData.partyEmail})
                      </p>

                      <p className="mb-4">
                        <strong>Party B:</strong> [Company Name] ("Company")
                      </p>

                      <div className="h-px bg-border my-8" />

                      <h2 className="text-2xl font-semibold mb-4 font-(family-name:--font-general-sans)">1. Purpose</h2>
                      <p className="mb-6">
                        This Agreement sets forth the terms and conditions under which the parties agree to collaborate in the {formData.industry} industry, 
                        subject to the laws and regulations of {formData.jurisdiction}.
                      </p>

                      <h2 className="text-2xl font-semibold mb-4 font-(family-name:--font-general-sans)">2. Term and Duration</h2>
                      <p className="mb-6">
                        This Agreement shall commence on {formData.startDate} and continue for a period of {formData.duration || "[DURATION]"}, 
                        unless terminated earlier in accordance with the provisions set forth herein.
                      </p>

                      {formData.compensationType && (
                        <>
                          <h2 className="text-2xl font-semibold mb-4 font-(family-name:--font-general-sans)">3. Compensation</h2>
                          <p className="mb-6">
                            The compensation structure is defined as {formData.compensationType} in the amount of {formData.compensationAmount || "[AMOUNT]"}, 
                            payable in accordance with the payment schedule outlined in Appendix A.
                          </p>
                        </>
                      )}

                      <h2 className="text-2xl font-semibold mb-4 font-(family-name:--font-general-sans)">
                        {formData.compensationType ? "4" : "3"}. Confidentiality
                      </h2>
                      <p className="mb-6">
                        Both parties acknowledge that they may have access to confidential information and agree to maintain the confidentiality 
                        of such information during and after the term of this Agreement.
                      </p>

                      <h2 className="text-2xl font-semibold mb-4 font-(family-name:--font-general-sans)">
                        {formData.compensationType ? "5" : "4"}. Governing Law
                      </h2>
                      <p className="mb-6">
                        This Agreement shall be governed by and construed in accordance with the laws of {formData.jurisdiction}, 
                        and any disputes arising hereunder shall be subject to the exclusive jurisdiction of the courts of {formData.jurisdiction}.
                      </p>

                      {formData.specialClauses.length > 0 && (
                        <>
                          <h2 className="text-2xl font-semibold mb-4 font-(family-name:--font-general-sans)">
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
                          <h2 className="text-2xl font-semibold mb-4 font-(family-name:--font-general-sans)">Additional Notes</h2>
                          <p className="mb-6">{formData.additionalNotes}</p>
                        </>
                      )}

                      <div className="h-px bg-border my-8" />

                      <div className="grid grid-cols-2 gap-8 mt-12">
                        <div>
                          <p className="font-semibold mb-2">Party A Signature</p>
                          <div className="border-t border-foreground pt-2">
                            <p>{formData.partyName}</p>
                            <p className="text-sm text-muted-foreground">Date: _______________</p>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold mb-2">Party B Signature</p>
                          <div className="border-t border-foreground pt-2">
                            <p>[Company Representative]</p>
                            <p className="text-sm text-muted-foreground">Date: _______________</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    )
  }

  // Generation wizard
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider defaultOpen={false} className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col items-center justify-center p-8 bg-muted/30">
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
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-semibold mb-2 font-(family-name:--font-general-sans)">
                          Choose Document Type
                        </h2>
                        <p className="text-muted-foreground">
                          Select the type of legal document you want to generate
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {documentTypes.map((type) => {
                          const Icon = type.icon
                          const isSelected = formData.documentType === type.id
                          return (
                            <button
                              key={type.id}
                              onClick={() => updateFormData("documentType", type.id)}
                              className={`relative p-4 rounded-sm border-2 text-left transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute top-2 right-2">
                                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                  </div>
                                </div>
                              )}
                              <Icon className={`h-6 w-6 mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                              <p className="font-medium text-sm">{type.name}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Basic Information */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-semibold mb-2 font-(family-name:--font-general-sans)">
                          Basic Information
                        </h2>
                        <p className="text-muted-foreground">
                          Provide the essential details for your document
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="documentName">Document Name</Label>
                          <Input
                            id="documentName"
                            placeholder="e.g., Senior Developer Employment Contract"
                            className="h-10 rounded-sm mt-1.5"
                            value={formData.documentName}
                            onChange={(e) => updateFormData("documentName", e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="jurisdiction">Jurisdiction</Label>
                            <Select
                              value={formData.jurisdiction}
                              onValueChange={(value) => updateFormData("jurisdiction", value)}
                            >
                              <SelectTrigger className="h-10 rounded-sm mt-1.5">
                                <SelectValue placeholder="Select jurisdiction" />
                              </SelectTrigger>
                              <SelectContent>
                                {jurisdictions.map((jurisdiction) => (
                                  <SelectItem key={jurisdiction} value={jurisdiction}>
                                    {jurisdiction}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="industry">Industry</Label>
                            <Select
                              value={formData.industry}
                              onValueChange={(value) => updateFormData("industry", value)}
                            >
                              <SelectTrigger className="h-10 rounded-sm mt-1.5">
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                              <SelectContent>
                                {industries.map((industry) => (
                                  <SelectItem key={industry} value={industry}>
                                    {industry}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                              id="startDate"
                              type="date"
                              className="h-10 rounded-sm mt-1.5"
                              value={formData.startDate}
                              onChange={(e) => updateFormData("startDate", e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="duration">Duration</Label>
                            <Input
                              id="duration"
                              placeholder="e.g., 12 months, 2 years"
                              className="h-10 rounded-sm mt-1.5"
                              value={formData.duration}
                              onChange={(e) => updateFormData("duration", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Party Details */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-semibold mb-2 font-(family-name:--font-general-sans)">
                          Party Details
                        </h2>
                        <p className="text-muted-foreground">
                          Enter information about the parties involved
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="partyName">Party Name</Label>
                          <Input
                            id="partyName"
                            placeholder="Full legal name"
                            className="h-10 rounded-sm mt-1.5"
                            value={formData.partyName}
                            onChange={(e) => updateFormData("partyName", e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="partyEmail">Party Email</Label>
                          <Input
                            id="partyEmail"
                            type="email"
                            placeholder="email@example.com"
                            className="h-10 rounded-sm mt-1.5"
                            value={formData.partyEmail}
                            onChange={(e) => updateFormData("partyEmail", e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="compensationType">Compensation Type</Label>
                            <Select
                              value={formData.compensationType}
                              onValueChange={(value) => updateFormData("compensationType", value)}
                            >
                              <SelectTrigger className="h-10 rounded-sm mt-1.5">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly Salary</SelectItem>
                                <SelectItem value="annual">Annual Salary</SelectItem>
                                <SelectItem value="hourly">Hourly Rate</SelectItem>
                                <SelectItem value="fixed">Fixed Fee</SelectItem>
                                <SelectItem value="commission">Commission Based</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="compensationAmount">Amount</Label>
                            <Input
                              id="compensationAmount"
                              placeholder="e.g., $5,000, ₦500,000"
                              className="h-10 rounded-sm mt-1.5"
                              value={formData.compensationAmount}
                              onChange={(e) => updateFormData("compensationAmount", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Special Clauses */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-semibold mb-2 font-(family-name:--font-general-sans)">
                          Special Clauses & Notes
                        </h2>
                        <p className="text-muted-foreground">
                          Select special clauses to include in your document
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="mb-3 block">Special Clauses</Label>
                          <div className="space-y-2">
                            {[
                              "Non-compete clause",
                              "Intellectual property rights",
                              "Termination provisions",
                              "Force majeure clause",
                              "Dispute resolution mechanism",
                              "Data protection compliance",
                            ].map((clause) => (
                              <button
                                key={clause}
                                onClick={() => toggleClause(clause)}
                                className={`w-full p-3 rounded-sm border text-left transition-all ${
                                  formData.specialClauses.includes(clause)
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`h-5 w-5 rounded-sm border-2 flex items-center justify-center shrink-0 ${
                                    formData.specialClauses.includes(clause)
                                      ? "border-primary bg-primary"
                                      : "border-border"
                                  }`}>
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
                            className="w-full min-h-24 px-3 py-2 rounded-sm border border-input bg-background mt-1.5 text-sm resize-none"
                            value={formData.additionalNotes}
                            onChange={(e) => updateFormData("additionalNotes", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
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
                        (step === 2 && (!formData.documentName || !formData.jurisdiction || !formData.industry))
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
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
