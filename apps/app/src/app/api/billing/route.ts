import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  PLANS,
  getSubscription,
  getUsageStats,
  getOrCreatePolarCustomer,
  formatPrice,
  TOKEN_USAGE_RATES,
  calculateOverageCharges,
} from "@/lib/polar";

// GET /api/billing - Get subscription and usage info for the organization
export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [subscription, usageStats] = await Promise.all([
      getSubscription(orgId),
      getUsageStats(orgId),
    ]);

    // Calculate potential overage charges
    const overageCharges = subscription
      ? calculateOverageCharges(
          {
            documentsGenerated: usageStats.documentsGenerated,
            complianceChecks: usageStats.complianceChecks,
            aiTokensUsed: usageStats.aiTokensUsed,
            storageUsedMB: (subscription.maxStorage || 0) * 1000,
          },
          (subscription.plan as keyof typeof PLANS) || "FREE"
        )
      : null;

    return NextResponse.json({
      // Organization context - billing is at the team/org level
      organizationId: orgId,
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
            paymentProvider: subscription.paymentProvider || "POLAR",
            currency: "USD",
            isStudentVerified: subscription.isStudentVerified,
            // Comprehensive feature flags
            features: {
              // AI Features
              hasAiDrafting: subscription.hasAiDrafting,
              hasAiEditing: subscription.hasAiEditing ?? false,
              hasAgenticCompliance: subscription.hasAgenticCompliance ?? false,
              // Compliance
              hasComplianceAuto: subscription.hasComplianceAuto,
              // Organization
              hasAnalytics: subscription.hasAnalytics,
              hasCustomTemplates: subscription.hasCustomTemplates,
              hasPrioritySupport: subscription.hasPrioritySupport,
              hasCustomIntegrations: subscription.hasCustomIntegrations,
              hasESignatures: subscription.hasESignatures ?? false,
              hasAuditLogs: subscription.hasAuditLogs ?? false,
              hasApiAccess: subscription.hasApiAccess ?? false,
              hasClauseLibrary: subscription.hasClauseLibrary ?? false,
              hasMatters: subscription.hasMatters ?? false,
              hasTeamCollaboration: subscription.hasTeamCollaboration ?? false,
            },
            // Usage limits
            limits: {
              maxESignatures: subscription.maxESignatures ?? 0,
              maxAiGenerations: subscription.maxAiGenerations ?? 10,
              maxAiTokens: subscription.maxAiTokens ?? 50000,
              maxComplianceChecks: subscription.maxComplianceChecks ?? 5,
              maxTemplates: subscription.maxTemplates ?? 3,
            },
          }
        : null,
      usage: {
        ...usageStats,
        overageCharges,
      },
      tokenUsageRates: TOKEN_USAGE_RATES,
      plans: {
        FREE: {
          name: PLANS.FREE.name,
          description: PLANS.FREE.description,
          monthlyPrice: PLANS.FREE.monthlyPrice,
          monthlyPriceFormatted: formatPrice(PLANS.FREE.monthlyPrice),
          maxTeamMembers: PLANS.FREE.maxTeamMembers,
          maxDocuments: PLANS.FREE.maxDocuments,
          maxAiTokens: PLANS.FREE.maxAiTokens,
          maxStorage: PLANS.FREE.maxStorage,
          highlights: PLANS.FREE.highlights,
        },
        STUDENT: {
          name: PLANS.STUDENT.name,
          description: PLANS.STUDENT.description,
          monthlyPrice: PLANS.STUDENT.monthlyPrice,
          annualPrice: PLANS.STUDENT.annualPrice,
          monthlyPriceFormatted: formatPrice(PLANS.STUDENT.monthlyPrice),
          annualPriceFormatted: formatPrice(PLANS.STUDENT.annualPrice),
          maxTeamMembers: PLANS.STUDENT.maxTeamMembers,
          maxDocuments: PLANS.STUDENT.maxDocuments,
          maxAiTokens: PLANS.STUDENT.maxAiTokens,
          maxStorage: PLANS.STUDENT.maxStorage,
          highlights: PLANS.STUDENT.highlights,
          requiresVerification: true,
        },
        PRO: {
          name: PLANS.PRO.name,
          description: PLANS.PRO.description,
          monthlyPrice: PLANS.PRO.monthlyPrice,
          annualPrice: PLANS.PRO.annualPrice,
          monthlyPriceFormatted: formatPrice(PLANS.PRO.monthlyPrice),
          annualPriceFormatted: formatPrice(PLANS.PRO.annualPrice),
          maxTeamMembers: PLANS.PRO.maxTeamMembers,
          maxDocuments: PLANS.PRO.maxDocuments,
          maxAiTokens: PLANS.PRO.maxAiTokens,
          maxStorage: PLANS.PRO.maxStorage,
          highlights: PLANS.PRO.highlights,
          isPopular: true,
        },
        MAX: {
          name: PLANS.MAX.name,
          description: PLANS.MAX.description,
          monthlyPrice: PLANS.MAX.monthlyPrice,
          annualPrice: PLANS.MAX.annualPrice,
          monthlyPriceFormatted: formatPrice(PLANS.MAX.monthlyPrice),
          annualPriceFormatted: formatPrice(PLANS.MAX.annualPrice),
          maxTeamMembers: PLANS.MAX.maxTeamMembers,
          maxDocuments: PLANS.MAX.maxDocuments,
          maxAiTokens: PLANS.MAX.maxAiTokens,
          maxStorage: PLANS.MAX.maxStorage,
          highlights: PLANS.MAX.highlights,
        },
        ENTERPRISE: {
          name: PLANS.ENTERPRISE.name,
          description: PLANS.ENTERPRISE.description,
          monthlyPrice: null,
          monthlyPriceFormatted: "Custom",
          maxTeamMembers: -1,
          maxDocuments: -1,
          maxAiTokens: -1,
          maxStorage: -1,
          highlights: PLANS.ENTERPRISE.highlights,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching billing info:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing info" },
      { status: 500 }
    );
  }
}

// POST /api/billing - Create Polar checkout session
export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan, billingPeriod = "monthly" } = body;

    // Validate plan
    const validPlans = ["STUDENT", "PRO", "MAX", "ENTERPRISE"];
    if (!plan || !validPlans.includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Choose from: STUDENT, PRO, MAX, or ENTERPRISE" },
        { status: 400 }
      );
    }

    if (!["monthly", "annual"].includes(billingPeriod)) {
      return NextResponse.json({ error: "Invalid billing period" }, { status: 400 });
    }

    // Enterprise requires contacting sales
    if (plan === "ENTERPRISE") {
      return NextResponse.json({
        requiresContact: true,
        message: "Enterprise plan requires a custom quote. Please contact sales.",
        contactUrl: "mailto:sales@largence.com?subject=Enterprise%20Plan%20Inquiry",
      });
    }

    // Student plan requires verification
    if (plan === "STUDENT") {
      const subscription = await getSubscription(orgId);
      if (!subscription?.isStudentVerified) {
        return NextResponse.json({
          requiresVerification: true,
          message: "Student plan requires verification of your student status.",
          verificationUrl: "/account?tab=billing&verify=student",
        });
      }
    }

    // Get user info
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || "";

    if (!email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    // Ensure customer exists
    await getOrCreatePolarCustomer(orgId, email, user?.fullName || undefined);

    // Get the Polar product ID for the plan
    const planConfig = PLANS[plan as keyof typeof PLANS];
    const productId = planConfig.polarProductId;

    if (!productId) {
      return NextResponse.json(
        { error: `No product configured for plan: ${plan}` },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.largence.com";

    // Redirect to Polar checkout route with product ID
    const checkoutUrl = new URL(`${baseUrl}/api/billing/polar/checkout`);
    checkoutUrl.searchParams.set("products", productId);
    checkoutUrl.searchParams.set("customerEmail", email);
    checkoutUrl.searchParams.set(
      "metadata",
      JSON.stringify({
        organizationId: orgId,
        plan,
        billingPeriod,
      })
    );

    return NextResponse.json({
      url: checkoutUrl.toString(),
      provider: "polar",
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
