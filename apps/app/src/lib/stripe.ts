import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { PlanType, SubscriptionStatus } from "@prisma/client";

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

// Plan configuration
export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: null,
    maxTeamMembers: 1,
    maxContracts: 2, // 2 free generations/compliance checks
    maxStorage: 0,
    features: {
      hasAiDrafting: true,
      hasComplianceAuto: false,
      hasAnalytics: false,
      hasCustomTemplates: false,
      hasPrioritySupport: false,
      hasCustomIntegrations: false,
    },
  },
  STARTER: {
    name: "Starter",
    price: 29900, // $299 in cents
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    maxTeamMembers: 5,
    maxContracts: 100,
    maxStorage: 5,
    features: {
      hasAiDrafting: true,
      hasComplianceAuto: false,
      hasAnalytics: false,
      hasCustomTemplates: false,
      hasPrioritySupport: false,
      hasCustomIntegrations: false,
    },
  },
  PROFESSIONAL: {
    name: "Professional",
    price: 79900, // $799 in cents
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
    maxTeamMembers: 20,
    maxContracts: -1, // Unlimited
    maxStorage: 50,
    features: {
      hasAiDrafting: true,
      hasComplianceAuto: true,
      hasAnalytics: true,
      hasCustomTemplates: true,
      hasPrioritySupport: true,
      hasCustomIntegrations: false,
    },
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: null, // Custom pricing
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    maxTeamMembers: -1, // Unlimited
    maxContracts: -1, // Unlimited
    maxStorage: -1, // Unlimited
    features: {
      hasAiDrafting: true,
      hasComplianceAuto: true,
      hasAnalytics: true,
      hasCustomTemplates: true,
      hasPrioritySupport: true,
      hasCustomIntegrations: true,
    },
  },
} as const;

// Get or create Stripe customer
export async function getOrCreateStripeCustomer(
  organizationId: string,
  email: string,
  name?: string
): Promise<string> {
  // Check if subscription exists with customer
  const existingSubscription = await prisma.subscription.findUnique({
    where: { organizationId },
  });

  // Return existing customer if it's not a temporary one
  if (existingSubscription?.stripeCustomerId && !existingSubscription.stripeCustomerId.startsWith('temp_')) {
    return existingSubscription.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      organizationId,
    },
  });

  // Create or update subscription record
  await prisma.subscription.upsert({
    where: { organizationId },
    update: { stripeCustomerId: customer.id },
    create: {
      organizationId,
      stripeCustomerId: customer.id,
      plan: PlanType.FREE,
      status: SubscriptionStatus.ACTIVE,
      maxTeamMembers: PLANS.FREE.maxTeamMembers,
      maxContracts: PLANS.FREE.maxContracts,
      maxStorage: PLANS.FREE.maxStorage,
      ...PLANS.FREE.features,
    },
  });

  return customer.id;
}

// Create checkout session for subscription
export async function createCheckoutSession(
  organizationId: string,
  customerId: string,
  plan: keyof typeof PLANS,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const planConfig = PLANS[plan];
  
  if (!planConfig.priceId) {
    throw new Error(`No price ID configured for plan: ${plan}`);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: planConfig.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        organizationId,
        plan,
      },
    },
    metadata: {
      organizationId,
      plan,
    },
    allow_promotion_codes: true,
    billing_address_collection: "required",
    // Customer can update payment method in portal
    payment_method_collection: "always",
  });

  return session;
}

// Create customer portal session
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// Update subscription from Stripe webhook
export async function updateSubscriptionFromStripe(
  stripeSubscription: Stripe.Subscription
): Promise<void> {
  const organizationId = stripeSubscription.metadata.organizationId;
  
  if (!organizationId) {
    console.error("No organizationId in subscription metadata");
    return;
  }

  const priceId = stripeSubscription.items.data[0]?.price.id;
  const plan = getPlanFromPriceId(priceId);
  const planConfig = PLANS[plan];

  const status = mapStripeStatus(stripeSubscription.status);

  // Cast to any to avoid type errors with Stripe v20
  const sub = stripeSubscription as any;

  await prisma.subscription.update({
    where: { organizationId },
    data: {
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: priceId,
      plan,
      status,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      canceledAt: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : null,
      trialStart: stripeSubscription.trial_start
        ? new Date(stripeSubscription.trial_start * 1000)
        : null,
      trialEnd: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
      maxTeamMembers: planConfig.maxTeamMembers,
      maxContracts: planConfig.maxContracts,
      maxStorage: planConfig.maxStorage,
      ...planConfig.features,
    },
  });
}

// Handle subscription deleted
export async function handleSubscriptionDeleted(
  stripeSubscription: Stripe.Subscription
): Promise<void> {
  const organizationId = stripeSubscription.metadata.organizationId;
  
  if (!organizationId) return;

  // Downgrade to free plan
  await prisma.subscription.update({
    where: { organizationId },
    data: {
      stripeSubscriptionId: null,
      stripePriceId: null,
      plan: PlanType.FREE,
      status: SubscriptionStatus.CANCELED,
      maxTeamMembers: PLANS.FREE.maxTeamMembers,
      maxContracts: PLANS.FREE.maxContracts,
      maxStorage: PLANS.FREE.maxStorage,
      ...PLANS.FREE.features,
      canceledAt: new Date(),
    },
  });
}

// Helper to get plan from price ID
function getPlanFromPriceId(priceId: string | undefined): PlanType {
  if (!priceId) return PlanType.FREE;
  
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return PlanType.STARTER;
  if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) return PlanType.PROFESSIONAL;
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return PlanType.ENTERPRISE;
  
  return PlanType.FREE;
}

// Map Stripe status to our status
function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
    trialing: SubscriptionStatus.TRIALING,
    active: SubscriptionStatus.ACTIVE,
    past_due: SubscriptionStatus.PAST_DUE,
    canceled: SubscriptionStatus.CANCELED,
    unpaid: SubscriptionStatus.UNPAID,
    incomplete: SubscriptionStatus.INCOMPLETE,
    incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
    paused: SubscriptionStatus.PAUSED,
  };
  
  return statusMap[status] || SubscriptionStatus.ACTIVE;
}

// Get subscription for organization
export async function getSubscription(organizationId: string) {
  return prisma.subscription.findUnique({
    where: { organizationId },
    include: {
      usageRecords: {
        where: {
          periodStart: { lte: new Date() },
          periodEnd: { gte: new Date() },
        },
      },
    },
  });
}

// Check if organization can perform action
export async function canPerformAction(
  organizationId: string,
  actionType: "document" | "compliance"
): Promise<{ allowed: boolean; reason?: string; subscription?: any }> {
  const subscription = await getSubscription(organizationId);

  // If no subscription, create free tier
  if (!subscription) {
    return {
      allowed: true,
      reason: "First action is free",
    };
  }

  // Check if subscription is active or in grace period
  const activeStatuses: SubscriptionStatus[] = [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.TRIALING,
    SubscriptionStatus.PAST_DUE, // Grace period - allow access for failed payments
  ];

  if (!activeStatuses.includes(subscription.status)) {
    return {
      allowed: false,
      reason: "Your subscription is not active. Please update your payment method.",
      subscription,
    };
  }

  // Show warning for past_due status but still allow access
  if (subscription.status === SubscriptionStatus.PAST_DUE) {
    console.warn(`Organization ${organizationId} is past due but within grace period`);
  }

  // Count usage this period
  const usageCount = subscription.usageRecords.filter(
    (r) =>
      r.type === (actionType === "document" ? "DOCUMENT_GENERATED" : "COMPLIANCE_CHECK")
  ).length;

  // Check against limits - use PLANS config for FREE tier to ensure updates take effect
  let limit = subscription.maxContracts;
  if (subscription.plan === PlanType.FREE) {
    limit = PLANS.FREE.maxContracts;
  }
  
  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, subscription };
  }

  if (usageCount >= limit) {
    return {
      allowed: false,
      reason: `You've reached your monthly limit of ${limit} ${actionType === "document" ? "documents" : "compliance checks"}. Upgrade your plan for more.`,
      subscription,
    };
  }

  return { allowed: true, subscription };
}

// Record usage
export async function recordUsage(
  organizationId: string,
  type: "DOCUMENT_GENERATED" | "COMPLIANCE_CHECK",
  resourceId?: string
): Promise<void> {
  let subscription = await prisma.subscription.findUnique({
    where: { organizationId },
  });

  // Create free subscription if none exists
  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: {
        organizationId,
        stripeCustomerId: `temp_${organizationId}`, // Will be replaced when they checkout
        plan: PlanType.FREE,
        status: SubscriptionStatus.ACTIVE,
        maxTeamMembers: PLANS.FREE.maxTeamMembers,
        maxContracts: PLANS.FREE.maxContracts,
        maxStorage: PLANS.FREE.maxStorage,
        ...PLANS.FREE.features,
      },
    });
  }

  // Calculate current billing period
  const now = new Date();
  const periodStart = subscription.currentPeriodStart || new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = subscription.currentPeriodEnd || new Date(now.getFullYear(), now.getMonth() + 1, 0);

  await prisma.usageRecord.create({
    data: {
      subscriptionId: subscription.id,
      type,
      resourceId,
      resourceType: type === "DOCUMENT_GENERATED" ? "document" : "compliance",
      periodStart,
      periodEnd,
    },
  });
}

// Get usage stats for organization
export async function getUsageStats(organizationId: string) {
  const subscription = await getSubscription(organizationId);

  if (!subscription) {
    return {
      documentsGenerated: 0,
      complianceChecks: 0,
      documentsLimit: 2,
      complianceLimit: 2,
      plan: "FREE" as PlanType,
      status: "ACTIVE" as SubscriptionStatus,
    };
  }

  const documentsGenerated = subscription.usageRecords.filter(
    (r) => r.type === "DOCUMENT_GENERATED"
  ).length;

  const complianceChecks = subscription.usageRecords.filter(
    (r) => r.type === "COMPLIANCE_CHECK"
  ).length;

  // Use PLANS config for FREE tier to ensure updates take effect immediately
  let documentsLimit = subscription.maxContracts;
  let complianceLimit = subscription.maxContracts;
  if (subscription.plan === PlanType.FREE) {
    documentsLimit = PLANS.FREE.maxContracts;
    complianceLimit = PLANS.FREE.maxContracts;
  }

  return {
    documentsGenerated,
    complianceChecks,
    documentsLimit,
    complianceLimit,
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
    trialEnd: subscription.trialEnd,
  };
}
