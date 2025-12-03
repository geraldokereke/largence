import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getOrCreateStripeCustomer,
  createCheckoutSession,
  getSubscription,
  getUsageStats,
  PLANS,
} from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";

// GET /api/billing - Get subscription and usage info
export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [subscription, usageStats] = await Promise.all([
      getSubscription(orgId),
      getUsageStats(orgId),
    ]);

    return NextResponse.json({
      subscription: subscription
        ? {
            id: subscription.id,
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            trialEnd: subscription.trialEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            maxTeamMembers: subscription.maxTeamMembers,
            maxContracts: subscription.maxContracts,
            maxStorage: subscription.maxStorage,
            features: {
              hasAiDrafting: subscription.hasAiDrafting,
              hasComplianceAuto: subscription.hasComplianceAuto,
              hasAnalytics: subscription.hasAnalytics,
              hasCustomTemplates: subscription.hasCustomTemplates,
              hasPrioritySupport: subscription.hasPrioritySupport,
              hasCustomIntegrations: subscription.hasCustomIntegrations,
            },
          }
        : null,
      usage: usageStats,
      plans: {
        STARTER: {
          name: PLANS.STARTER.name,
          price: PLANS.STARTER.price,
          maxTeamMembers: PLANS.STARTER.maxTeamMembers,
          maxContracts: PLANS.STARTER.maxContracts,
          maxStorage: PLANS.STARTER.maxStorage,
        },
        PROFESSIONAL: {
          name: PLANS.PROFESSIONAL.name,
          price: PLANS.PROFESSIONAL.price,
          maxTeamMembers: PLANS.PROFESSIONAL.maxTeamMembers,
          maxContracts: PLANS.PROFESSIONAL.maxContracts,
          maxStorage: PLANS.PROFESSIONAL.maxStorage,
        },
        ENTERPRISE: {
          name: PLANS.ENTERPRISE.name,
          price: PLANS.ENTERPRISE.price,
          maxTeamMembers: PLANS.ENTERPRISE.maxTeamMembers,
          maxContracts: PLANS.ENTERPRISE.maxContracts,
          maxStorage: PLANS.ENTERPRISE.maxStorage,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching billing info:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing info" },
      { status: 500 },
    );
  }
}

// POST /api/billing - Create checkout session
export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan || !["STARTER", "PROFESSIONAL", "ENTERPRISE"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Get user info for customer creation
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || "";
    const name = user?.fullName || "";

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(orgId, email, name);

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await createCheckoutSession(
      orgId,
      customerId,
      plan as "STARTER" | "PROFESSIONAL" | "ENTERPRISE",
      `${baseUrl}/account?tab=billing&success=true`,
      `${baseUrl}/account?tab=billing&canceled=true`,
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
