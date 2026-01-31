import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe, getSubscription } from "@/lib/stripe";

// GET /api/billing/payment-methods - Get customer payment methods
export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getSubscription(orgId);

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 404 }
      );
    }

    // Get payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: subscription.stripeCustomerId,
      type: "card",
    });

    // Get default payment method
    const customer = await stripe.customers.retrieve(
      subscription.stripeCustomerId
    ) as any;

    const defaultPaymentMethodId =
      customer.invoice_settings?.default_payment_method;

    return NextResponse.json({
      paymentMethods: paymentMethods.data.map((pm) => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
        isDefault: pm.id === defaultPaymentMethodId,
      })),
      defaultPaymentMethodId,
    });
  } catch (error: any) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

// POST /api/billing/payment-methods - Create setup session for adding payment method
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
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      console.error("NEXT_PUBLIC_APP_URL is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create setup session
    const session = await stripe.checkout.sessions.create({
      customer: subscription.stripeCustomerId,
      mode: "setup",
      payment_method_types: ["card"],
      success_url: `${baseUrl}/account?tab=billing&payment_method_added=true`,
      cancel_url: `${baseUrl}/account?tab=billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating setup session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create setup session" },
      { status: 500 }
    );
  }
}

// PATCH /api/billing/payment-methods/:id - Set default payment method
export async function PATCH(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentMethodId } = body;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Payment method ID required" },
        { status: 400 }
      );
    }

    const subscription = await getSubscription(orgId);

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 404 }
      );
    }

    // Set as default payment method
    await stripe.customers.update(subscription.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Default payment method updated",
    });
  } catch (error: any) {
    console.error("Error updating default payment method:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update default payment method" },
      { status: 500 }
    );
  }
}

// DELETE /api/billing/payment-methods - Remove payment method
export async function DELETE(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get("id");

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Payment method ID required" },
        { status: 400 }
      );
    }

    const subscription = await getSubscription(orgId);

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 404 }
      );
    }

    // Detach payment method
    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({
      success: true,
      message: "Payment method removed",
    });
  } catch (error: any) {
    console.error("Error removing payment method:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove payment method" },
      { status: 500 }
    );
  }
}
