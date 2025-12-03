"use client";

import { useOrganization, useOrganizationList, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * Hook for managing authentication and organization state
 */
export function useAuth() {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { userMemberships, setActive } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const isLoaded = userLoaded && orgLoaded;
  const hasOrganization = !!organization;

  return {
    user,
    organization,
    isLoaded,
    isSignedIn,
    hasOrganization,
    userMemberships: userMemberships?.data || [],
    setActive,
  };
}

/**
 * Hook for managing organization switching
 */
export function useOrganizationSwitch() {
  const { setActive } = useOrganizationList();
  const router = useRouter();

  const switchOrganization = async (orgId: string) => {
    if (!setActive) {
      throw new Error("setActive is not available");
    }

    try {
      await setActive({ organization: orgId });
      router.refresh();
      return true;
    } catch (error) {
      console.error("Failed to switch organization:", error);
      return false;
    }
  };

  return { switchOrganization };
}

/**
 * Hook for getting organization metadata
 */
export function useOrganizationMetadata() {
  const { organization } = useOrganization();

  const metadata = organization?.publicMetadata as {
    industry?: string;
    teamSize?: string;
    country?: string;
    useCase?: string;
    integrations?: string[];
    onboardedAt?: string;
  } | null;

  return {
    metadata,
    industry: metadata?.industry,
    teamSize: metadata?.teamSize,
    country: metadata?.country,
    useCase: metadata?.useCase,
    integrations: metadata?.integrations || [],
    onboardedAt: metadata?.onboardedAt,
  };
}

/**
 * Hook for requiring authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth(requireOrg = false) {
  const { isLoaded, isSignedIn, hasOrganization } = useAuth();
  const router = useRouter();

  if (isLoaded) {
    if (!isSignedIn) {
      router.push("/login");
      return { isReady: false };
    }

    if (requireOrg && !hasOrganization) {
      router.push("/onboarding");
      return { isReady: false };
    }
  }

  return {
    isReady: isLoaded && isSignedIn && (!requireOrg || hasOrganization),
  };
}
