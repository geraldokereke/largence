import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe, getSubscription } from "@/lib/stripe";

// POST /api/billing/retry-payment - Retry failed payment
export async function POST() {
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

    // Get latest invoice
    const invoices = await stripe.invoices.list({
      subscription: subscription.stripeSubscriptionId,
      limit: 1,
    });

    const latestInvoice = invoices.data[0];

    if (!latestInvoice || latestInvoice.status === 'paid') {
      return NextResponse.json(
        { error: "No unpaid invoice found" },
        { status: 400 }
      );
    }

    // Retry payment
    const invoice = await stripe.invoices.pay(latestInvoice.id);

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        status: invoice.status,
        amountPaid: invoice.amount_paid,
      },
    });
  } catch (error: any) {
    console.error("Error retrying payment:", error);
    
    // Check if it's a card error
    if (error.type === "StripeCardError") {
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          declineCode: error.decline_code,
        },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to retry payment" },
      { status: 500 }
    );
  }
}
