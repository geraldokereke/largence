"use client"

import { Button } from "@largence/components/ui/button"
import { Input } from "@largence/components/ui/input"
import { Label } from "@largence/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@largence/components/ui/select"
import { Spinner } from "@largence/components/ui/spinner"
import { motion } from "framer-motion"
import Image from "next/image"
import { Building2, Users, Briefcase, ArrowRight, CheckCircle2, Check } from "lucide-react"
import { SiNotion, SiGoogledrive, SiDropbox, SiSlack } from "react-icons/si"
import { FaFileSignature, FaMicrosoft } from "react-icons/fa"
import { useState } from "react"
import { useRouter } from "next/navigation"

const onboardingSteps = [
  {
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    title: "Company Setup",
    description: "Set up your organization profile with details about your company, industry, and legal requirements.",
    features: ["Company profile", "Industry settings"],
    animationClass: "animate-text-fade-1",
    opacity: "opacity-100"
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    title: "Invite Your Team",
    description: "Collaborate seamlessly by inviting team members with role-based access control and permissions.",
    features: ["Role management", "Team collaboration"],
    animationClass: "animate-text-fade-2",
    opacity: "opacity-0"
  },
  {
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    title: "Configure Templates",
    description: "Choose from jurisdiction-specific templates or import your existing documents for AI enhancement.",
    features: ["Template library", "Custom imports"],
    animationClass: "animate-text-fade-3",
    opacity: "opacity-0"
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Compliance Setup",
    description: "Select your regulatory frameworks and compliance requirements across jurisdictions.",
    features: ["Regulatory alignment", "Compliance tracking"],
    animationClass: "animate-text-fade-4",
    opacity: "opacity-0"
  }
]

const industries = [
  "Technology & Software",
  "Financial Services",
  "Healthcare & Pharmaceuticals",
  "Legal Services",
  "Manufacturing",
  "Retail & E-commerce",
  "Real Estate",
  "Energy & Utilities",
  "Telecommunications",
  "Education",
  "Consulting",
  "Other"
]

const countries = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Egypt",
  "Morocco",
  "Rwanda",
  "Tanzania",
  "Uganda",
  "Senegal",
  "Côte d'Ivoire",
  "Ethiopia",
  "Other"
]

const integrations = [
  { id: "notion", name: "Notion", icon: SiNotion, description: "Sync documents to Notion" },
  { id: "google-drive", name: "Google Drive", icon: SiGoogledrive, description: "Save to Google Drive" },
  { id: "dropbox", name: "Dropbox", icon: SiDropbox, description: "Backup to Dropbox" },
  { id: "slack", name: "Slack", icon: SiSlack, description: "Notifications in Slack" },
  { id: "microsoft-teams", name: "Microsoft Teams", icon: FaMicrosoft, description: "Collaborate in Teams" },
  { id: "docusign", name: "DocuSign", icon: FaFileSignature, description: "E-signature integration" },
]

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
  </svg>
)

const FeatureSlide = ({ feature, index }: { feature: typeof onboardingSteps[0], index: number }) => (
  <div className={`absolute inset-0 ${feature.opacity} transition-opacity duration-500 ${feature.animationClass}`}>
    <div className="bg-white/5 backdrop-blur-sm rounded-sm p-8 border border-white/10 h-full flex flex-col justify-between shadow-xl">
      <div>
        <div className="flex items-center space-x-4 mb-5">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-sm flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
            </svg>
          </div>
          <h3 className="text-white text-2xl font-semibold tracking-tight font-(family-name:--font-general-sans)">{feature.title}</h3>
        </div>
        <p className="text-slate-300 leading-relaxed text-base">{feature.description}</p>
      </div>
      <div className="flex items-center gap-6 text-sm text-slate-400 mt-6 pt-4 border-t border-white/5">
        {feature.features.map((item, idx) => (
          <span key={idx} className="flex items-center gap-2">
            <CheckIcon />
            {item}
          </span>
        ))}
      </div>
    </div>
  </div>
)

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isCompleting, setIsCompleting] = useState(false)
  const router = useRouter()
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    teamSize: "",
    country: "",
    useCase: "",
    integrations: [] as string[]
  })

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1)
    } else {
      // Complete onboarding and navigate to home
      setIsCompleting(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      router.push("/")
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const toggleIntegration = (id: string) => {
    setFormData({
      ...formData,
      integrations: formData.integrations.includes(id)
        ? formData.integrations.filter(i => i !== id)
        : [...formData.integrations, id]
    })
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <Image 
              src="/logo.png" 
              alt="Largence Logo" 
              width={32} 
              height={32}
              className="shrink-0"
            />
            <span className="text-xl font-semibold tracking-tight font-(family-name:--font-general-sans)">Largence</span>
          </a>
        </div>
        
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold mb-2 font-(family-name:--font-general-sans)">
                Welcome to Largence
              </h1>
              <p className="text-muted-foreground">
                Let's get your workspace set up in a few simple steps
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Step {step} of 5</span>
                <span className="text-sm text-muted-foreground">{Math.round((step / 5) * 100)}% complete</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Step 1: Company Information */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Corporation"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="h-10 rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                    <SelectTrigger className="h-10 rounded-sm">
                      <SelectValue placeholder="Select your industry" />
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
                <div className="space-y-2">
                  <Label htmlFor="country">Primary Country</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                    <SelectTrigger className="h-10 rounded-sm">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {/* Step 2: Team Size */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <Label>How large is your team?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["1-10", "11-50", "51-200", "200+"].map((size) => (
                      <button
                        key={size}
                        onClick={() => setFormData({ ...formData, teamSize: size })}
                        className={`p-4 rounded-sm border-2 transition-all ${
                          formData.teamSize === size
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Users className="h-6 w-6 mb-2 mx-auto" />
                        <p className="text-sm font-medium">{size} people</p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Use Case */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <Label>What will you primarily use Largence for?</Label>
                  <div className="space-y-3">
                    {[
                      { id: "contracts", icon: Briefcase, label: "Contract Management", desc: "Draft and manage legal contracts" },
                      { id: "compliance", icon: CheckCircle2, label: "Compliance Tracking", desc: "Monitor regulatory compliance" },
                      { id: "governance", icon: Building2, label: "Corporate Governance", desc: "Document lifecycle management" }
                    ].map((useCase) => (
                      <button
                        key={useCase.id}
                        onClick={() => setFormData({ ...formData, useCase: useCase.id })}
                        className={`w-full p-4 rounded-sm border-2 transition-all text-left flex items-start gap-3 ${
                          formData.useCase === useCase.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <useCase.icon className={`h-5 w-5 mt-0.5 ${formData.useCase === useCase.id ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="flex-1">
                          <p className="font-medium">{useCase.label}</p>
                          <p className="text-sm text-muted-foreground">{useCase.desc}</p>
                        </div>
                        {formData.useCase === useCase.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Integrations */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div>
                    <Label>Which apps would you like to integrate?</Label>
                    <p className="text-sm text-muted-foreground mt-1">Select all that apply</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {integrations.map((integration) => {
                      const Icon = integration.icon
                      return (
                        <button
                          key={integration.id}
                          onClick={() => toggleIntegration(integration.id)}
                          className={`p-4 rounded-sm border-2 transition-all text-left ${
                            formData.integrations.includes(integration.id)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className={`p-2 rounded-sm ${
                              formData.integrations.includes(integration.id)
                                ? "bg-primary/10"
                                : "bg-muted"
                            }`}>
                              <Icon className={`h-5 w-5 ${
                                formData.integrations.includes(integration.id)
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`} />
                            </div>
                            {formData.integrations.includes(integration.id) && (
                              <Check className="h-5 w-5 text-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-sm font-medium mb-1">{integration.name}</p>
                          <p className="text-xs text-muted-foreground">{integration.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <Label>Review your information</Label>
                  <div className="rounded-sm border p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Company</span>
                      <span className="text-sm font-medium">{formData.companyName || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Industry</span>
                      <span className="text-sm font-medium">{formData.industry || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Country</span>
                      <span className="text-sm font-medium">{formData.country || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Team Size</span>
                      <span className="text-sm font-medium">{formData.teamSize || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Primary Use Case</span>
                      <span className="text-sm font-medium capitalize">{formData.useCase || "Not set"}</span>
                    </div>
                    {formData.integrations.length > 0 && (
                      <div className="pt-2 border-t">
                        <span className="text-sm text-muted-foreground block mb-2">Integrations</span>
                        <div className="flex flex-wrap gap-2">
                          {formData.integrations.map((id) => {
                            const integration = integrations.find(i => i.id === id)
                            if (!integration) return null
                            const Icon = integration.icon
                            return (
                              <span key={id} className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2 py-1.5 rounded-sm">
                                <Icon className="h-3.5 w-3.5" />
                                {integration.name}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isCompleting}
                  className="rounded-sm h-10 px-4"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={isCompleting}
                className="flex-1 rounded-sm h-10 px-4"
              >
                {step === 5 ? (
                  isCompleting ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" />
                      Completing Setup...
                    </span>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle2 className="h-5 w-5" />
                    </>
                  )
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              You can always change these settings later
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Mirroring Login Page */}
      <div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>

        <div className="absolute inset-0 flex flex-col p-12 lg:p-16">
          <div className="flex-1 flex flex-col justify-center max-w-xl">
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-5xl lg:text-6xl font-semibold text-white mb-6 leading-tight tracking-tight font-(family-name:--font-general-sans)"
            >
              Get Started in Minutes
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-xl text-slate-300 leading-relaxed mb-12"
            >
              <span className="font-semibold">Set up</span> your workspace, 
              <span className="font-semibold"> invite</span> your team, and 
              <span className="font-semibold"> start</span> generating compliant legal documents 
              with <span className="font-semibold">AI-powered intelligence</span> tailored for 
              <span className="font-semibold"> African markets</span>.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="relative h-72 mb-8 overflow-hidden"
            >
              {onboardingSteps.map((feature, index) => (
                <FeatureSlide key={index} feature={feature} index={index} />
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center gap-2"
            >
              <div className="w-12 h-1 rounded-full bg-emerald-400/60 animate-progress-1"></div>
              <div className="w-12 h-1 rounded-full bg-white/10 animate-progress-2"></div>
              <div className="w-12 h-1 rounded-full bg-white/10 animate-progress-3"></div>
              <div className="w-12 h-1 rounded-full bg-white/10 animate-progress-4"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
