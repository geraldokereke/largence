/**
 * PAYSTACK INTEGRATION
 *
 * Paystack payment gateway for African countries (Nigeria, Ghana, Kenya, South Africa)
 * Used alongside Stripe for local currency payments (NGN, GHS, KES, ZAR)
 */

import prisma from "@/lib/prisma";
import { PlanType, SubscriptionStatus } from "@prisma/client";
import { PLANS } from "./stripe";

// Paystack API configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

// Supported Paystack countries and their currencies
export const PAYSTACK_COUNTRIES = {
  NG: { currency: "NGN", name: "Nigeria", symbol: "₦" },
  GH: { currency: "GHS", name: "Ghana", symbol: "GH₵" },
  KE: { currency: "KES", name: "Kenya", symbol: "KSh" },
  ZA: { currency: "ZAR", name: "South Africa", symbol: "R" },
} as const;

export type PaystackCountryCode = keyof typeof PAYSTACK_COUNTRIES;
export type PaystackCurrency = (typeof PAYSTACK_COUNTRIES)[PaystackCountryCode]["currency"];

// Exchange rates (approximately - in production, use a real-time API)
// Base: 1 USD = X local currency
export const EXCHANGE_RATES: Record<PaystackCurrency, number> = {
  NGN: 1550, // Nigerian Naira
  GHS: 15.5, // Ghanaian Cedi
  KES: 153, // Kenyan Shilling
  ZAR: 18.5, // South African Rand
};

/**
 * PAYSTACK PRICING STRUCTURE
 *
 * Prices in local currencies (converted from USD)
 * Paystack plan codes stored in environment variables
 */
export const PAYSTACK_PLANS: Record<
  PaystackCurrency,
  Record<
    Exclude<keyof typeof PLANS, "FREE" | "ENTERPRISE">,
    {
      monthlyPrice: number;
      annualPrice: number;
      monthlyPlanCode: string | undefined;
      annualPlanCode: string | undefined;
    }
  >
> = {
  NGN: {
    STARTER: {
      monthlyPrice: Math.round(29 * EXCHANGE_RATES.NGN * 100), // In kobo
      annualPrice: Math.round(290 * EXCHANGE_RATES.NGN * 100),
      monthlyPlanCode: process.env.PAYSTACK_NGN_STARTER_MONTHLY_PLAN,
      annualPlanCode: process.env.PAYSTACK_NGN_STARTER_ANNUAL_PLAN,
    },
    PROFESSIONAL: {
      monthlyPrice: Math.round(79 * EXCHANGE_RATES.NGN * 100),
      annualPrice: Math.round(790 * EXCHANGE_RATES.NGN * 100),
      monthlyPlanCode: process.env.PAYSTACK_NGN_PROFESSIONAL_MONTHLY_PLAN,
      annualPlanCode: process.env.PAYSTACK_NGN_PROFESSIONAL_ANNUAL_PLAN,
    },
    BUSINESS: {
      monthlyPrice: Math.round(199 * EXCHANGE_RATES.NGN * 100),
      annualPrice: Math.round(1990 * EXCHANGE_RATES.NGN * 100),
      monthlyPlanCode: process.env.PAYSTACK_NGN_BUSINESS_MONTHLY_PLAN,
      annualPlanCode: process.env.PAYSTACK_NGN_BUSINESS_ANNUAL_PLAN,
    },
  },
  GHS: {
    STARTER: {
      monthlyPrice: Math.round(29 * EXCHANGE_RATES.GHS * 100), // In pesewas
      annualPrice: Math.round(290 * EXCHANGE_RATES.GHS * 100),
      monthlyPlanCode: process.env.PAYSTACK_GHS_STARTER_MONTHLY_PLAN,
      annualPlanCode: process.env.PAYSTACK_GHS_STARTER_ANNUAL_PLAN,
    },
    PROFESSIONAL: {
      monthlyPrice: Math.round(79 * EXCHANGE_RATES.GHS * 100),
      annualPrice: Math.round(790 * EXCHANGE_RATES.GHS * 100),
      monthlyPlanCode: process.env.PAYSTACK_GHS_PROFESSIONAL_MONTHLY_PLAN,
      annualPlanCode: process.env.PAYSTACK_GHS_PROFESSIONAL_ANNUAL_PLAN,
    },
    BUSINESS: {
      monthlyPrice: Math.round(199 * EXCHANGE_RATES.GHS * 100),
      annualPrice: Math.round(1990 * EXCHANGE_RATES.GHS * 100),
      monthlyPlanCode: process.env.PAYSTACK_GHS_BUSINESS_MONTHLY_PLAN,
      annualPlanCode: process.env.PAYSTACK_GHS_BUSINESS_ANNUAL_PLAN,
    },
  },
  KES: {
    STARTER: {
      monthlyPrice: Math.round(29 * EXCHANGE_RATES.KES * 100), // In cents
      annualPrice: Math.round(290 * EXCHANGE_RATES.KES * 100),
      monthlyPlanCode: process.env.PAYSTACK_KES_STARTER_MONTHLY_PLAN,
      annualPlanCode: process.env.PAYSTACK_KES_STARTER_ANNUAL_PLAN,
    },
    PROFESSIONAL: {
      monthlyPrice: Math.round(79 * EXCHANGE_RATES.KES * 100),
      annualPrice: Math.round(790 * EXCHANGE_RATES.KES * 100),
      monthlyPlanCode: process.env.PAYSTACK_KES_PROFESSIONAL_MONTHLY_PLAN,
      annualPlanCode: process.env.PAYSTACK_KES_PROFESSIONAL_ANNUAL_PLAN,
    },
    BUSINESS: {
      monthlyPrice: Math.round(199 * EXCHANGE_RATES.KES * 100),
      annualPrice: Math.round(1990 * EXCHANGE_RATES.KES * 100),
      monthlyPlanCode: process.env.PAYSTACK_KES_BUSINESS_MONTHLY_PLAN,
      annualPlanCode: process.env.PAYSTACK_KES_BUSINESS_ANNUAL_PLAN,
    },
  },
  ZAR: {
    STARTER: {
      monthlyPrice: Math.round(29 * EXCHANGE_RATES.ZAR * 100), // In cents
      annualPrice: Math.round(290 * EXCHANGE_RATES.ZAR * 100),
      monthlyPlanCode: process.env.PAYSTACK_ZAR_STARTER_MONTHLY_PLAN,
      annualPlanCode: process.env.PAYSTACK_ZAR_STARTER_ANNUAL_PLAN,
    },
    PROFESSIONAL: {
      monthlyPrice: Math.round(79 * EXCHANGE_RATES.ZAR * 100),
      annualPrice: Math.round(790 * EXCHANGE_RATES.ZAR * 100),
      monthlyPlanCode: process.env.PAYSTACK_ZAR_PROFESSIONAL_MONTHLY_PLAN,
      annualPlanCode: process.env.PAYSTACK_ZAR_PROFESSIONAL_ANNUAL_PLAN,
    },
    BUSINESS: {
      monthlyPrice: Math.round(199 * EXCHANGE_RATES.ZAR * 100),
      annualPrice: Math.round(1990 * EXCHANGE_RATES.ZAR * 100),
      monthlyPlanCode: process.env.PAYSTACK_ZAR_BUSINESS_MONTHLY_PLAN,
      annualPlanCode: process.env.PAYSTACK_ZAR_BUSINESS_ANNUAL_PLAN,
    },
  },
};

// Paystack API helper
async function paystackRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Paystack API error");
  }

  return data;
}

// Types for Paystack API responses
interface PaystackCustomer {
  id: number;
  customer_code: string;
  email: string;
  first_name?: string;
  last_name?: string;
  metadata?: Record<string, any>;
}

interface PaystackTransaction {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface PaystackSubscription {
  subscription_code: string;
  status: string;
  amount: number;
  plan: {
    plan_code: string;
    name: string;
    interval: string;
  };
  next_payment_date: string;
  email_token: string;
}

/**
 * Create or retrieve a Paystack customer
 */
export async function getOrCreatePaystackCustomer(
  organizationId: string,
  email: string,
  firstName?: string,
  lastName?: string
): Promise<string> {
  // Check if we have an existing Paystack customer
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId },
  });

  if (subscription?.paystackCustomerCode) {
    return subscription.paystackCustomerCode;
  }

  // Create new Paystack customer
  const response = await paystackRequest<{
    status: boolean;
    data: PaystackCustomer;
  }>("/customer", {
    method: "POST",
    body: JSON.stringify({
      email,
      first_name: firstName,
      last_name: lastName,
      metadata: { organizationId },
    }),
  });

  const customerCode = response.data.customer_code;

  // Update or create subscription record
  await prisma.subscription.upsert({
    where: { organizationId },
    update: { paystackCustomerCode: customerCode },
    create: {
      organizationId,
      stripeCustomerId: `paystack_${customerCode}`, // Placeholder for Stripe field
      paystackCustomerCode: customerCode,
      paymentProvider: "PAYSTACK",
      plan: PlanType.FREE,
      status: SubscriptionStatus.ACTIVE,
      maxTeamMembers: PLANS.FREE.maxTeamMembers,
      maxContracts: PLANS.FREE.maxDocuments,
      maxStorage: Math.round(PLANS.FREE.maxStorage / 1000),
      hasAiDrafting: PLANS.FREE.features.hasAiDrafting,
      hasComplianceAuto: PLANS.FREE.features.hasComplianceAuto,
      hasAnalytics: PLANS.FREE.features.hasAnalytics,
      hasCustomTemplates: PLANS.FREE.features.hasCustomTemplates,
      hasPrioritySupport: PLANS.FREE.features.hasPrioritySupport,
      hasCustomIntegrations: PLANS.FREE.features.hasCustomIntegrations,
    },
  });

  return customerCode;
}

/**
 * Initialize a Paystack transaction for subscription
 */
export async function createPaystackCheckout(
  organizationId: string,
  email: string,
  plan: "STARTER" | "PROFESSIONAL" | "BUSINESS",
  billingPeriod: "monthly" | "annual",
  currency: PaystackCurrency,
  callbackUrl: string
): Promise<{ authorizationUrl: string; reference: string }> {
  const planConfig = PAYSTACK_PLANS[currency][plan];
  const planCode =
    billingPeriod === "annual"
      ? planConfig.annualPlanCode
      : planConfig.monthlyPlanCode;

  if (!planCode) {
    throw new Error(`No Paystack plan configured for ${plan} (${currency}, ${billingPeriod})`);
  }

  // Generate unique reference
  const reference = `larg_${organizationId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const response = await paystackRequest<{
    status: boolean;
    data: PaystackTransaction;
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email,
      amount: billingPeriod === "annual" ? planConfig.annualPrice : planConfig.monthlyPrice,
      currency,
      reference,
      callback_url: callbackUrl,
      plan: planCode,
      metadata: {
        organizationId,
        plan,
        billingPeriod,
        currency,
        custom_fields: [
          {
            display_name: "Organization",
            variable_name: "organization_id",
            value: organizationId,
          },
          {
            display_name: "Plan",
            variable_name: "plan",
            value: plan,
          },
        ],
      },
    }),
  });

  return {
    authorizationUrl: response.data.authorization_url,
    reference: response.data.reference,
  };
}

/**
 * Verify a Paystack transaction
 */
export async function verifyPaystackTransaction(reference: string): Promise<{
  success: boolean;
  organizationId?: string;
  plan?: string;
  billingPeriod?: string;
  subscriptionCode?: string;
}> {
  const response = await paystackRequest<{
    status: boolean;
    data: {
      status: string;
      reference: string;
      amount: number;
      currency: string;
      plan?: { plan_code: string };
      metadata: {
        organizationId: string;
        plan: string;
        billingPeriod: string;
      };
      authorization: {
        authorization_code: string;
        card_type: string;
        last4: string;
        exp_month: string;
        exp_year: string;
        bank: string;
      };
    };
  }>(`/transaction/verify/${reference}`);

  if (response.data.status !== "success") {
    return { success: false };
  }

  return {
    success: true,
    organizationId: response.data.metadata.organizationId,
    plan: response.data.metadata.plan,
    billingPeriod: response.data.metadata.billingPeriod,
    subscriptionCode: response.data.plan?.plan_code,
  };
}

/**
 * Create a Paystack subscription
 */
export async function createPaystackSubscription(
  customerCode: string,
  planCode: string,
  authorizationCode?: string
): Promise<PaystackSubscription> {
  const body: Record<string, string> = {
    customer: customerCode,
    plan: planCode,
  };

  if (authorizationCode) {
    body.authorization = authorizationCode;
  }

  const response = await paystackRequest<{
    status: boolean;
    data: PaystackSubscription;
  }>("/subscription", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return response.data;
}

/**
 * Get subscription details
 */
export async function getPaystackSubscription(
  subscriptionCode: string
): Promise<PaystackSubscription | null> {
  try {
    const response = await paystackRequest<{
      status: boolean;
      data: PaystackSubscription;
    }>(`/subscription/${subscriptionCode}`);

    return response.data;
  } catch {
    return null;
  }
}

/**
 * Cancel a Paystack subscription
 */
export async function cancelPaystackSubscription(
  subscriptionCode: string,
  emailToken: string
): Promise<boolean> {
  try {
    await paystackRequest("/subscription/disable", {
      method: "POST",
      body: JSON.stringify({
        code: subscriptionCode,
        token: emailToken,
      }),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Enable/reactivate a Paystack subscription
 */
export async function enablePaystackSubscription(
  subscriptionCode: string,
  emailToken: string
): Promise<boolean> {
  try {
    await paystackRequest("/subscription/enable", {
      method: "POST",
      body: JSON.stringify({
        code: subscriptionCode,
        token: emailToken,
      }),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Update subscription from Paystack webhook
 */
export async function updateSubscriptionFromPaystack(
  subscriptionCode: string,
  status: string,
  planCode: string,
  nextPaymentDate: string,
  organizationId: string
): Promise<void> {
  const plan = getPlanFromPaystackCode(planCode);
  const planConfig = PLANS[plan];
  const subscriptionStatus = mapPaystackStatus(status);

  await prisma.subscription.update({
    where: { organizationId },
    data: {
      paystackSubscriptionCode: subscriptionCode,
      paystackPlanCode: planCode,
      paymentProvider: "PAYSTACK",
      plan,
      status: subscriptionStatus,
      currentPeriodEnd: new Date(nextPaymentDate),
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
 * Get plan type from Paystack plan code
 */
function getPlanFromPaystackCode(planCode: string): PlanType {
  // Check all currencies and plans
  for (const currency of Object.keys(PAYSTACK_PLANS) as PaystackCurrency[]) {
    for (const plan of Object.keys(PAYSTACK_PLANS[currency]) as Array<
      keyof (typeof PAYSTACK_PLANS)[typeof currency]
    >) {
      const config = PAYSTACK_PLANS[currency][plan];
      if (
        config.monthlyPlanCode === planCode ||
        config.annualPlanCode === planCode
      ) {
        return plan as PlanType;
      }
    }
  }
  return PlanType.FREE;
}

/**
 * Map Paystack subscription status to our status
 */
function mapPaystackStatus(status: string): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    active: SubscriptionStatus.ACTIVE,
    "non-renewing": SubscriptionStatus.ACTIVE, // Will cancel at period end
    attention: SubscriptionStatus.PAST_DUE,
    completed: SubscriptionStatus.CANCELED,
    cancelled: SubscriptionStatus.CANCELED,
  };

  return statusMap[status.toLowerCase()] || SubscriptionStatus.ACTIVE;
}

/**
 * Check if a country uses Paystack
 */
export function isPaystackCountry(countryCode: string): boolean {
  return countryCode.toUpperCase() in PAYSTACK_COUNTRIES;
}

/**
 * Get currency for a country
 */
export function getCurrencyForCountry(
  countryCode: string
): PaystackCurrency | "USD" {
  const upperCode = countryCode.toUpperCase() as PaystackCountryCode;
  if (upperCode in PAYSTACK_COUNTRIES) {
    return PAYSTACK_COUNTRIES[upperCode].currency;
  }
  return "USD";
}

/**
 * Format price in local currency
 */
export function formatPrice(
  amountInCents: number,
  currency: PaystackCurrency | "USD"
): string {
  const amount = amountInCents / 100;

  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  const countryEntry = Object.entries(PAYSTACK_COUNTRIES).find(
    ([_, config]) => config.currency === currency
  );

  if (!countryEntry) {
    return `${currency} ${amount.toFixed(2)}`;
  }

  const [countryCode, config] = countryEntry;

  // Use appropriate locale
  const locales: Record<PaystackCountryCode, string> = {
    NG: "en-NG",
    GH: "en-GH",
    KE: "en-KE",
    ZA: "en-ZA",
  };

  return new Intl.NumberFormat(locales[countryCode as PaystackCountryCode], {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convert USD price to local currency
 */
export function convertToLocalCurrency(
  usdCents: number,
  currency: PaystackCurrency
): number {
  return Math.round(usdCents * EXCHANGE_RATES[currency]);
}

/**
 * Get local prices for all plans
 */
export function getLocalPrices(currency: PaystackCurrency) {
  return {
    STARTER: {
      monthly: PAYSTACK_PLANS[currency].STARTER.monthlyPrice,
      annual: PAYSTACK_PLANS[currency].STARTER.annualPrice,
      monthlyFormatted: formatPrice(
        PAYSTACK_PLANS[currency].STARTER.monthlyPrice,
        currency
      ),
      annualFormatted: formatPrice(
        PAYSTACK_PLANS[currency].STARTER.annualPrice,
        currency
      ),
    },
    PROFESSIONAL: {
      monthly: PAYSTACK_PLANS[currency].PROFESSIONAL.monthlyPrice,
      annual: PAYSTACK_PLANS[currency].PROFESSIONAL.annualPrice,
      monthlyFormatted: formatPrice(
        PAYSTACK_PLANS[currency].PROFESSIONAL.monthlyPrice,
        currency
      ),
      annualFormatted: formatPrice(
        PAYSTACK_PLANS[currency].PROFESSIONAL.annualPrice,
        currency
      ),
    },
    BUSINESS: {
      monthly: PAYSTACK_PLANS[currency].BUSINESS.monthlyPrice,
      annual: PAYSTACK_PLANS[currency].BUSINESS.annualPrice,
      monthlyFormatted: formatPrice(
        PAYSTACK_PLANS[currency].BUSINESS.monthlyPrice,
        currency
      ),
      annualFormatted: formatPrice(
        PAYSTACK_PLANS[currency].BUSINESS.annualPrice,
        currency
      ),
    },
  };
}

/**
 * List all invoices for a customer
 */
export async function listPaystackInvoices(customerCode: string) {
  try {
    const response = await paystackRequest<{
      status: boolean;
      data: Array<{
        id: number;
        amount: number;
        currency: string;
        status: string;
        paid_at: string;
        created_at: string;
        invoice_number: string;
      }>;
    }>(`/invoice?customer=${customerCode}`);

    return response.data;
  } catch {
    return [];
  }
}

/**
 * Get payment methods (cards) for a customer
 */
export async function getPaystackPaymentMethods(customerCode: string) {
  try {
    const response = await paystackRequest<{
      status: boolean;
      data: {
        authorizations: Array<{
          authorization_code: string;
          card_type: string;
          last4: string;
          exp_month: string;
          exp_year: string;
          bank: string;
          reusable: boolean;
        }>;
      };
    }>(`/customer/${customerCode}`);

    return response.data.authorizations.filter((auth) => auth.reusable);
  } catch {
    return [];
  }
}
