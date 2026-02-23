import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/api/webhooks(.*)",
  "/",
  "/auth/signup(.*)",
  "/auth/forgot-password(.*)",
  "/sso-callback(.*)",
]);

const authOnlyRoutes = createRouteMatcher([
  "/onboarding(.*)",
  "/workspace(.*)",
]);

const requiresOrgRoute = createRouteMatcher([
  "/account(.*)",
  "/analytics(.*)",
  "/audit(.*)",
  "/clauses(.*)",
  "/compliance(.*)",
  "/create(.*)",
  "/documents(.*)",
  "/drafts(.*)",
  "/integrations(.*)",
  "/matters(.*)",
  "/messages(.*)",
  "/teams(.*)",
  "/templates(.*)",
  "/", // Main dashboard
]);

function getSubdomain(hostname: string): string | null {
  const host = hostname.split(":")[0];
  const parts = host.split(".");

  if (host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null;
  }

  if (
    parts.length === 2 ||
    (parts.length === 3 && (parts[0] === "www" || parts[0] === "app"))
  ) {
    return null;
  }

  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

async function getOrgBySlug(slug: string) {
  try {
    const client = await clerkClient();
    const organizations = await client.organizations.getOrganizationList();
    return organizations.data.find((org) => org.slug === slug);
  } catch (error) {
    console.error("Error fetching organization by slug:", error);
    return null;
  }
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, orgSlug, redirectToSignIn } = await auth();
  const hostname = req.headers.get("host") || "";
  const subdomain = getSubdomain(hostname);

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  if (authOnlyRoutes(req)) {
    return NextResponse.next();
  }

  if (userId && req.nextUrl.pathname === "/login") {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }

  if (subdomain && userId) {
    if (orgSlug !== subdomain) {
      const targetOrg = await getOrgBySlug(subdomain);

      if (targetOrg) {
        const client = await clerkClient();
        const membership =
          await client.organizations.getOrganizationMembershipList({
            organizationId: targetOrg.id,
          });

        const isMember = membership.data.some(
          (m) => m.publicUserData?.userId === userId,
        );

        if (isMember) {
          const url = new URL(req.url);
          url.searchParams.set("__clerk_org_switch", targetOrg.id);
          return NextResponse.redirect(url);
        } else {
          const url = new URL("/unauthorized", req.url);
          return NextResponse.redirect(url);
        }
      } else {
        const url = new URL("/not-found", req.url);
        return NextResponse.redirect(url);
      }
    }
  }

  if (userId && !orgId && requiresOrgRoute(req)) {
    const url = new URL("/workspace", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
