import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe, getSubscription } from "@/lib/stripe";

// GET /api/billing/invoices - Get customer invoices
export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const startingAfter = searchParams.get("starting_after") || undefined;

    const subscription = await getSubscription(orgId);

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 404 }
      );
    }

    // Get invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: subscription.stripeCustomerId,
      limit,
      starting_after: startingAfter,
    });

    return NextResponse.json({
      invoices: invoices.data.map((invoice) => {
        const inv = invoice as any;
        return {
          id: invoice.id,
          number: invoice.number,
          status: invoice.status,
          amountDue: invoice.amount_due,
          amountPaid: invoice.amount_paid,
          currency: invoice.currency,
          created: invoice.created,
          dueDate: invoice.due_date,
          paid: invoice.status === 'paid',
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          invoicePdf: invoice.invoice_pdf,
          periodStart: inv.period_start,
          periodEnd: inv.period_end,
          subtotal: invoice.subtotal,
          total: invoice.total,
          tax: inv.total_tax_amounts?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0,
          discount: invoice.total_discount_amounts?.reduce(
            (sum: number, d: any) => sum + d.amount,
            0
          ) || 0,
        };
      }),
      hasMore: invoices.has_more,
    });
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
