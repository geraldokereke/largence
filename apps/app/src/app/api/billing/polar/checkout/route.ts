import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { createPolarCheckout, getOrCreatePolarCustomer, PLANS } from "@/lib/polar";

export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("products");
    const plan = searchParams.get("plan") || "PRO";
    const billingPeriod = (searchParams.get("billingPeriod") || "monthly") as "monthly" | "annual";

    // Get user info
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || "";

    if (!email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    // Ensure customer exists
    await getOrCreatePolarCustomer(orgId, email, user?.fullName || undefined);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.largence.com";
    const successUrl = `${baseUrl}/account?tab=billing&checkout=success`;

    const { checkoutUrl } = await createPolarCheckout(
      orgId,
      email,
      plan as keyof typeof PLANS,
      billingPeriod,
      successUrl,
      { organizationId: orgId }
    );

    return NextResponse.redirect(checkoutUrl);
  } catch (error: any) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout" },
      { status: 500 }
    );
  }
}
