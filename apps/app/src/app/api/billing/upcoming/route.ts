import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe, getSubscription } from "@/lib/stripe";

// GET /api/billing/upcoming - Get upcoming invoice preview
export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getSubscription(orgId);

    if (!subscription?.stripeCustomerId || !subscription?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Get upcoming invoice
    // @ts-ignore - Stripe SDK type issue with retrieveUpcoming method
    const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      customer: subscription.stripeCustomerId,
      subscription: subscription.stripeSubscriptionId,
    });

    const inv = upcomingInvoice as any;

    return NextResponse.json({
      invoice: {
        amountDue: upcomingInvoice.amount_due,
        currency: upcomingInvoice.currency,
        periodStart: inv.period_start,
        periodEnd: inv.period_end,
        subtotal: upcomingInvoice.subtotal,
        total: upcomingInvoice.total,
        tax: inv.total_tax_amounts?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0,
        nextPaymentAttempt: inv.next_payment_attempt,
        lines: upcomingInvoice.lines.data.map((line: any) => ({
          description: line.description,
          amount: line.amount,
          quantity: line.quantity,
          period: {
            start: line.period.start,
            end: line.period.end,
          },
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching upcoming invoice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch upcoming invoice" },
      { status: 500 }
    );
  }
}
