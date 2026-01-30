import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import { updateSubscriptionFromPaystack } from "@/lib/paystack";
import { PLANS } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { PlanType, SubscriptionStatus } from "@prisma/client";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

// Verify Paystack webhook signature
function verifyWebhookSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");
  return hash === signature;
}

// POST /api/billing/paystack/webhook - Handle Paystack webhooks
export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("x-paystack-signature");

  // Verify signature
  if (!signature || !verifyWebhookSignature(body, signature)) {
    console.error("Invalid Paystack webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  // Check if event already processed (idempotency)
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { eventId: event.id?.toString() || `paystack_${Date.now()}` },
  });

  if (existingEvent?.processed) {
    console.log(`Paystack event ${event.id} already processed, skipping`);
    return NextResponse.json({ received: true, skipped: true });
  }

  // Record webhook event
  const webhookEvent = await prisma.webhookEvent.upsert({
    where: { eventId: event.id?.toString() || `paystack_${Date.now()}` },
    create: {
      eventId: event.id?.toString() || `paystack_${Date.now()}`,
      eventType: `paystack.${event.event}`,
      payload: event,
      attempts: 1,
    },
    update: {
      attempts: { increment: 1 },
    },
  });

  try {
    switch (event.event) {
      case "subscription.create": {
        const data = event.data;
        const organizationId = data.metadata?.organizationId;

        if (organizationId) {
          const plan = data.metadata?.plan || "STARTER";
          const planConfig = PLANS[plan as keyof typeof PLANS] || PLANS.STARTER;

          await prisma.subscription.update({
            where: { organizationId },
            data: {
              paystackSubscriptionCode: data.subscription_code,
              paystackPlanCode: data.plan?.plan_code,
              paystackEmailToken: data.email_token,
              paymentProvider: "PAYSTACK",
              plan: plan as PlanType,
              status: SubscriptionStatus.ACTIVE,
              currentPeriodEnd: data.next_payment_date
                ? new Date(data.next_payment_date)
                : undefined,
              maxTeamMembers: planConfig.maxTeamMembers,
              maxContracts: planConfig.maxDocuments,
              maxStorage: Math.round(planConfig.maxStorage / 1000),
              hasAiDrafting: planConfig.features.hasAiDrafting,
              hasComplianceAuto: planConfig.features.hasComplianceAuto,
              hasAnalytics: planConfig.features.hasAnalytics,
              hasCustomTemplates: planConfig.features.hasCustomTemplates,
              hasPrioritySupport: planConfig.features.hasPrioritySupport,
              hasCustomIntegrations: planConfig.features.hasCustomIntegrations,
            },
          });
        }
        break;
      }

      case "subscription.disable":
      case "subscription.not_renew": {
        const data = event.data;
        const subscription = await prisma.subscription.findFirst({
          where: { paystackSubscriptionCode: data.subscription_code },
        });

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              cancelAtPeriodEnd: true,
            },
          });
        }
        break;
      }

      case "subscription.enable": {
        const data = event.data;
        const subscription = await prisma.subscription.findFirst({
          where: { paystackSubscriptionCode: data.subscription_code },
        });

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              cancelAtPeriodEnd: false,
              status: SubscriptionStatus.ACTIVE,
            },
          });
        }
        break;
      }

      case "charge.success": {
        const data = event.data;
        const organizationId = data.metadata?.organizationId;

        if (organizationId && data.plan) {
          // This is a subscription charge
          const plan = data.metadata?.plan || "STARTER";
          const planConfig = PLANS[plan as keyof typeof PLANS] || PLANS.STARTER;
          const billingPeriod = data.metadata?.billingPeriod || "monthly";

          await prisma.subscription.update({
            where: { organizationId },
            data: {
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(
                Date.now() +
                  (billingPeriod === "annual"
                    ? 365 * 24 * 60 * 60 * 1000
                    : 30 * 24 * 60 * 60 * 1000)
              ),
            },
          });
        }
        break;
      }

      case "charge.failed": {
        const data = event.data;
        const organizationId = data.metadata?.organizationId;

        if (organizationId) {
          await prisma.subscription.update({
            where: { organizationId },
            data: {
              status: SubscriptionStatus.PAST_DUE,
            },
          });

          console.error("Paystack charge failed:", {
            organizationId,
            reference: data.reference,
            message: data.gateway_response,
          });
        }
        break;
      }

      case "invoice.create":
      case "invoice.update": {
        const data = event.data;
        console.log(`Paystack invoice ${event.event}:`, data.invoice_number);
        break;
      }

      case "invoice.payment_failed": {
        const data = event.data;
        const subscription = await prisma.subscription.findFirst({
          where: { paystackSubscriptionCode: data.subscription?.subscription_code },
        });

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: SubscriptionStatus.PAST_DUE,
            },
          });

          console.error("Paystack invoice payment failed:", {
            subscriptionId: subscription.id,
            invoiceNumber: data.invoice_number,
          });
        }
        break;
      }

      case "transfer.success":
      case "transfer.failed":
      case "transfer.reversed": {
        // Handle refunds/transfers if needed
        console.log(`Paystack transfer ${event.event}:`, event.data);
        break;
      }

      default:
        console.log(`Unhandled Paystack event: ${event.event}`);
    }

    // Mark webhook as processed
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        processed: true,
        processedAt: new Date(),
        lastError: null,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing Paystack webhook:", error);

    // Update webhook with error
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        lastError: error.message || "Unknown error",
      },
    });

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
