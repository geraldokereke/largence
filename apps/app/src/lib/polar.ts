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
 * Pricing tiers based on ACTUAL app features:
 * - Starter: $0/month (Free tier)
 * - Largence Student: $5/month (requires student verification)
 * - Largence Pro: $20/month
 * - Largence Max: $100/month
 * - Largence Enterprise: Custom pricing
 *
 * ACTUAL FEATURES IN THE APP:
 * - Document creation & AI generation
 * - AI document editing
 * - Compliance checking (basic & agentic AI-powered)
 * - E-signatures (internal system)
 * - Templates (create, browse community templates)
 * - Analytics dashboard
 * - Audit logs
 * - Integrations (DocuSign, Dropbox)
 * - Matter/Case management
 * - Clause library
 * - Team collaboration
 * - Document versioning & export (PDF/DOCX)
 * - Document sharing
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

// Monthly prices in cents - Features aligned with actual app capabilities
export const PLANS = {
  FREE: {
    name: "Starter",
    description: "Perfect for trying out Largence",
    monthlyPrice: 0,
    annualPrice: 0,
    polarProductId: null,
    polarPriceIdMonthly: null,
    polarPriceIdAnnual: null,
    maxTeamMembers: 1,
    maxDocuments: 5, // Total documents
    maxAiGenerations: 10, // Per month
    maxAiTokens: 50000, // 50K tokens per month
    maxComplianceChecks: 5, // Per month
    maxStorage: 100, // 100 MB
    maxTemplates: 3,
    maxESignatures: 0, // No e-signatures on free
    features: {
      // AI Features
      hasAiDrafting: true, // Basic AI document generation
      hasAiEditing: false, // AI-powered document editing
      hasAgenticCompliance: false, // AI auto-fix compliance
      // Compliance
      hasComplianceBasic: true, // Basic compliance checks
      hasComplianceAuto: false, // Automated monitoring
      // Documents
      hasDocumentVersioning: true, // Version history
      hasDocumentExport: true, // PDF/DOCX export
      hasDocumentSharing: true, // Basic sharing
      hasAdvancedExport: false, // Branded exports
      // Organization
      hasTeamCollaboration: false, // Team features
      hasCustomTemplates: false, // Create custom templates
      hasESignatures: false, // E-signature requests
      hasAuditLogs: false, // Audit trail
      hasMatters: false, // Matter management
      hasClauseLibrary: false, // Clause library
      hasCustomIntegrations: false, // DocuSign, etc.
      hasAnalytics: false, // Analytics dashboard
      hasPrioritySupport: false,
      hasApiAccess: false,
    },
    highlights: [
      "5 documents total",
      "10 AI generations/month",
      "Basic compliance checks",
      "Document export (PDF/DOCX)",
      "3 basic templates",
      "Email support",
    ],
  },
  STUDENT: {
    name: "Largence Student",
    description: "Special pricing for verified students",
    monthlyPrice: 500, // $5/month
    annualPrice: 5000, // $50/year
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
    maxESignatures: 5, // 5/month
    requiresVerification: true,
    features: {
      // AI Features
      hasAiDrafting: true,
      hasAiEditing: true, // AI document editing
      hasAgenticCompliance: false,
      // Compliance
      hasComplianceBasic: true,
      hasComplianceAuto: false,
      // Documents
      hasDocumentVersioning: true,
      hasDocumentExport: true,
      hasDocumentSharing: true,
      hasAdvancedExport: true,
      // Organization
      hasTeamCollaboration: false,
      hasCustomTemplates: true,
      hasESignatures: true, // 5/month
      hasAuditLogs: false,
      hasMatters: false,
      hasClauseLibrary: true,
      hasCustomIntegrations: false,
      hasAnalytics: true,
      hasPrioritySupport: false,
      hasApiAccess: false,
    },
    highlights: [
      "Student verified pricing",
      "30 documents/month",
      "50 AI generations/month",
      "AI document editing",
      "5 e-signatures/month",
      "Custom templates",
      "Clause library",
      "Analytics dashboard",
      "2 GB storage",
    ],
  },
  PRO: {
    name: "Largence Pro",
    description: "For professionals and small legal practices",
    monthlyPrice: 2000, // $20/month
    annualPrice: 20000, // $200/year
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
    maxESignatures: 20, // 20/month
    features: {
      // AI Features
      hasAiDrafting: true,
      hasAiEditing: true,
      hasAgenticCompliance: true, // AI auto-fix
      // Compliance
      hasComplianceBasic: true,
      hasComplianceAuto: true, // Automated monitoring
      // Documents
      hasDocumentVersioning: true,
      hasDocumentExport: true,
      hasDocumentSharing: true,
      hasAdvancedExport: true,
      // Organization
      hasTeamCollaboration: true, // Team features
      hasCustomTemplates: true,
      hasESignatures: true, // 20/month
      hasAuditLogs: true,
      hasMatters: true, // Matter management
      hasClauseLibrary: true,
      hasCustomIntegrations: true, // DocuSign
      hasAnalytics: true,
      hasPrioritySupport: false,
      hasApiAccess: false,
    },
    highlights: [
      "5 team members",
      "100 documents/month",
      "AI-powered compliance fixes",
      "20 e-signatures/month",
      "DocuSign integration",
      "Matter management",
      "Full audit trail",
      "Team collaboration",
      "10 GB storage",
    ],
    popular: true,
  },
  MAX: {
    name: "Largence Max",
    description: "For growing teams and legal departments",
    monthlyPrice: 10000, // $100/month
    annualPrice: 100000, // $1,000/year
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
    maxESignatures: -1, // Unlimited
    features: {
      // AI Features
      hasAiDrafting: true,
      hasAiEditing: true,
      hasAgenticCompliance: true,
      // Compliance
      hasComplianceBasic: true,
      hasComplianceAuto: true,
      // Documents
      hasDocumentVersioning: true,
      hasDocumentExport: true,
      hasDocumentSharing: true,
      hasAdvancedExport: true,
      // Organization
      hasTeamCollaboration: true,
      hasCustomTemplates: true,
      hasESignatures: true, // Unlimited
      hasAuditLogs: true,
      hasMatters: true,
      hasClauseLibrary: true,
      hasCustomIntegrations: true,
      hasAnalytics: true,
      hasPrioritySupport: true,
      hasApiAccess: true,
    },
    highlights: [
      "25 team members",
      "Unlimited documents",
      "500 AI generations/month",
      "Unlimited e-signatures",
      "Unlimited compliance checks",
      "API access",
      "Priority support",
      "All integrations",
      "100 GB storage",
    ],
  },
  ENTERPRISE: {
    name: "Largence Enterprise",
    description: "For large organizations with custom requirements",
    monthlyPrice: null, // Custom pricing
    annualPrice: null,
    polarProductId: process.env.POLAR_ENTERPRISE_PRODUCT_ID,
    polarPriceIdMonthly: null,
    polarPriceIdAnnual: null,
    maxTeamMembers: -1, // Unlimited
    maxDocuments: -1, // Unlimited
    maxAiGenerations: -1, // Unlimited
    maxAiTokens: -1, // Unlimited
    maxComplianceChecks: -1, // Unlimited
    maxStorage: -1, // Unlimited
    maxTemplates: -1, // Unlimited
    maxESignatures: -1, // Unlimited
    features: {
      // AI Features
      hasAiDrafting: true,
      hasAiEditing: true,
      hasAgenticCompliance: true,
      // Compliance
      hasComplianceBasic: true,
      hasComplianceAuto: true,
      // Documents
      hasDocumentVersioning: true,
      hasDocumentExport: true,
      hasDocumentSharing: true,
      hasAdvancedExport: true,
      // Organization
      hasTeamCollaboration: true,
      hasCustomTemplates: true,
      hasESignatures: true,
      hasAuditLogs: true,
      hasMatters: true,
      hasClauseLibrary: true,
      hasCustomIntegrations: true,
      hasAnalytics: true,
      hasPrioritySupport: true,
      hasApiAccess: true,
    },
    highlights: [
      "Unlimited team members",
      "Unlimited everything",
      "Dedicated account manager",
      "Custom SLA",
      "24/7 priority support",
      "Custom integrations",
      "Advanced security options",
      "Onboarding assistance",
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
 * Helper to get subscription data object from plan config
 * This ensures consistent subscription creation/updates across the app
 */
export function getSubscriptionDataFromPlan(planKey: keyof typeof PLANS) {
  const plan = PLANS[planKey];
  return {
    // Limits
    maxTeamMembers: plan.maxTeamMembers,
    maxContracts: plan.maxDocuments,
    maxStorage: Math.round(plan.maxStorage / 1000), // Convert MB to GB
    maxESignatures: plan.maxESignatures,
    maxAiGenerations: plan.maxAiGenerations,
    maxAiTokens: plan.maxAiTokens,
    maxComplianceChecks: plan.maxComplianceChecks,
    maxTemplates: plan.maxTemplates,
    // Feature flags
    hasAiDrafting: plan.features.hasAiDrafting,
    hasAiEditing: plan.features.hasAiEditing,
    hasAgenticCompliance: plan.features.hasAgenticCompliance,
    hasComplianceAuto: plan.features.hasComplianceAuto,
    hasAnalytics: plan.features.hasAnalytics,
    hasCustomTemplates: plan.features.hasCustomTemplates,
    hasPrioritySupport: plan.features.hasPrioritySupport,
    hasCustomIntegrations: plan.features.hasCustomIntegrations,
    hasESignatures: plan.features.hasESignatures,
    hasAuditLogs: plan.features.hasAuditLogs,
    hasApiAccess: plan.features.hasApiAccess,
    hasClauseLibrary: plan.features.hasClauseLibrary,
    hasMatters: plan.features.hasMatters,
    hasDocumentVersioning: plan.features.hasDocumentVersioning,
    hasDocumentExport: plan.features.hasDocumentExport,
    hasDocumentSharing: plan.features.hasDocumentSharing,
    hasTeamCollaboration: plan.features.hasTeamCollaboration,
  };
}

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
  const freePlanData = getSubscriptionDataFromPlan("FREE");
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
      ...freePlanData,
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
  const planData = getSubscriptionDataFromPlan(plan);

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
      ...planData,
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
  const freePlanData = getSubscriptionDataFromPlan("FREE");

  await prisma.subscription.update({
    where: { organizationId },
    data: {
      plan: PlanType.FREE,
      status: SubscriptionStatus.CANCELED,
      canceledAt: new Date(),
      ...freePlanData,
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
