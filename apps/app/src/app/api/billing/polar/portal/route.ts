import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createCustomerPortalSession } from "@/lib/polar";

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { organizationId: orgId },
      select: { polarCustomerId: true },
    });

    if (!subscription?.polarCustomerId) {
      return NextResponse.json(
        { error: "No customer found. Please subscribe to a plan first." },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.largence.com";
    const returnUrl = `${baseUrl}/account?tab=billing`;

    const portalUrl = await createCustomerPortalSession(
      subscription.polarCustomerId,
      returnUrl
    );

    return NextResponse.redirect(portalUrl);
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to open billing portal" },
      { status: 500 }
    );
  }
}
