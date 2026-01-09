import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  stripe,
  updateSubscriptionFromStripe,
  handleSubscriptionDeleted,
} from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

// Stripe webhook handler
export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Check if event already processed (idempotency)
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { eventId: event.id },
  });

  if (existingEvent?.processed) {
    console.log(`Event ${event.id} already processed, skipping`);
    return NextResponse.json({ received: true, skipped: true });
  }

  // Record webhook event
  const webhookEvent = await prisma.webhookEvent.upsert({
    where: { eventId: event.id },
    create: {
      eventId: event.id,
      eventType: event.type,
      payload: event as any,
      attempts: 1,
    },
    update: {
      attempts: { increment: 1 },
    },
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
          );
          await updateSubscriptionFromStripe(subscription);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await updateSubscriptionFromStripe(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string,
          );
          await updateSubscriptionFromStripe(subscription);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const subscription = invoice.subscription
          ? await stripe.subscriptions.retrieve(invoice.subscription as string)
          : null;

        if (subscription && subscription.metadata.organizationId) {
          // Update subscription status
          await updateSubscriptionFromStripe(subscription);
          
          // Log failed payment attempt
          console.error("Payment failed for invoice:", invoice.id, {
            organizationId: subscription.metadata.organizationId,
            attemptCount: invoice.attempt_count,
            nextPaymentAttempt: invoice.next_payment_attempt,
          });
          
          // TODO: Send email notification to customer
          // TODO: Create notification in database for user to see in app
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        // Notify customer 3 days before trial ends
        console.log("Trial ending soon:", subscription.id);
        // TODO: Send trial ending email
        break;
      }

      case "customer.subscription.paused":
      case "customer.subscription.resumed": {
        const subscription = event.data.object as Stripe.Subscription;
        await updateSubscriptionFromStripe(subscription);
        break;
      }

      case "invoice.finalized": {
        const invoice = event.data.object as any;
        // Invoice is ready to be sent to customer
        console.log("Invoice finalized:", invoice.id);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          await updateSubscriptionFromStripe(subscription);
        }
        // TODO: Send receipt email
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as any;
        console.error("Payment dispute created:", dispute.id);
        // TODO: Alert admin about dispute
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as any;
        console.log("Charge refunded:", charge.id);
        // TODO: Handle refund logic
        break;
      }

      case "customer.updated": {
        const customer = event.data.object as Stripe.Customer;
        // Update customer details if needed
        console.log("Customer updated:", customer.id);
        break;
      }

      case "payment_method.attached":
      case "payment_method.detached":
      case "payment_method.updated": {
        const paymentMethod = event.data.object as any;
        console.log(`Payment method ${event.type}:`, paymentMethod.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark webhook as processed
    await prisma.webhookEvent.update({
      where: { eventId: event.id },
      data: {
        processed: true,
        processedAt: new Date(),
        lastError: null,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    // Record error
    await prisma.webhookEvent.update({
      where: { eventId: event.id },
      data: {
        lastError: error instanceof Error ? error.message : String(error),
      },
    }).catch(console.error);
    
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
