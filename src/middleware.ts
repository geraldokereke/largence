import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/api/webhooks(.*)",
  "/",
  "/auth/signup(.*)",
  "/auth/forgot-password(.*)",
  "/sso-callback(.*)",
]);

// Define routes that should redirect to onboarding if org is not set
const requiresOrgRoute = createRouteMatcher([
  "/documents(.*)",
  "/drafts(.*)",
  "/templates(.*)",
  "/compliance(.*)",
  "/audit(.*)",
  "/teams(.*)",
  "/integrations(.*)",
  "/create(.*)",
]);

// Extract subdomain from hostname
function getSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0];
  const parts = host.split('.');
  
  // For localhost or IP addresses, no subdomain
  if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null;
  }
  
  // Skip subdomain routing for main domains (largence.com, app.largence.com, www)
  if (parts.length === 2 || (parts.length === 3 && (parts[0] === 'www' || parts[0] === 'app'))) {
    return null;
  }
  
  // For subdomain.largence.com (3+ parts), return subdomain
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
}

// Get organization by slug
async function getOrgBySlug(slug: string) {
  try {
    const client = await clerkClient();
    const organizations = await client.organizations.getOrganizationList();
    return organizations.data.find(org => org.slug === slug);
  } catch (error) {
    console.error('Error fetching organization by slug:', error);
    return null;
  }
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, orgSlug, redirectToSignIn } = await auth();
  const hostname = req.headers.get('host') || '';
  const subdomain = getSubdomain(hostname);

  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to sign-in
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Redirect authenticated users away from login
  if (userId && req.nextUrl.pathname === "/login") {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }

  // Handle subdomain organization switching
  if (subdomain && userId) {
    if (orgSlug !== subdomain) {
      const targetOrg = await getOrgBySlug(subdomain);
      
      if (targetOrg) {
        const client = await clerkClient();
        const membership = await client.organizations.getOrganizationMembershipList({
          organizationId: targetOrg.id,
        });
        
        const isMember = membership.data.some(m => m.publicUserData?.userId === userId);
        
        if (isMember) {
          const url = new URL(req.url);
          url.searchParams.set('__clerk_org_switch', targetOrg.id);
          return NextResponse.redirect(url);
        } else {
          const url = new URL('/unauthorized', req.url);
          return NextResponse.redirect(url);
        }
      } else {
        const url = new URL('/not-found', req.url);
        return NextResponse.redirect(url);
      }
    }
  }

  // Redirect to onboarding if no organization is set for protected routes
  if (userId && !orgId && requiresOrgRoute(req)) {
    const url = new URL("/onboarding", req.url);
    return NextResponse.redirect(url);
  }

  // Redirect away from onboarding if user already has organization
  if (userId && orgId && req.nextUrl.pathname === "/onboarding") {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
