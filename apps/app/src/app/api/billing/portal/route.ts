import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createPortalSession, getSubscription } from "@/lib/stripe";

// POST /api/billing/portal - Create customer portal session
export async function POST() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getSubscription(orgId);

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 404 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await createPortalSession(
      subscription.stripeCustomerId,
      `${baseUrl}/account?tab=billing`,
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 },
    );
  }
}
