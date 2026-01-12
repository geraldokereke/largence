import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { PlanType, SubscriptionStatus } from "@prisma/client";

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

/**
 * LARGENCE PRICING STRUCTURE
 * 
 * Strategy: Value-based pricing targeting African enterprises
 * - Free tier to drive adoption and word-of-mouth
 * - Starter for solopreneurs and small firms (affordable entry)
 * - Professional for growing teams (best value)
 * - Business for medium enterprises (advanced features)
 * - Enterprise for large organizations (custom pricing)
 * 
 * Annual plans: ~17% discount (2 months free)
 * All prices in USD (convert to local currency via Stripe)
 */

// Monthly prices in cents
export const PLANS = {
  FREE: {
    name: "Free",
    description: "Perfect for trying out Largence",
    monthlyPrice: 0,
    annualPrice: 0,
    monthlyPriceId: null,
    annualPriceId: null,
    maxTeamMembers: 1,
    maxDocuments: 5, // Total documents (not per month)
    maxAiGenerations: 3, // Per month
    maxComplianceChecks: 3, // Per month
    maxStorage: 100, // MB
    maxTemplates: 5,
    features: {
      hasAiDrafting: true,
      hasComplianceBasic: true,
      hasComplianceAuto: false,
      hasAnalytics: false,
      hasCustomTemplates: false,
      hasPrioritySupport: false,
      hasCustomIntegrations: false,
      hasESignatures: false,
      hasAuditLogs: false,
      hasApiAccess: false,
      hasSso: false,
      hasAdvancedExport: false,
      hasClauseLibrary: false,
      hasMatters: false,
      hasBrandedDocs: false,
      hasWhiteLabel: false,
    },
    highlights: [
      "5 documents total",
      "3 AI generations/month",
      "3 compliance checks/month",
      "Basic templates",
      "Email support",
    ],
  },
  STARTER: {
    name: "Starter",
    description: "For solopreneurs and small legal practices",
    monthlyPrice: 2900, // $29/month
    annualPrice: 29000, // $290/year (~$24.17/month, 17% off)
    monthlyPriceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
    annualPriceId: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID,
    maxTeamMembers: 3,
    maxDocuments: 50, // Per month
    maxAiGenerations: 30, // Per month
    maxComplianceChecks: 20, // Per month
    maxStorage: 2000, // 2 GB
    maxTemplates: 25,
    features: {
      hasAiDrafting: true,
      hasComplianceBasic: true,
      hasComplianceAuto: false,
      hasAnalytics: false,
      hasCustomTemplates: true,
      hasPrioritySupport: false,
      hasCustomIntegrations: false,
      hasESignatures: true, // 10/month
      hasAuditLogs: false,
      hasApiAccess: false,
      hasSso: false,
      hasAdvancedExport: true,
      hasClauseLibrary: true,
      hasMatters: false,
      hasBrandedDocs: false,
      hasWhiteLabel: false,
    },
    highlights: [
      "Up to 3 team members",
      "50 documents/month",
      "30 AI generations/month",
      "20 compliance checks/month",
      "10 e-signatures/month",
      "Clause library",
      "Cloud exports (Notion, Dropbox)",
      "Email support",
    ],
  },
  PROFESSIONAL: {
    name: "Professional",
    description: "For growing legal teams and law firms",
    monthlyPrice: 7900, // $79/month
    annualPrice: 79000, // $790/year (~$65.83/month, 17% off)
    monthlyPriceId: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID,
    annualPriceId: process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID,
    maxTeamMembers: 10,
    maxDocuments: 200, // Per month
    maxAiGenerations: 100, // Per month
    maxComplianceChecks: 100, // Per month
    maxStorage: 10000, // 10 GB
    maxTemplates: 100,
    features: {
      hasAiDrafting: true,
      hasComplianceBasic: true,
      hasComplianceAuto: true, // Automated compliance monitoring
      hasAnalytics: true,
      hasCustomTemplates: true,
      hasPrioritySupport: true,
      hasCustomIntegrations: true, // DocuSign, etc.
      hasESignatures: true, // 50/month
      hasAuditLogs: true,
      hasApiAccess: false,
      hasSso: false,
      hasAdvancedExport: true,
      hasClauseLibrary: true,
      hasMatters: true,
      hasBrandedDocs: true,
      hasWhiteLabel: false,
    },
    highlights: [
      "Up to 10 team members",
      "200 documents/month",
      "100 AI generations/month",
      "Automated compliance monitoring",
      "50 e-signatures/month",
      "Full analytics dashboard",
      "Matter management",
      "Branded documents",
      "DocuSign integration",
      "Audit trails",
      "Priority email support",
    ],
    popular: true, // Show as "Most Popular"
  },
  BUSINESS: {
    name: "Business",
    description: "For medium-sized enterprises and legal departments",
    monthlyPrice: 19900, // $199/month
    annualPrice: 199000, // $1,990/year (~$165.83/month, 17% off)
    monthlyPriceId: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    annualPriceId: process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID,
    maxTeamMembers: 30,
    maxDocuments: -1, // Unlimited
    maxAiGenerations: 500, // Per month
    maxComplianceChecks: -1, // Unlimited
    maxStorage: 50000, // 50 GB
    maxTemplates: -1, // Unlimited
    features: {
      hasAiDrafting: true,
      hasComplianceBasic: true,
      hasComplianceAuto: true,
      hasAnalytics: true,
      hasCustomTemplates: true,
      hasPrioritySupport: true,
      hasCustomIntegrations: true,
      hasESignatures: true, // Unlimited
      hasAuditLogs: true,
      hasApiAccess: true,
      hasSso: false,
      hasAdvancedExport: true,
      hasClauseLibrary: true,
      hasMatters: true,
      hasBrandedDocs: true,
      hasWhiteLabel: false,
    },
    highlights: [
      "Up to 30 team members",
      "Unlimited documents",
      "500 AI generations/month",
      "Unlimited compliance checks",
      "Unlimited e-signatures",
      "API access",
      "Advanced analytics",
      "Custom templates",
      "Dedicated support",
      "99.9% uptime SLA",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    description: "For large organizations with custom requirements",
    monthlyPrice: null, // Custom pricing
    annualPrice: null, // Custom pricing
    monthlyPriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    annualPriceId: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID,
    maxTeamMembers: -1, // Unlimited
    maxDocuments: -1, // Unlimited
    maxAiGenerations: -1, // Unlimited
    maxComplianceChecks: -1, // Unlimited
    maxStorage: -1, // Unlimited
    maxTemplates: -1, // Unlimited
    features: {
      hasAiDrafting: true,
      hasComplianceBasic: true,
      hasComplianceAuto: true,
      hasAnalytics: true,
      hasCustomTemplates: true,
      hasPrioritySupport: true,
      hasCustomIntegrations: true,
      hasESignatures: true,
      hasAuditLogs: true,
      hasApiAccess: true,
      hasSso: true,
      hasAdvancedExport: true,
      hasClauseLibrary: true,
      hasMatters: true,
      hasBrandedDocs: true,
      hasWhiteLabel: true,
    },
    highlights: [
      "Unlimited everything",
      "Single Sign-On (SSO)",
      "White-label option",
      "Custom AI training",
      "On-premise deployment option",
      "Dedicated account manager",
      "Custom SLA",
      "24/7 phone support",
      "Security audit & compliance cert",
      "Custom integrations",
    ],
  },
} as const;

// Legacy compatibility - map old plan names
export const LEGACY_PLAN_MAPPING = {
  STARTER: "STARTER",
  PROFESSIONAL: "PROFESSIONAL",
  ENTERPRISE: "ENTERPRISE",
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

  // Create or update subscription record with free plan
  const freePlan = PLANS.FREE;
  await prisma.subscription.upsert({
    where: { organizationId },
    update: { stripeCustomerId: customer.id },
    create: {
      organizationId,
      stripeCustomerId: customer.id,
      plan: PlanType.FREE,
      status: SubscriptionStatus.ACTIVE,
      maxTeamMembers: freePlan.maxTeamMembers,
      maxContracts: freePlan.maxDocuments, // PLANS uses maxDocuments, schema uses maxContracts
      maxStorage: Math.round(freePlan.maxStorage / 1000), // Convert MB to GB
      hasAiDrafting: freePlan.features.hasAiDrafting,
      hasComplianceAuto: freePlan.features.hasComplianceAuto,
      hasAnalytics: freePlan.features.hasAnalytics,
      hasCustomTemplates: freePlan.features.hasCustomTemplates,
      hasPrioritySupport: freePlan.features.hasPrioritySupport,
      hasCustomIntegrations: freePlan.features.hasCustomIntegrations,
    },
  });

  return customer.id;
}

// Create checkout session for subscription
export async function createCheckoutSession(
  organizationId: string,
  customerId: string,
  plan: keyof typeof PLANS,
  billingPeriod: "monthly" | "annual",
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const planConfig = PLANS[plan];
  
  const priceId = billingPeriod === "annual" 
    ? planConfig.annualPriceId 
    : planConfig.monthlyPriceId;
  
  if (!priceId) {
    throw new Error(`No price ID configured for plan: ${plan} (${billingPeriod})`);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      trial_period_days: 14, // 14-day free trial on all paid plans
      metadata: {
        organizationId,
        plan,
        billingPeriod,
      },
    },
    metadata: {
      organizationId,
      plan,
      billingPeriod,
    },
    allow_promotion_codes: true,
    billing_address_collection: "required",
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
      maxContracts: planConfig.maxDocuments, // PLANS uses maxDocuments, schema uses maxContracts
      maxStorage: Math.round(planConfig.maxStorage / 1000), // Convert MB to GB
      hasAiDrafting: planConfig.features.hasAiDrafting,
      hasComplianceAuto: planConfig.features.hasComplianceAuto,
      hasAnalytics: planConfig.features.hasAnalytics,
      hasCustomTemplates: planConfig.features.hasCustomTemplates,
      hasPrioritySupport: planConfig.features.hasPrioritySupport,
      hasCustomIntegrations: planConfig.features.hasCustomIntegrations,
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
      maxContracts: PLANS.FREE.maxDocuments, // PLANS uses maxDocuments, schema uses maxContracts
      maxStorage: Math.round(PLANS.FREE.maxStorage / 1000), // Convert MB to GB
      hasAiDrafting: PLANS.FREE.features.hasAiDrafting,
      hasComplianceAuto: PLANS.FREE.features.hasComplianceAuto,
      hasAnalytics: PLANS.FREE.features.hasAnalytics,
      hasCustomTemplates: PLANS.FREE.features.hasCustomTemplates,
      hasPrioritySupport: PLANS.FREE.features.hasPrioritySupport,
      hasCustomIntegrations: PLANS.FREE.features.hasCustomIntegrations,
      canceledAt: new Date(),
    },
  });
}

// Helper to get plan from price ID
function getPlanFromPriceId(priceId: string | undefined): PlanType {
  if (!priceId) return PlanType.FREE;
  
  // Check monthly prices
  if (priceId === process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || 
      priceId === process.env.STRIPE_STARTER_ANNUAL_PRICE_ID) {
    return PlanType.STARTER;
  }
  if (priceId === process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID || 
      priceId === process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID) {
    return PlanType.PROFESSIONAL;
  }
  if (priceId === process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || 
      priceId === process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID) {
    return PlanType.BUSINESS;
  }
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID || 
      priceId === process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID) {
    return PlanType.ENTERPRISE;
  }
  
  // Legacy price IDs
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return PlanType.STARTER;
  if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) return PlanType.PROFESSIONAL;
  
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
    limit = PLANS.FREE.maxDocuments; // PLANS uses maxDocuments
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
        maxContracts: PLANS.FREE.maxDocuments, // PLANS uses maxDocuments, schema uses maxContracts
        maxStorage: Math.round(PLANS.FREE.maxStorage / 1000), // Convert MB to GB
        hasAiDrafting: PLANS.FREE.features.hasAiDrafting,
        hasComplianceAuto: PLANS.FREE.features.hasComplianceAuto,
        hasAnalytics: PLANS.FREE.features.hasAnalytics,
        hasCustomTemplates: PLANS.FREE.features.hasCustomTemplates,
        hasPrioritySupport: PLANS.FREE.features.hasPrioritySupport,
        hasCustomIntegrations: PLANS.FREE.features.hasCustomIntegrations,
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
    documentsLimit = PLANS.FREE.maxDocuments; // PLANS uses maxDocuments
    complianceLimit = PLANS.FREE.maxDocuments; // PLANS uses maxDocuments
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
