import { Polar } from "@polar-sh/sdk";
import prisma from "@/lib/prisma";
import { PlanType, SubscriptionStatus } from "@prisma/client";

// Initialize Polar client
export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});

/**
 * LARGENCE PRICING STRUCTURE (Polar.sh)
 *
 * New pricing tiers:
 * - Starter: $0/month (Free tier)
 * - Largence Pro: $20/month
 * - Largence Max: $100/month
 * - Largence Student: $5/month (requires student verification)
 * - Largence Enterprise: Custom pricing
 *
 * Token Usage Charges:
 * - AI tokens beyond plan limit: $0.002 per 1K tokens
 * - Additional documents: $0.50 per document after limit
 * - Additional compliance checks: $0.25 per check after limit
 * - Additional storage: $2 per GB after limit
 *
 * All prices in USD - Polar handles tax compliance globally
 */

// Token usage rates (in cents)
export const TOKEN_USAGE_RATES = {
  AI_TOKENS_PER_1K: 0.2, // $0.002 per 1K tokens = 0.2 cents
  DOCUMENT_OVERAGE: 50, // $0.50 per document
  COMPLIANCE_CHECK_OVERAGE: 25, // $0.25 per check
  STORAGE_GB_OVERAGE: 200, // $2 per GB
};

// Monthly prices in cents
export const PLANS = {
  FREE: {
    name: "Starter",
    description: "Perfect for trying out Largence",
    monthlyPrice: 0,
    annualPrice: 0,
    polarProductId: null, // Free tier doesn't need a product
    polarPriceIdMonthly: null,
    polarPriceIdAnnual: null,
    maxTeamMembers: 1,
    maxDocuments: 5, // Total documents (not per month)
    maxAiGenerations: 10, // Per month
    maxAiTokens: 50000, // 50K tokens per month
    maxComplianceChecks: 5, // Per month
    maxStorage: 100, // 100 MB
    maxTemplates: 3,
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
      "10 AI generations/month",
      "50K AI tokens/month",
      "5 compliance checks/month",
      "Basic templates",
      "Email support",
    ],
  },
  STUDENT: {
    name: "Largence Student",
    description: " ",
    monthlyPrice: 500, // $5/month
    annualPrice: 5000, // $50/year (~$4.17/month, 17% off)
    polarProductId: process.env.POLAR_STUDENT_PRODUCT_ID,
    polarPriceIdMonthly: process.env.POLAR_STUDENT_MONTHLY_PRICE_ID,
    polarPriceIdAnnual: process.env.POLAR_STUDENT_ANNUAL_PRICE_ID,
    maxTeamMembers: 1,
    maxDocuments: 30, // Per month
    maxAiGenerations: 50, // Per month
    maxAiTokens: 200000, // 200K tokens per month
    maxComplianceChecks: 20, // Per month
    maxStorage: 2000, // 2 GB
    maxTemplates: 15,
    requiresVerification: true, // Student verification required
    features: {
      hasAiDrafting: true,
      hasComplianceBasic: true,
      hasComplianceAuto: false,
      hasAnalytics: true,
      hasCustomTemplates: true,
      hasPrioritySupport: false,
      hasCustomIntegrations: false,
      hasESignatures: true, // 5/month
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
      "Student verified pricing",
      "30 documents/month",
      "50 AI generations/month",
      "200K AI tokens/month",
      "20 compliance checks/month",
      "5 e-signatures/month",
      "Custom templates",
      "Analytics dashboard",
      "2 GB storage",
    ],
  },
  PRO: {
    name: "Largence Pro",
    description: "For professionals and small legal practices",
    monthlyPrice: 2000, // $20/month
    annualPrice: 20000, // $200/year (~$16.67/month, 17% off)
    polarProductId: process.env.POLAR_PRO_PRODUCT_ID,
    polarPriceIdMonthly: process.env.POLAR_PRO_MONTHLY_PRICE_ID,
    polarPriceIdAnnual: process.env.POLAR_PRO_ANNUAL_PRICE_ID,
    maxTeamMembers: 5,
    maxDocuments: 100, // Per month
    maxAiGenerations: 100, // Per month
    maxAiTokens: 500000, // 500K tokens per month
    maxComplianceChecks: 50, // Per month
    maxStorage: 10000, // 10 GB
    maxTemplates: 50,
    features: {
      hasAiDrafting: true,
      hasComplianceBasic: true,
      hasComplianceAuto: true,
      hasAnalytics: true,
      hasCustomTemplates: true,
      hasPrioritySupport: false,
      hasCustomIntegrations: true,
      hasESignatures: true, // 20/month
      hasAuditLogs: true,
      hasApiAccess: false,
      hasSso: false,
      hasAdvancedExport: true,
      hasClauseLibrary: true,
      hasMatters: true,
      hasBrandedDocs: false,
      hasWhiteLabel: false,
    },
    highlights: [
      "Up to 5 team members",
      "100 documents/month",
      "100 AI generations/month",
      "500K AI tokens/month",
      "50 compliance checks/month",
      "20 e-signatures/month",
      "Automated compliance",
      "DocuSign integration",
      "Matter management",
      "Audit trails",
      "10 GB storage",
    ],
    popular: true, // Show as "Most Popular"
  },
  MAX: {
    name: "Largence Max",
    description: "For growing teams and legal departments",
    monthlyPrice: 10000, // $100/month
    annualPrice: 100000, // $1,000/year (~$83.33/month, 17% off)
    polarProductId: process.env.POLAR_MAX_PRODUCT_ID,
    polarPriceIdMonthly: process.env.POLAR_MAX_MONTHLY_PRICE_ID,
    polarPriceIdAnnual: process.env.POLAR_MAX_ANNUAL_PRICE_ID,
    maxTeamMembers: 25,
    maxDocuments: -1, // Unlimited
    maxAiGenerations: 500, // Per month
    maxAiTokens: 2000000, // 2M tokens per month
    maxComplianceChecks: -1, // Unlimited
    maxStorage: 100000, // 100 GB
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
      "Up to 25 team members",
      "Unlimited documents",
      "500 AI generations/month",
      "2M AI tokens/month",
      "Unlimited compliance checks",
      "Unlimited e-signatures",
      "API access",
      "Priority support",
      "Branded documents",
      "Advanced analytics",
      "100 GB storage",
    ],
  },
  ENTERPRISE: {
    name: "Largence Enterprise",
    description: "For large organizations with custom requirements",
    monthlyPrice: null, // Custom pricing
    annualPrice: null, // Custom pricing
    polarProductId: process.env.POLAR_ENTERPRISE_PRODUCT_ID,
    polarPriceIdMonthly: null, // Custom quote
    polarPriceIdAnnual: null, // Custom quote
    maxTeamMembers: -1, // Unlimited
    maxDocuments: -1, // Unlimited
    maxAiGenerations: -1, // Unlimited
    maxAiTokens: -1, // Unlimited
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

// Plan type mapping for database
export const PLAN_TYPE_MAPPING: Record<string, PlanType> = {
  FREE: PlanType.FREE,
  STUDENT: PlanType.STUDENT,
  PRO: PlanType.PRO,
  MAX: PlanType.MAX,
  ENTERPRISE: PlanType.ENTERPRISE,
  // Legacy mappings
  STARTER: PlanType.FREE,
  PROFESSIONAL: PlanType.PRO,
  BUSINESS: PlanType.MAX,
};

/**
 * Create a Polar checkout session
 */
export async function createPolarCheckout(
  organizationId: string,
  email: string,
  plan: keyof typeof PLANS,
  billingPeriod: "monthly" | "annual",
  successUrl: string,
  metadata?: Record<string, string>
): Promise<{ checkoutUrl: string; checkoutId: string }> {
  const planConfig = PLANS[plan];

  if (!planConfig.polarProductId) {
    throw new Error(`No Polar product configured for plan: ${plan}`);
  }

  const productId = planConfig.polarProductId;

  if (!productId) {
    throw new Error(
      `No Polar product ID configured for plan: ${plan}`
    );
  }

  const checkout = await polar.checkouts.create({
    products: [productId],
    successUrl,
    customerEmail: email,
    metadata: {
      organizationId,
      plan,
      billingPeriod,
      ...metadata,
    },
  });

  return {
    checkoutUrl: checkout.url,
    checkoutId: checkout.id,
  };
}

/**
 * Get or create a Polar customer
 */
export async function getOrCreatePolarCustomer(
  organizationId: string,
  email: string,
  name?: string
): Promise<string> {
  // Check if subscription exists with customer
  const existingSubscription = await prisma.subscription.findUnique({
    where: { organizationId },
  });

  if (existingSubscription?.polarCustomerId) {
    return existingSubscription.polarCustomerId;
  }

  // Search for existing customer by email
  const customers = await polar.customers.list({
    email,
    limit: 1,
  });

  let customerId: string;

  if (customers.result.items.length > 0) {
    customerId = customers.result.items[0].id;
  } else {
    // Create new customer
    const customer = await polar.customers.create({
      email,
      name,
      metadata: {
        organizationId,
      },
    });
    customerId = customer.id;
  }

  // Create or update subscription record with free plan
  const freePlan = PLANS.FREE;
  await prisma.subscription.upsert({
    where: { organizationId },
    update: { polarCustomerId: customerId },
    create: {
      organizationId,
      polarCustomerId: customerId,
      // Create temporary IDs - will be updated by webhook
      stripeCustomerId: `temp_polar_${organizationId}`,
      plan: PlanType.FREE,
      status: SubscriptionStatus.ACTIVE,
      maxTeamMembers: freePlan.maxTeamMembers,
      maxContracts: freePlan.maxDocuments,
      maxStorage: Math.round(freePlan.maxStorage / 1000), // Convert MB to GB
      hasAiDrafting: freePlan.features.hasAiDrafting,
      hasComplianceAuto: freePlan.features.hasComplianceAuto,
      hasAnalytics: freePlan.features.hasAnalytics,
      hasCustomTemplates: freePlan.features.hasCustomTemplates,
      hasPrioritySupport: freePlan.features.hasPrioritySupport,
      hasCustomIntegrations: freePlan.features.hasCustomIntegrations,
    },
  });

  return customerId;
}

/**
 * Get subscription for organization
 */
export async function getSubscription(organizationId: string) {
  return prisma.subscription.findUnique({
    where: { organizationId },
    include: {
      usageRecords: {
        where: {
          periodStart: {
            gte: new Date(new Date().setDate(1)), // Start of current month
          },
        },
      },
    },
  });
}

/**
 * Get usage statistics for organization
 */
export async function getUsageStats(organizationId: string) {
  const subscription = await getSubscription(organizationId);
  const planKey = (subscription?.plan || "FREE") as keyof typeof PLANS;
  const plan = PLANS[planKey] || PLANS.FREE;

  // Count usage from records
  const usageRecords = subscription?.usageRecords || [];
  const documentsGenerated = usageRecords.filter(
    (r) => r.type === "DOCUMENT_GENERATED"
  ).length;
  const complianceChecks = usageRecords.filter(
    (r) => r.type === "COMPLIANCE_CHECK"
  ).length;
  const aiTokensUsed = usageRecords
    .filter((r) => r.type === "AI_TOKEN_USAGE")
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  return {
    documentsGenerated,
    complianceChecks,
    aiTokensUsed,
    documentsLimit: plan.maxDocuments,
    complianceLimit: plan.maxComplianceChecks,
    aiTokensLimit: plan.maxAiTokens,
    plan: planKey,
    status: subscription?.status || "ACTIVE",
  };
}

/**
 * Calculate overage charges for usage
 */
export function calculateOverageCharges(
  usage: {
    documentsGenerated: number;
    complianceChecks: number;
    aiTokensUsed: number;
    storageUsedMB: number;
  },
  planKey: keyof typeof PLANS
) {
  const plan = PLANS[planKey] || PLANS.FREE;
  const charges = {
    documents: 0,
    compliance: 0,
    aiTokens: 0,
    storage: 0,
    total: 0,
  };

  // Document overage
  if (plan.maxDocuments !== -1 && usage.documentsGenerated > plan.maxDocuments) {
    const overage = usage.documentsGenerated - plan.maxDocuments;
    charges.documents = overage * TOKEN_USAGE_RATES.DOCUMENT_OVERAGE;
  }

  // Compliance overage
  if (
    plan.maxComplianceChecks !== -1 &&
    usage.complianceChecks > plan.maxComplianceChecks
  ) {
    const overage = usage.complianceChecks - plan.maxComplianceChecks;
    charges.compliance = overage * TOKEN_USAGE_RATES.COMPLIANCE_CHECK_OVERAGE;
  }

  // AI token overage
  if (plan.maxAiTokens !== -1 && usage.aiTokensUsed > plan.maxAiTokens) {
    const overageTokens = usage.aiTokensUsed - plan.maxAiTokens;
    charges.aiTokens =
      (overageTokens / 1000) * TOKEN_USAGE_RATES.AI_TOKENS_PER_1K;
  }

  // Storage overage
  const storageUsedGB = usage.storageUsedMB / 1000;
  const maxStorageGB = plan.maxStorage / 1000;
  if (plan.maxStorage !== -1 && storageUsedGB > maxStorageGB) {
    const overageGB = storageUsedGB - maxStorageGB;
    charges.storage = overageGB * TOKEN_USAGE_RATES.STORAGE_GB_OVERAGE;
  }

  charges.total =
    charges.documents + charges.compliance + charges.aiTokens + charges.storage;

  return charges;
}

/**
 * Record usage for billing
 */
export async function recordUsage(
  subscriptionId: string,
  type: "DOCUMENT_GENERATED" | "COMPLIANCE_CHECK" | "STORAGE_USED" | "TEAM_MEMBER_ADDED" | "AI_TOKEN_USAGE",
  amount?: number,
  resourceType?: string,
  resourceId?: string
) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return prisma.usageRecord.create({
    data: {
      subscriptionId,
      type,
      amount,
      resourceType,
      resourceId,
      periodStart,
      periodEnd,
    },
  });
}

/**
 * Check if organization can perform action based on plan limits
 */
export async function canPerformAction(
  organizationId: string,
  action: "create_document" | "compliance_check" | "add_member" | "use_ai"
): Promise<{ allowed: boolean; reason?: string; upgradeRequired?: boolean }> {
  const subscription = await getSubscription(organizationId);
  const planKey = (subscription?.plan || "FREE") as keyof typeof PLANS;
  const plan = PLANS[planKey] || PLANS.FREE;
  const usage = await getUsageStats(organizationId);

  switch (action) {
    case "create_document":
      if (
        plan.maxDocuments !== -1 &&
        usage.documentsGenerated >= plan.maxDocuments
      ) {
        return {
          allowed: false,
          reason: `You've reached your document limit (${plan.maxDocuments}/month). Upgrade or pay for additional documents.`,
          upgradeRequired: true,
        };
      }
      break;

    case "compliance_check":
      if (
        plan.maxComplianceChecks !== -1 &&
        usage.complianceChecks >= plan.maxComplianceChecks
      ) {
        return {
          allowed: false,
          reason: `You've reached your compliance check limit (${plan.maxComplianceChecks}/month). Upgrade or pay for additional checks.`,
          upgradeRequired: true,
        };
      }
      break;

    case "add_member":
      // Get current member count
      const memberCount = await prisma.subscription.findUnique({
        where: { organizationId },
        select: { maxTeamMembers: true },
      });
      if (plan.maxTeamMembers !== -1) {
        return {
          allowed: false,
          reason: `Your plan supports up to ${plan.maxTeamMembers} team members. Upgrade for more.`,
          upgradeRequired: true,
        };
      }
      break;

    case "use_ai":
      if (
        plan.maxAiTokens !== -1 &&
        usage.aiTokensUsed >= plan.maxAiTokens
      ) {
        return {
          allowed: false,
          reason: `You've used all your AI tokens (${plan.maxAiTokens.toLocaleString()} tokens/month). Upgrade or pay for additional tokens.`,
          upgradeRequired: true,
        };
      }
      break;
  }

  return { allowed: true };
}

/**
 * Update subscription from Polar webhook
 */
export async function updateSubscriptionFromPolar(
  polarSubscription: {
    id: string;
    customerId: string;
    productId: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd?: boolean;
    metadata?: Record<string, string>;
  }
): Promise<void> {
  const organizationId = polarSubscription.metadata?.organizationId;

  if (!organizationId) {
    console.error("No organizationId in subscription metadata");
    return;
  }

  // Find plan by product ID
  let plan: keyof typeof PLANS = "FREE";
  for (const [key, config] of Object.entries(PLANS)) {
    if (config.polarProductId === polarSubscription.productId) {
      plan = key as keyof typeof PLANS;
      break;
    }
  }

  const planConfig = PLANS[plan];
  const status = mapPolarStatus(polarSubscription.status);

  await prisma.subscription.update({
    where: { organizationId },
    data: {
      polarSubscriptionId: polarSubscription.id,
      polarCustomerId: polarSubscription.customerId,
      plan: PLAN_TYPE_MAPPING[plan] || PlanType.FREE,
      status,
      currentPeriodStart: new Date(polarSubscription.currentPeriodStart),
      currentPeriodEnd: new Date(polarSubscription.currentPeriodEnd),
      cancelAtPeriodEnd: polarSubscription.cancelAtPeriodEnd || false,
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

/**
 * Handle subscription canceled
 */
export async function handleSubscriptionCanceled(
  polarSubscription: {
    id: string;
    metadata?: Record<string, string>;
  }
): Promise<void> {
  const organizationId = polarSubscription.metadata?.organizationId;

  if (!organizationId) return;

  // Downgrade to free plan
  const freePlan = PLANS.FREE;

  await prisma.subscription.update({
    where: { organizationId },
    data: {
      plan: PlanType.FREE,
      status: SubscriptionStatus.CANCELED,
      canceledAt: new Date(),
      maxTeamMembers: freePlan.maxTeamMembers,
      maxContracts: freePlan.maxDocuments,
      maxStorage: Math.round(freePlan.maxStorage / 1000),
      hasAiDrafting: freePlan.features.hasAiDrafting,
      hasComplianceAuto: freePlan.features.hasComplianceAuto,
      hasAnalytics: freePlan.features.hasAnalytics,
      hasCustomTemplates: freePlan.features.hasCustomTemplates,
      hasPrioritySupport: freePlan.features.hasPrioritySupport,
      hasCustomIntegrations: freePlan.features.hasCustomIntegrations,
    },
  });
}

/**
 * Map Polar status to our status
 */
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

/**
 * Create customer portal session
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await polar.customerSessions.create({
    customerId,
  });

  // Return the portal URL with return URL
  return `https://polar.sh/purchases?token=${session.token}&return_url=${encodeURIComponent(returnUrl)}`;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<void> {
  if (immediately) {
    // Revoke subscription immediately
    await polar.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        revoke: true,
      } as any,
    });
  } else {
    // Cancel at end of period
    await polar.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        cancelAtPeriodEnd: true,
      } as any,
    });
  }
}

/**
 * Reactivate subscription (undo cancel at period end)
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<void> {
  await polar.subscriptions.update({
    id: subscriptionId,
    subscriptionUpdate: {
      cancelAtPeriodEnd: false,
    } as any,
  });
}

/**
 * Format price for display
 */
export function formatPrice(priceInCents: number | null): string {
  if (priceInCents === null) return "Custom";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceInCents / 100);
}

/**
 * Get plan display info
 */
export function getPlanDisplayInfo(planKey: keyof typeof PLANS) {
  const plan = PLANS[planKey];
  return {
    name: plan.name,
    description: plan.description,
    monthlyPrice: formatPrice(plan.monthlyPrice),
    annualPrice: formatPrice(plan.annualPrice),
    annualSavings: plan.monthlyPrice && plan.annualPrice 
      ? formatPrice((plan.monthlyPrice * 12) - plan.annualPrice)
      : null,
    features: plan.highlights,
    popular: "popular" in plan ? plan.popular : false,
  };
}
