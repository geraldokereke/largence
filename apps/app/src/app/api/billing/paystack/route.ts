import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  getOrCreatePaystackCustomer,
  createPaystackCheckout,
  verifyPaystackTransaction,
  isPaystackCountry,
  PAYSTACK_COUNTRIES,
  type PaystackCurrency,
} from "@/lib/paystack";

// POST /api/billing/paystack - Create Paystack checkout session
export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan, billingPeriod = "monthly", currency = "NGN", country } = body;

    // Validate plan
    if (!plan || !["STARTER", "PROFESSIONAL", "BUSINESS"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Validate billing period
    if (!["monthly", "annual"].includes(billingPeriod)) {
      return NextResponse.json(
        { error: "Invalid billing period" },
        { status: 400 }
      );
    }

    // Validate currency for Paystack
    const validCurrencies = Object.values(PAYSTACK_COUNTRIES).map(
      (c) => c.currency
    );
    if (!validCurrencies.includes(currency as PaystackCurrency)) {
      return NextResponse.json(
        {
          error: `Invalid currency. Paystack supports: ${validCurrencies.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Get user info
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || "";
    const firstName = user?.firstName || undefined;
    const lastName = user?.lastName || undefined;

    if (!email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Get or create Paystack customer
    await getOrCreatePaystackCustomer(orgId, email, firstName, lastName);

    // Create checkout URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      console.error("NEXT_PUBLIC_APP_URL is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    const callbackUrl = `${baseUrl}/api/billing/paystack/callback?orgId=${orgId}`;

    const { authorizationUrl, reference } = await createPaystackCheckout(
      orgId,
      email,
      plan as "STARTER" | "PROFESSIONAL" | "BUSINESS",
      billingPeriod as "monthly" | "annual",
      currency as PaystackCurrency,
      callbackUrl
    );

    return NextResponse.json({
      url: authorizationUrl,
      reference,
      provider: "paystack",
    });
  } catch (error: any) {
    console.error("Error creating Paystack checkout:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

// GET /api/billing/paystack - Get supported countries and currencies
export async function GET() {
  try {
    const countries = Object.entries(PAYSTACK_COUNTRIES).map(
      ([code, config]) => ({
        code,
        ...config,
      })
    );

    return NextResponse.json({
      provider: "paystack",
      countries,
      supportedCurrencies: countries.map((c) => c.currency),
    });
  } catch (error) {
    console.error("Error fetching Paystack info:", error);
    return NextResponse.json(
      { error: "Failed to fetch Paystack info" },
      { status: 500 }
    );
  }
}
