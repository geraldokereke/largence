import { NextResponse } from "next/server";
import { verifyPaystackTransaction, updateSubscriptionFromPaystack } from "@/lib/paystack";
import { PLANS } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { PlanType, SubscriptionStatus } from "@prisma/client";

// GET /api/billing/paystack/callback - Handle Paystack redirect after payment
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");
    const orgId = searchParams.get("orgId");

    if (!reference) {
      return NextResponse.redirect(
        new URL("/account?tab=billing&error=missing_reference", request.url)
      );
    }

    // Verify the transaction
    const result = await verifyPaystackTransaction(reference);

    if (!result.success) {
      return NextResponse.redirect(
        new URL("/account?tab=billing&error=payment_failed", request.url)
      );
    }

    const organizationId = result.organizationId || orgId;

    if (!organizationId) {
      return NextResponse.redirect(
        new URL("/account?tab=billing&error=invalid_organization", request.url)
      );
    }

    // Update subscription in database
    const plan = (result.plan as keyof typeof PLANS) || "STARTER";
    const planConfig = PLANS[plan] || PLANS.STARTER;

    await prisma.subscription.update({
      where: { organizationId },
      data: {
        paymentProvider: "PAYSTACK",
        plan: plan as PlanType,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(
          Date.now() +
            (result.billingPeriod === "annual"
              ? 365 * 24 * 60 * 60 * 1000
              : 30 * 24 * 60 * 60 * 1000)
        ),
        maxTeamMembers: planConfig.maxTeamMembers,
        maxContracts: planConfig.maxDocuments,
        maxStorage: Math.round(planConfig.maxStorage / 1000),
        hasAiDrafting: planConfig.features.hasAiDrafting,
        hasComplianceAuto: planConfig.features.hasComplianceAuto,
        hasAnalytics: planConfig.features.hasAnalytics,
        hasCustomTemplates: planConfig.features.hasCustomTemplates,
        hasPrioritySupport: planConfig.features.hasPrioritySupport,
        hasCustomIntegrations: planConfig.features.hasCustomIntegrations,
      },
    });

    // Redirect to success page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(
      new URL("/account?tab=billing&success=true", baseUrl)
    );
  } catch (error) {
    console.error("Error handling Paystack callback:", error);
    return NextResponse.redirect(
      new URL("/account?tab=billing&error=callback_failed", request.url)
    );
  }
}
