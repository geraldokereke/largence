import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe, getSubscription } from "@/lib/stripe";
import prisma from "@/lib/prisma";

// POST /api/billing/subscription/resume - Resume paused subscription
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

    // Resume the subscription
    const resumedSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        pause_collection: null, // Remove pause
      }
    );

    // Update database
    await prisma.subscription.update({
      where: { organizationId: orgId },
      data: {
        status: "ACTIVE" as any,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription resumed successfully",
      subscription: {
        id: resumedSubscription.id,
        status: resumedSubscription.status,
      },
    });
  } catch (error: any) {
    console.error("Error resuming subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resume subscription" },
      { status: 500 }
    );
  }
}
