import { NextRequest, NextResponse } from "next/server";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import prisma from "@/lib/prisma";
import { PlanType, SubscriptionStatus } from "@prisma/client";
import { PLANS, PLAN_TYPE_MAPPING, getSubscriptionDataFromPlan } from "@/lib/polar";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("POLAR_WEBHOOK_SECRET not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    // Validate and parse the webhook event
    let event: ReturnType<typeof validateEvent>;
    try {
      event = validateEvent(body, headers, webhookSecret);
    } catch (error) {
      console.error("Invalid webhook signature:", error);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log("Polar webhook received:", event.type);

    const data = event.data as any;

    // Handle checkout.updated
    if (event.type === "checkout.updated" && data?.status === "succeeded") {
      const organizationId = data.metadata?.organizationId as string;
      if (!organizationId) {
        console.error("No organizationId in checkout metadata");
        return NextResponse.json({ received: true });
      }

      const plan = (data.metadata?.plan as string) || "FREE";
      const planKey = plan as keyof typeof PLANS;
      const planData = getSubscriptionDataFromPlan(planKey);

      await prisma.subscription.upsert({
        where: { organizationId },
        update: {
          paymentProvider: "POLAR",
          polarCustomerId: data.customer_id || undefined,
          polarCheckoutId: data.id,
          polarProductId: data.product_id || undefined,
          plan: PLAN_TYPE_MAPPING[plan] || PlanType.FREE,
          status: SubscriptionStatus.ACTIVE,
          currency: "USD",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          ...planData,
        },
        create: {
          organizationId,
          paymentProvider: "POLAR",
          polarCustomerId: data.customer_id || undefined,
          polarCheckoutId: data.id,
          polarProductId: data.product_id || undefined,
          plan: PLAN_TYPE_MAPPING[plan] || PlanType.FREE,
          status: SubscriptionStatus.ACTIVE,
          currency: "USD",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          ...planData,
        },
      });

      console.log(`Subscription updated for org ${organizationId} to plan ${plan}`);
      return NextResponse.json({ received: true });
    }

    // Handle subscription events
    if (event.type?.startsWith("subscription.")) {
      const organizationId = data?.metadata?.organizationId as string;
      if (!organizationId) {
        return NextResponse.json({ received: true });
      }

      // Find plan from product
      let plan: keyof typeof PLANS = "FREE";
      for (const [key, config] of Object.entries(PLANS)) {
        if (config.polarProductId === data?.product_id) {
          plan = key as keyof typeof PLANS;
          break;
        }
      }

      const planData = getSubscriptionDataFromPlan(plan);

      if (event.type === "subscription.created" || event.type === "subscription.updated") {
        await prisma.subscription.update({
          where: { organizationId },
          data: {
            polarSubscriptionId: data.id,
            polarCustomerId: data.customer_id,
            polarProductId: data.product_id,
            plan: PLAN_TYPE_MAPPING[plan] || PlanType.FREE,
            status: mapPolarStatus(data.status),
            currentPeriodStart: data.current_period_start ? new Date(data.current_period_start) : new Date(),
            currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: data.cancel_at_period_end || false,
            ...planData,
          },
        });
      } else if (event.type === "subscription.active") {
        await prisma.subscription.update({
          where: { organizationId },
          data: {
            status: SubscriptionStatus.ACTIVE,
            trialEnd: null,
          },
        });
      } else if (event.type === "subscription.canceled") {
        await prisma.subscription.update({
          where: { organizationId },
          data: {
            status: SubscriptionStatus.CANCELED,
            canceledAt: new Date(),
          },
        });
      } else if (event.type === "subscription.revoked") {
        const freePlanData = getSubscriptionDataFromPlan("FREE");
        await prisma.subscription.update({
          where: { organizationId },
          data: {
            plan: PlanType.FREE,
            status: SubscriptionStatus.CANCELED,
            canceledAt: new Date(),
            polarSubscriptionId: null,
            ...freePlanData,
          },
        });
      } else if (event.type === "subscription.uncanceled") {
        await prisma.subscription.update({
          where: { organizationId },
          data: {
            status: SubscriptionStatus.ACTIVE,
            cancelAtPeriodEnd: false,
            canceledAt: null,
          },
        });
      }
      return NextResponse.json({ received: true });
    }

    // Handle order events
    if (event.type?.startsWith("order.")) {
      const organizationId = data?.metadata?.organizationId as string;
      if (!organizationId) {
        return NextResponse.json({ received: true });
      }

      if (event.type === "order.created") {
        console.log(`Order ${data.id} created for org ${organizationId}: $${(data.amount || 0) / 100}`);
      } else if (event.type === "order.paid") {
        await prisma.subscription.update({
          where: { organizationId },
          data: {
            status: SubscriptionStatus.ACTIVE,
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

// Map Polar status to our SubscriptionStatus
function mapPolarStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "past_due":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
      return SubscriptionStatus.CANCELED;
    case "unpaid":
      return SubscriptionStatus.UNPAID;
    case "incomplete":
      return SubscriptionStatus.INCOMPLETE;
    case "paused":
      return SubscriptionStatus.PAUSED;
    default:
      return SubscriptionStatus.ACTIVE;
  }
}
