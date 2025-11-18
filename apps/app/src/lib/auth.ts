import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Get the current authenticated user on the server
 */
export async function getCurrentUser() {
  const user = await currentUser();
  return user;
}

/**
 * Require authentication on the server
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/login");
  }
  
  return userId;
}

/**
 * Require organization membership on the server
 * Redirects to onboarding if no organization
 */
export async function requireOrganization() {
  const { userId, orgId } = await auth();
  
  if (!userId) {
    redirect("/login");
  }
  
  if (!orgId) {
    redirect("/onboarding");
  }
  
  return { userId, orgId };
}

/**
 * Get organization metadata from Clerk
 */
export async function getOrganizationMetadata(orgId: string) {
  const { clerkClient } = await import("@clerk/nextjs/server");
  
  try {
    const client = await clerkClient();
    const org = await client.organizations.getOrganization({
      organizationId: orgId,
    });
    
    return org.publicMetadata as {
      industry?: string;
      teamSize?: string;
      country?: string;
      useCase?: string;
      integrations?: string[];
      onboardedAt?: string;
    };
  } catch (error) {
    console.error("Failed to get organization metadata:", error);
    return null;
  }
}

/**
 * Check if user has specific role in organization
 */
export async function hasRole(role: "org:admin" | "org:member") {
  const { orgRole } = await auth();
  return orgRole === role;
}

/**
 * Check if user is organization admin
 */
export async function isOrgAdmin() {
  return hasRole("org:admin");
}
