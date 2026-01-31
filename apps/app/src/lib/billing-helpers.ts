import { SubscriptionStatus } from "@prisma/client";

/**
 * Check if a subscription status allows active usage
 */
export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  const activeStatuses = [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.TRIALING,
    SubscriptionStatus.PAST_DUE, // Grace period
  ] as const;
  return (activeStatuses as readonly SubscriptionStatus[]).includes(status);
}

/**
 * Check if a subscription needs payment attention
 */
export function needsPaymentAttention(status: SubscriptionStatus): boolean {
  const attentionStatuses = [
    SubscriptionStatus.PAST_DUE,
    SubscriptionStatus.UNPAID,
    SubscriptionStatus.INCOMPLETE,
  ] as const;
  return (attentionStatuses as readonly SubscriptionStatus[]).includes(status);
}

/**
 * Format currency amount from cents to dollars
 */
export function formatCurrency(
  amountInCents: number,
  currency: string = "usd"
): string {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

/**
 * Calculate proration amount for plan changes
 */
export function calculateProration(
  currentPlanPrice: number,
  newPlanPrice: number,
  daysRemaining: number,
  daysInPeriod: number
): number {
  const unusedAmount = (currentPlanPrice * daysRemaining) / daysInPeriod;
  const newAmount = (newPlanPrice * daysRemaining) / daysInPeriod;
  return newAmount - unusedAmount;
}

/**
 * Get friendly status message for subscription
 */
export function getSubscriptionStatusMessage(
  status: SubscriptionStatus
): { message: string; severity: "info" | "warning" | "error" } {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return { message: "Your subscription is active", severity: "info" };
    case SubscriptionStatus.TRIALING:
      return { message: "You're on a free trial", severity: "info" };
    case SubscriptionStatus.PAST_DUE:
      return {
        message: "Payment failed. Please update your payment method.",
        severity: "warning",
      };
    case SubscriptionStatus.UNPAID:
      return {
        message: "Your subscription is unpaid. Update payment method to continue.",
        severity: "error",
      };
    case SubscriptionStatus.CANCELED:
      return {
        message: "Your subscription has been canceled",
        severity: "error",
      };
    case SubscriptionStatus.INCOMPLETE:
      return {
        message: "Payment incomplete. Please complete payment setup.",
        severity: "warning",
      };
    case SubscriptionStatus.INCOMPLETE_EXPIRED:
      return {
        message: "Payment setup expired. Please subscribe again.",
        severity: "error",
      };
    case SubscriptionStatus.PAUSED:
      return {
        message: "Your subscription is paused",
        severity: "warning",
      };
    default:
      return { message: "Unknown status", severity: "info" };
  }
}

/**
 * Calculate days until period end
 */
export function getDaysUntilPeriodEnd(periodEnd: Date): number {
  const now = new Date();
  const diff = periodEnd.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if trial is ending soon (within 3 days)
 */
export function isTrialEndingSoon(trialEnd: Date | null): boolean {
  if (!trialEnd) return false;
  const daysRemaining = getDaysUntilPeriodEnd(trialEnd);
  return daysRemaining <= 3 && daysRemaining > 0;
}

/**
 * Validate plan upgrade/downgrade
 */
export function isValidPlanChange(
  currentPlan: string,
  newPlan: string
): { valid: boolean; reason?: string } {
  const planOrder = ["FREE", "STUDENT", "PRO", "MAX", "ENTERPRISE"];
  const currentIndex = planOrder.indexOf(currentPlan);
  const newIndex = planOrder.indexOf(newPlan);

  if (currentIndex === -1 || newIndex === -1) {
    return { valid: false, reason: "Invalid plan" };
  }

  if (currentIndex === newIndex) {
    return { valid: false, reason: "Already on this plan" };
  }

  return { valid: true };
}

/**
 * Get recommended plan based on usage
 */
export function getRecommendedPlan(usage: {
  documentsGenerated: number;
  complianceChecks: number;
  teamMembers: number;
}): "FREE" | "PRO" | "MAX" | "ENTERPRISE" {
  const totalActions = usage.documentsGenerated + usage.complianceChecks;

  if (totalActions > 500 || usage.teamMembers > 25) {
    return "ENTERPRISE";
  } else if (totalActions > 100 || usage.teamMembers > 5) {
    return "MAX";
  } else if (totalActions > 50 || usage.teamMembers > 1) {
    return "PRO";
  } else {
    return "FREE";
  }
}

/**
 * Calculate usage percentage
 */
export function getUsagePercentage(used: number, limit: number): number {
  if (limit === -1) return 0; // Unlimited
  if (limit === 0) return 100;
  return Math.round((used / limit) * 100);
}

/**
 * Check if usage is approaching limit
 */
export function isApproachingLimit(used: number, limit: number): boolean {
  if (limit === -1) return false; // Unlimited
  const percentage = getUsagePercentage(used, limit);
  return percentage >= 80;
}
