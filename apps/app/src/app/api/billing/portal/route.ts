import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSubscription, createCustomerPortalSession } from "@/lib/polar";

// POST /api/billing/portal - Create customer portal session
export async function POST() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getSubscription(orgId);

    // Check for Polar customer first, then fall back to Stripe
    const customerId = subscription?.polarCustomerId || subscription?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.largence.com";

    // If Polar customer, redirect to Polar portal
    if (subscription?.polarCustomerId) {
      const portalUrl = await createCustomerPortalSession(
        subscription.polarCustomerId,
        `${baseUrl}/account?tab=billing`
      );
      return NextResponse.json({ url: portalUrl });
    }

    // Legacy: Stripe portal redirect
    return NextResponse.json({
      url: `${baseUrl}/api/billing/polar/portal`,
      message: "Please use Polar for billing management",
    });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
