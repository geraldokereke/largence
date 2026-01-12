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
        FREE: {
          name: PLANS.FREE.name,
          monthlyPrice: PLANS.FREE.monthlyPrice,
          maxTeamMembers: PLANS.FREE.maxTeamMembers,
          maxDocuments: PLANS.FREE.maxDocuments,
          maxStorage: PLANS.FREE.maxStorage,
        },
        STARTER: {
          name: PLANS.STARTER.name,
          monthlyPrice: PLANS.STARTER.monthlyPrice,
          annualPrice: PLANS.STARTER.annualPrice,
          maxTeamMembers: PLANS.STARTER.maxTeamMembers,
          maxDocuments: PLANS.STARTER.maxDocuments,
          maxStorage: PLANS.STARTER.maxStorage,
        },
        PROFESSIONAL: {
          name: PLANS.PROFESSIONAL.name,
          monthlyPrice: PLANS.PROFESSIONAL.monthlyPrice,
          annualPrice: PLANS.PROFESSIONAL.annualPrice,
          maxTeamMembers: PLANS.PROFESSIONAL.maxTeamMembers,
          maxDocuments: PLANS.PROFESSIONAL.maxDocuments,
          maxStorage: PLANS.PROFESSIONAL.maxStorage,
          isPopular: PLANS.PROFESSIONAL.popular,
        },
        BUSINESS: {
          name: PLANS.BUSINESS.name,
          monthlyPrice: PLANS.BUSINESS.monthlyPrice,
          annualPrice: PLANS.BUSINESS.annualPrice,
          maxTeamMembers: PLANS.BUSINESS.maxTeamMembers,
          maxDocuments: PLANS.BUSINESS.maxDocuments,
          maxStorage: PLANS.BUSINESS.maxStorage,
        },
        ENTERPRISE: {
          name: PLANS.ENTERPRISE.name,
          monthlyPrice: PLANS.ENTERPRISE.monthlyPrice,
          maxTeamMembers: PLANS.ENTERPRISE.maxTeamMembers,
          maxDocuments: PLANS.ENTERPRISE.maxDocuments,
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
    const { plan, billingPeriod = "monthly" } = body;

    if (!plan || !["STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!["monthly", "annual"].includes(billingPeriod)) {
      return NextResponse.json({ error: "Invalid billing period" }, { status: 400 });
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
      plan as "STARTER" | "PROFESSIONAL" | "BUSINESS" | "ENTERPRISE",
      billingPeriod as "monthly" | "annual",
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
