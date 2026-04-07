"use client";

import { useState, useEffect } from "react";
import { Button } from "@largence/components/ui/button";
import { Spinner } from "@largence/components/ui/spinner";
import Image from "next/image";
import { AuthMarketingPanel } from "@largence/components/auth-marketing-panel";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser, useOrganization, useOrganizationList } from "@clerk/nextjs";
import { useOnboarding } from "@largence/hooks/use-onboarding";
import { billingContactSchema } from "@largence/lib/validations/onboarding.schema";
import { CompanyInfoStep } from "@largence/components/onboarding/company-info-step";
import { CompanyDetailsStep } from "@largence/components/onboarding/company-details-step";
import { TeamSizeStep } from "@largence/components/onboarding/team-size-step";
import { UseCaseStep } from "@largence/components/onboarding/use-case-step";
import { BillingContactStep } from "@largence/components/onboarding/billing-contact-step";
import { IntegrationsStep } from "@largence/components/onboarding/integrations-step";
import { DataResidencyStep } from "@largence/components/onboarding/data-residency-step";
import { AccessCodeStep } from "@largence/components/onboarding/access-code-step";
import { ReviewStep } from "@largence/components/onboarding/review-step";

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  const totalSteps = 9;

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
        // Only validate when user tries to proceed, not on every render
        if (Object.keys(fieldErrors).length > 0) {
          return false;
        }
        return formData.billingEmail;
      case 6: // Data Residency
        return formData.dataRegion;
      case 7: // Integrations (optional)
        return true;
      case 8: // Access Code (optional)
        return true;
      case 9: // Review
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    // Validate step 5 (Billing & Contact) before proceeding
    if (step === 5) {
      const billingData = {
        billingEmail: formData.billingEmail || "",
        phone: formData.phone || "",
      };
      const result = billingContactSchema.safeParse(billingData);
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        setFieldErrors(errors);
        return; // Don't proceed if validation fails
      }
      setFieldErrors({}); // Clear errors if validation passes
    }

    if (step < totalSteps) {
      nextStep();
    } else {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    // Clear field errors when leaving step 5
    if (step === 5) {
      setFieldErrors({});
    }
    previousStep();
  };

  const toggleIntegration = (id: string) => {
    hookToggleIntegration(id);
  };

  return (
    <div className="min-h-svh w-full flex flex-col lg:grid lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-4 sm:p-6 md:p-8 lg:p-10 lg:h-svh scrollbar-hide overflow-y-auto">
        <div className="flex justify-center gap-2 md:justify-start shrink-0 scrollbar-hide">
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

        <div className="flex-1 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center py-4">
            <div className="w-full max-w-md">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-1 font-display">
                  Welcome
                  {user?.firstName ? `, ${user.firstName}` : " to Largence"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Let's get your workspace set up in a few simple steps
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-sm">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Progress Steps */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium">Step {step} of {totalSteps}</span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round((step / totalSteps) * 100)}% complete
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
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
                fieldErrors={fieldErrors}
              />
            )}

            {step === 6 && (
              <DataResidencyStep
                formData={formData}
                updateFormData={updateFormData}
              />
            )}

            {step === 7 && (
              <IntegrationsStep
                formData={formData}
                toggleIntegration={toggleIntegration}
              />
            )}

            {step === 8 && (
              <AccessCodeStep
                accessCode={formData.accessCode}
                onAccessCodeChange={(code) => updateFormData({ accessCode: code })}
              />
            )}

            {step === 9 && <ReviewStep formData={formData} />}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isCompleting}
                  className="rounded-sm h-9 px-4"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={isCompleting || !isStepValid()}
                className="flex-1 rounded-sm h-9 px-4"
              >
                {step === totalSteps ? (
                  isCompleting ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" />
                      Completing Setup...
                    </span>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle className="h-4 w-4" />
                    </>
                  )
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              You can always change these settings later
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* Right side - Brand panel */}
      <AuthMarketingPanel grainId="onboarding-grain" />
    </div>
  );
}
