export const PUBLIC_PLAN_IDS = ["FREE", "LEARN", "EDGE", "VERTEX", "ZENITH"] as const;

export type PublicPlanId = (typeof PUBLIC_PLAN_IDS)[number];
export type InternalPlanId = "FREE" | "STUDENT" | "PRO" | "MAX" | "ENTERPRISE";

const PLAN_ID_ALIASES: Record<string, PublicPlanId> = {
  FREE: "FREE",
  ORIGIN: "FREE",
  STARTER: "FREE",

  LEARN: "LEARN",
  STUDENT: "LEARN",

  EDGE: "EDGE",
  PRO: "EDGE",
  PROFESSIONAL: "EDGE",

  VERTEX: "VERTEX",
  MAX: "VERTEX",
  BUSINESS: "VERTEX",

  ZENITH: "ZENITH",
  ENTERPRISE: "ZENITH",
};

const PUBLIC_TO_INTERNAL: Record<PublicPlanId, InternalPlanId> = {
  FREE: "FREE",
  LEARN: "STUDENT",
  EDGE: "PRO",
  VERTEX: "MAX",
  ZENITH: "ENTERPRISE",
};

export function toPublicPlanId(plan?: string | null): PublicPlanId {
  if (!plan) return "FREE";
  return PLAN_ID_ALIASES[plan.toUpperCase()] ?? "FREE";
}

export function toInternalPlanId(plan?: string | null): InternalPlanId {
  const publicId = toPublicPlanId(plan);
  return PUBLIC_TO_INTERNAL[publicId];
}

export function isPublicPaidPlan(plan: PublicPlanId): boolean {
  return plan !== "FREE";
}
