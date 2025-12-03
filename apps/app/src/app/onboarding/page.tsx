"use client";

import { useState, useEffect } from "react";
import { Button } from "@largence/components/ui/button";
import { Spinner } from "@largence/components/ui/spinner";
import Image from "next/image";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser, useOrganization, useOrganizationList } from "@clerk/nextjs";
import { useOnboarding } from "@largence/hooks/use-onboarding";
import { CompanyInfoStep } from "@largence/components/onboarding/company-info-step";
import { CompanyDetailsStep } from "@largence/components/onboarding/company-details-step";
import { TeamSizeStep } from "@largence/components/onboarding/team-size-step";
import { UseCaseStep } from "@largence/components/onboarding/use-case-step";
import { BillingContactStep } from "@largence/components/onboarding/billing-contact-step";
import { IntegrationsStep } from "@largence/components/onboarding/integrations-step";
import { ReviewStep } from "@largence/components/onboarding/review-step";

const onboardingSteps = [
  {
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    title: "Company Setup",
    description:
      "Tell us about your organization. We'll use this to customize templates and ensure compliance with your industry regulations.",
    features: ["Company profile", "Industry settings"],
  },
  {
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    title: "Company Details",
    description:
      "Specify your company size and location. This helps us provide region-specific templates and compliance frameworks.",
    features: ["Size & location", "Regional compliance"],
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    title: "Team Size",
    description:
      "Let us know your team size to recommend the right collaboration features and workflows for your organization.",
    features: ["Team planning", "Collaboration tools"],
  },
  {
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    title: "Use Case",
    description:
      "Share your primary use case so we can prioritize the right features and templates for your workflow.",
    features: ["Custom workflows", "Relevant templates"],
  },
  {
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    title: "Billing Contact",
    description:
      "Provide billing contact information for invoices and account management communications.",
    features: ["Secure billing", "Account management"],
  },
  {
    icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z",
    title: "Integrations",
    description:
      "Connect your favorite tools to streamline your legal workflow. You can always add more integrations later.",
    features: ["Tool connectivity", "Workflow automation"],
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Review & Complete",
    description:
      "Review your settings and complete your workspace setup. You're almost ready to start generating compliant documents!",
    features: ["Final review", "All set to go"],
  },
];

export default function OnboardingPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { userMemberships, isLoaded: membershipsLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Use the onboarding hook for all state management
  const {
    step,
    formData,
    isCompleting,
    error,
    updateFormData,
    toggleIntegration: hookToggleIntegration,
    nextStep,
    previousStep,
    completeOnboarding,
  } = useOnboarding();

  // Fix hydration mismatch by only rendering after client mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if user has existing organizations and redirect accordingly
  useEffect(() => {
    if (!userLoaded || !orgLoaded || !membershipsLoaded || !isClient) return;

    const hasMemberships =
      userMemberships?.data && userMemberships.data.length > 0;

    // If user already has an active organization, redirect to dashboard
    if (organization) {
      router.push("/");
      return;
    }

    // If user has memberships but no active org, redirect to workspace selector
    if (hasMemberships) {
      router.push("/workspace");
    }
  }, [
    userLoaded,
    orgLoaded,
    membershipsLoaded,
    isClient,
    userMemberships,
    organization,
    router,
  ]);

  // Don't render until client-side to avoid hydration mismatch
  if (!isClient || !userLoaded || !orgLoaded || !membershipsLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="sm" />
      </div>
    );
  }

  // Show loading while checking memberships
  if (userMemberships?.data && userMemberships.data.length > 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="sm" />
      </div>
    );
  }

  // Validation for each step
  const isStepValid = () => {
    switch (step) {
      case 1: // Company Info
        return formData.companyName && formData.industry;
      case 2: // Company Details
        return formData.companySize && formData.country;
      case 3: // Team Size
        return formData.teamSize;
      case 4: // Use Case
        return formData.useCase;
      case 5: // Billing & Contact
        return formData.billingEmail;
      case 6: // Integrations (optional)
        return true;
      case 7: // Review
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step < 7) {
      nextStep();
    } else {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    previousStep();
  };

  const toggleIntegration = (id: string) => {
    hookToggleIntegration(id);
  };

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
            <span className="text-xl font-semibold tracking-tight font-heading">
              Largence
            </span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold mb-2 font-display">
                Welcome
                {user?.firstName ? `, ${user.firstName}` : " to Largence"}
              </h1>
              <p className="text-muted-foreground">
                Let's get your workspace set up in a few simple steps
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-sm">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Step {step} of 7</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((step / 7) * 100)}% complete
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${(step / 7) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Components */}
            {step === 1 && (
              <CompanyInfoStep
                formData={formData}
                updateFormData={updateFormData}
              />
            )}

            {step === 2 && (
              <CompanyDetailsStep
                formData={formData}
                updateFormData={updateFormData}
              />
            )}

            {step === 3 && (
              <TeamSizeStep
                formData={formData}
                updateFormData={updateFormData}
              />
            )}

            {step === 4 && (
              <UseCaseStep
                formData={formData}
                updateFormData={updateFormData}
              />
            )}

            {step === 5 && (
              <BillingContactStep
                formData={formData}
                updateFormData={updateFormData}
              />
            )}

            {step === 6 && (
              <IntegrationsStep
                formData={formData}
                toggleIntegration={toggleIntegration}
              />
            )}

            {step === 7 && <ReviewStep formData={formData} />}

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
                disabled={isCompleting || !isStepValid()}
                className="flex-1 rounded-sm h-10 px-4"
              >
                {step === 7 ? (
                  isCompleting ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" />
                      Completing Setup...
                    </span>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle className="h-5 w-5" />
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

      {/* Right side - Onboarding guidance */}
      <div className="hidden lg:flex bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10" />

        {/* Decorative SVG Background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-pattern-onboarding"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#grid-pattern-onboarding)"
          />
        </svg>

        {/* Floating shapes */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative z-10 flex flex-col justify-center p-12 max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                Setup Progress
              </span>
              <span className="text-sm font-semibold text-primary">
                {Math.round((step / 7) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 7) * 100}%` }}
              />
            </div>
          </div>

          {/* Current step info */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Step {step} of 7
            </div>
            <h2 className="text-4xl font-bold mb-4 font-display leading-tight">
              {onboardingSteps[step - 1]?.title}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              {onboardingSteps[step - 1]?.description}
            </p>
          </div>

          {/* Helpful tips */}
          <div className="space-y-4 mb-12">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">
                  Don't worry about perfection
                </p>
                <p className="text-xs text-muted-foreground">
                  You can always update these settings later from your workspace
                  settings
                </p>
              </div>
            </div>

            {step === 7 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <svg
                    className="h-4 w-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Almost there!</p>
                  <p className="text-xs text-muted-foreground">
                    Review your settings and complete your workspace setup
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Platform stats */}
          <div className="pt-8 border-t border-border/40">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-medium">
              What you'll get
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-2xl font-bold text-primary font-display mb-1">
                  4
                </p>
                <p className="text-xs text-muted-foreground">
                  Countries supported
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary font-display mb-1">
                  AI
                </p>
                <p className="text-xs text-muted-foreground">
                  Powered drafting
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary font-display mb-1">
                  24/7
                </p>
                <p className="text-xs text-muted-foreground">Platform access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
