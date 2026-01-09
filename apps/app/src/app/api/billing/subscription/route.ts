import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe, getSubscription, PLANS } from "@/lib/stripe";
import prisma from "@/lib/prisma";

// PATCH /api/billing/subscription - Update subscription plan
export async function PATCH(request: Request) {
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

    const subscription = await getSubscription(orgId);

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];

    if (!planConfig.priceId) {
      return NextResponse.json(
        { error: `No price ID configured for plan: ${plan}` },
        { status: 400 }
      );
    }

    // Get current subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    // Update subscription with proration
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: planConfig.priceId,
          },
        ],
        proration_behavior: "always_invoice", // Create invoice for proration
        metadata: {
          organizationId: orgId,
          plan,
        },
      }
    );

    // Update local database
    await prisma.subscription.update({
      where: { organizationId: orgId },
      data: {
        stripePriceId: planConfig.priceId,
        plan: plan as any,
        maxTeamMembers: planConfig.maxTeamMembers,
        maxContracts: planConfig.maxContracts,
        maxStorage: planConfig.maxStorage,
        ...planConfig.features,
      },
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        plan,
        status: updatedSubscription.status,
      },
    });
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// DELETE /api/billing/subscription - Cancel subscription
export async function DELETE(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const immediately = searchParams.get("immediately") === "true";

    const subscription = await getSubscription(orgId);

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    if (immediately) {
      // Cancel immediately
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      
      // Update database
      await prisma.subscription.update({
        where: { organizationId: orgId },
        data: {
          status: "CANCELED" as any,
          canceledAt: new Date(),
        },
      });
    } else {
      // Cancel at period end (graceful cancellation)
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Update database
      await prisma.subscription.update({
        where: { organizationId: orgId },
        data: {
          cancelAtPeriodEnd: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: immediately
        ? "Subscription canceled immediately"
        : "Subscription will cancel at period end",
    });
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}

// POST /api/billing/subscription/reactivate - Reactivate canceled subscription
export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getSubscription(orgId);

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    if (!subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: "Subscription is not scheduled for cancellation" },
        { status: 400 }
      );
    }

    // Reactivate subscription
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Update database
    await prisma.subscription.update({
      where: { organizationId: orgId },
      data: {
        cancelAtPeriodEnd: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription reactivated successfully",
    });
  } catch (error: any) {
    console.error("Error reactivating subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reactivate subscription" },
      { status: 500 }
    );
  }
}
