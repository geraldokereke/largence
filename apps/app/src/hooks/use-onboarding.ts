"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useOrganizationList } from "@clerk/nextjs";

export interface OnboardingFormData {
  // Company Information
  companyName: string;
  industry: string;
  country: string;
  website: string;
  companySize: string;

  // Logo
  logoUrl: string;
  logoFile: File | null;

  // Team & Use Case
  teamSize: string;
  useCase: string;

  // Contact & Billing
  billingEmail: string;
  phone: string;

  // Integrations
  integrations: string[];
}

const initialFormData: OnboardingFormData = {
  companyName: "",
  industry: "",
  country: "",
  website: "",
  companySize: "",
  logoUrl: "",
  logoFile: null,
  teamSize: "",
  useCase: "",
  billingEmail: "",
  phone: "",
  integrations: [],
};

export function useOnboarding() {
  const router = useRouter();
  const { user } = useUser();
  const { createOrganization, setActive } = useOrganizationList();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (updates: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const toggleIntegration = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      integrations: prev.integrations.includes(id)
        ? prev.integrations.filter((i) => i !== id)
        : [...prev.integrations, id],
    }));
  };

  const nextStep = () => {
    if (step < 7) {
      setStep((prev) => prev + 1);
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    setIsCompleting(true);
    setError(null);

    try {
      if (!createOrganization || !setActive) {
        throw new Error("Organization creation not available");
      }

      // Generate consistent slug for subdomain
      const slug = formData.companyName
        ? formData.companyName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
        : undefined;

      // Create organization with slug
      const organization = await createOrganization({
        name: formData.companyName || `${user?.firstName}'s Workspace`,
        slug: slug,
      });

      if (!organization) {
        throw new Error("Failed to create organization");
      }

      // Immediately set as active
      await setActive({ organization: organization.id });

      // Upload logo if provided
      let uploadedLogoUrl = formData.logoUrl;
      if (formData.logoFile) {
        try {
          const logoFormData = new FormData();
          logoFormData.append("file", formData.logoFile);

          const logoResponse = await fetch(
            `/api/organizations/${organization.id}/logo`,
            {
              method: "POST",
              body: logoFormData,
            },
          );

          if (logoResponse.ok) {
            const logoData = await logoResponse.json();
            uploadedLogoUrl = logoData.imageUrl;
          }
        } catch (logoErr) {
          console.warn("Failed to upload logo:", logoErr);
        }
      }

      // Update organization metadata
      try {
        await fetch(`/api/organizations/${organization.id}/metadata`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            industry: formData.industry,
            teamSize: formData.teamSize,
            companySize: formData.companySize,
            country: formData.country,
            website: formData.website,
            billingEmail: formData.billingEmail,
            phone: formData.phone,
            logoUrl: uploadedLogoUrl,
            useCase: formData.useCase,
            integrations: formData.integrations,
            onboardedAt: new Date().toISOString(),
          }),
        });
      } catch (metaErr) {
        console.warn("Failed to update metadata:", metaErr);
      }

      // Redirect to main app domain (not subdomain for now)
      // TODO: Enable subdomain redirect once wildcard domain is configured in Vercel
      const currentHost = window.location.host;
      const isLocalhost =
        currentHost.includes("localhost") || currentHost.includes("127.0.0.1");

      if (isLocalhost) {
        // For local development, redirect to main domain
        window.location.href = "/";
      } else {
        // For production, redirect to app subdomain (not org subdomain yet)
        // Once *.largence.com is working, change to: ${organization.slug}.largence.com
        window.location.href = "https://app.largence.com";
      }
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(
        err?.errors?.[0]?.message ||
          "Failed to complete setup. Please try again.",
      );
      setIsCompleting(false);
    }
  };

  return {
    step,
    formData,
    isCompleting,
    error,
    updateFormData,
    toggleIntegration,
    nextStep,
    previousStep,
    completeOnboarding,
  };
}
