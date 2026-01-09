import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe, getSubscription } from "@/lib/stripe";
import prisma from "@/lib/prisma";

// POST /api/billing/subscription/pause - Pause subscription
export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getSubscription(orgId);

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Pause the subscription
    const pausedSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        pause_collection: {
          behavior: "mark_uncollectible", // Don't attempt to collect payment
        },
      }
    );

    // Update database
    await prisma.subscription.update({
      where: { organizationId: orgId },
      data: {
        status: "PAUSED" as any,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription paused successfully",
      subscription: {
        id: pausedSubscription.id,
        status: pausedSubscription.status,
      },
    });
  } catch (error: any) {
    console.error("Error pausing subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to pause subscription" },
      { status: 500 }
    );
  }
}
