import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getOrCreateStripeCustomer,
  createCheckoutSession,
  getSubscription,
  getUsageStats,
  PLANS,
} from "@/lib/stripe";
import {
  getOrCreatePaystackCustomer,
  createPaystackCheckout,
  isPaystackCountry,
  PAYSTACK_COUNTRIES,
  PAYSTACK_PLANS,
  getLocalPrices,
  type PaystackCurrency,
} from "@/lib/paystack";
import { currentUser } from "@clerk/nextjs/server";

// GET /api/billing - Get subscription and usage info
export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const currency = searchParams.get("currency") || "USD";

    const [subscription, usageStats] = await Promise.all([
      getSubscription(orgId),
      getUsageStats(orgId),
    ]);

    // Get prices in requested currency
    const isLocalCurrency = currency !== "USD" && currency in PAYSTACK_PLANS;
    const localPrices = isLocalCurrency
      ? getLocalPrices(currency as PaystackCurrency)
      : null;

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
            paymentProvider: subscription.paymentProvider || "STRIPE",
            currency: subscription.currency || "USD",
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
      currency,
      paymentProviders: {
        stripe: { currencies: ["USD"] },
        paystack: {
          currencies: Object.values(PAYSTACK_COUNTRIES).map((c) => c.currency),
          countries: Object.entries(PAYSTACK_COUNTRIES).map(([code, config]) => ({
            code,
            ...config,
          })),
        },
      },
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
          monthlyPrice: localPrices?.STARTER.monthly || PLANS.STARTER.monthlyPrice,
          annualPrice: localPrices?.STARTER.annual || PLANS.STARTER.annualPrice,
          monthlyPriceFormatted: localPrices?.STARTER.monthlyFormatted,
          annualPriceFormatted: localPrices?.STARTER.annualFormatted,
          maxTeamMembers: PLANS.STARTER.maxTeamMembers,
          maxDocuments: PLANS.STARTER.maxDocuments,
          maxStorage: PLANS.STARTER.maxStorage,
        },
        PROFESSIONAL: {
          name: PLANS.PROFESSIONAL.name,
          monthlyPrice: localPrices?.PROFESSIONAL.monthly || PLANS.PROFESSIONAL.monthlyPrice,
          annualPrice: localPrices?.PROFESSIONAL.annual || PLANS.PROFESSIONAL.annualPrice,
          monthlyPriceFormatted: localPrices?.PROFESSIONAL.monthlyFormatted,
          annualPriceFormatted: localPrices?.PROFESSIONAL.annualFormatted,
          maxTeamMembers: PLANS.PROFESSIONAL.maxTeamMembers,
          maxDocuments: PLANS.PROFESSIONAL.maxDocuments,
          maxStorage: PLANS.PROFESSIONAL.maxStorage,
          isPopular: PLANS.PROFESSIONAL.popular,
        },
        BUSINESS: {
          name: PLANS.BUSINESS.name,
          monthlyPrice: localPrices?.BUSINESS.monthly || PLANS.BUSINESS.monthlyPrice,
          annualPrice: localPrices?.BUSINESS.annual || PLANS.BUSINESS.annualPrice,
          monthlyPriceFormatted: localPrices?.BUSINESS.monthlyFormatted,
          annualPriceFormatted: localPrices?.BUSINESS.annualFormatted,
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

// POST /api/billing - Create checkout session (Stripe or Paystack)
export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      plan,
      billingPeriod = "monthly",
      currency = "USD",
      country,
    } = body;

    if (!plan || !["STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!["monthly", "annual"].includes(billingPeriod)) {
      return NextResponse.json({ error: "Invalid billing period" }, { status: 400 });
    }

    // Get user info
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || "";
    const name = user?.fullName || "";
    const firstName = user?.firstName || undefined;
    const lastName = user?.lastName || undefined;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Determine which payment provider to use based on currency/country
    const usePaystack =
      currency !== "USD" &&
      Object.values(PAYSTACK_COUNTRIES).some((c) => c.currency === currency);

    if (usePaystack) {
      // Use Paystack for African currencies
      if (!["STARTER", "PROFESSIONAL", "BUSINESS"].includes(plan)) {
        return NextResponse.json(
          { error: "Enterprise plan requires contacting sales" },
          { status: 400 }
        );
      }

      await getOrCreatePaystackCustomer(orgId, email, firstName, lastName);

      const { authorizationUrl, reference } = await createPaystackCheckout(
        orgId,
        email,
        plan as "STARTER" | "PROFESSIONAL" | "BUSINESS",
        billingPeriod as "monthly" | "annual",
        currency as PaystackCurrency,
        `${baseUrl}/api/billing/paystack/callback?orgId=${orgId}`
      );

      return NextResponse.json({
        url: authorizationUrl,
        reference,
        provider: "paystack",
      });
    } else {
      // Use Stripe for USD
      const customerId = await getOrCreateStripeCustomer(orgId, email, name);

      const session = await createCheckoutSession(
        orgId,
        customerId,
        plan as "STARTER" | "PROFESSIONAL" | "BUSINESS" | "ENTERPRISE",
        billingPeriod as "monthly" | "annual",
        `${baseUrl}/account?tab=billing&success=true`,
        `${baseUrl}/account?tab=billing&canceled=true`
      );

      return NextResponse.json({
        url: session.url,
        provider: "stripe",
      });
    }
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
