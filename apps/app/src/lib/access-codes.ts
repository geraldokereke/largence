import prisma from "@/lib/prisma";

/**
 * Hardcoded access codes that bypass trial/payment.
 * Users who redeem these get full feature access but AI requests
 * are rate-limited to 10 per day.
 */
const VALID_ACCESS_CODES: Record<string, { name: string; description: string }> = {
  "LARGENCE-BETA-2026": { name: "Beta Tester", description: "Early beta access" },
  "LARGENCE-DEMO-VIP": { name: "VIP Demo", description: "VIP demonstration access" },
  "LARGENCE-PREVIEW-X1": { name: "Preview Access", description: "Preview program member" },
  "LARGENCE-TRIAL-PRO": { name: "Pro Trial", description: "Extended pro trial access" },
  "LARGENCE-INVITE-A1": { name: "Invite Code A", description: "Invitation program" },
  "LARGENCE-INVITE-B2": { name: "Invite Code B", description: "Invitation program" },
  "LARGENCE-INVITE-C3": { name: "Invite Code C", description: "Invitation program" },
  "LARGENCE-PARTNER-01": { name: "Partner Access", description: "Partner program" },
  "LARGENCE-LAUNCH-2026": { name: "Launch Special", description: "Launch event access" },
  "LARGENCE-COMMUNITY-X": { name: "Community", description: "Community member access" },
};

export const ACCESS_CODE_AI_DAILY_LIMIT = 10;

export function isValidAccessCode(code: string): boolean {
  return code.toUpperCase() in VALID_ACCESS_CODES;
}

export function getAccessCodeInfo(code: string) {
  return VALID_ACCESS_CODES[code.toUpperCase()] ?? null;
}

/**
 * Redeem an access code for an organization.
 * Upgrades the subscription to PRO-level features with rate-limited AI.
 */
export async function redeemAccessCode(organizationId: string, code: string) {
  const upperCode = code.toUpperCase();
  if (!isValidAccessCode(upperCode)) {
    return { success: false, error: "Invalid access code" };
  }

  const subscription = await prisma.subscription.findUnique({
    where: { organizationId },
  });

  if (subscription?.accessCode) {
    return { success: false, error: "An access code has already been redeemed for this organization" };
  }

  const now = new Date();

  // Upsert subscription with PRO-level features
  await prisma.subscription.upsert({
    where: { organizationId },
    update: {
      accessCode: upperCode,
      accessCodeRedeemedAt: now,
      aiRequestsToday: 0,
      aiRequestsResetAt: now,
      // Upgrade to PRO plan features
      plan: "PRO",
      status: "ACTIVE",
      // Generous limits
      maxTeamMembers: 5,
      maxContracts: 100,
      maxStorage: 10,
      maxAiGenerations: -1,
      maxAiTokens: -1,
      maxComplianceChecks: -1,
      maxESignatures: 20,
      maxTemplates: 50,
      // Enable all major features
      hasAiDrafting: true,
      hasAiEditing: true,
      hasAgenticCompliance: true,
      hasComplianceAuto: true,
      hasAnalytics: true,
      hasCustomTemplates: true,
      hasCustomIntegrations: true,
      hasESignatures: true,
      hasAuditLogs: true,
      hasClauseLibrary: true,
      hasMatters: true,
      hasDocumentVersioning: true,
      hasDocumentExport: true,
      hasDocumentSharing: true,
      hasTeamCollaboration: true,
    },
    create: {
      organizationId,
      accessCode: upperCode,
      accessCodeRedeemedAt: now,
      aiRequestsToday: 0,
      aiRequestsResetAt: now,
      plan: "PRO",
      status: "ACTIVE",
      maxTeamMembers: 5,
      maxContracts: 100,
      maxStorage: 10,
      maxAiGenerations: -1,
      maxAiTokens: -1,
      maxComplianceChecks: -1,
      maxESignatures: 20,
      maxTemplates: 50,
      hasAiDrafting: true,
      hasAiEditing: true,
      hasAgenticCompliance: true,
      hasComplianceAuto: true,
      hasAnalytics: true,
      hasCustomTemplates: true,
      hasCustomIntegrations: true,
      hasESignatures: true,
      hasAuditLogs: true,
      hasClauseLibrary: true,
      hasMatters: true,
      hasDocumentVersioning: true,
      hasDocumentExport: true,
      hasDocumentSharing: true,
      hasTeamCollaboration: true,
    },
  });

  const info = getAccessCodeInfo(upperCode)!;
  return { success: true, codeName: info.name, description: info.description };
}

/**
 * Check if an organization with an access code can make an AI request.
 * Returns { allowed, remaining, resetAt } or null if org has no access code.
 */
export async function checkAccessCodeAiLimit(organizationId: string): Promise<{
  hasAccessCode: boolean;
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date | null;
} | null> {
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId },
    select: {
      accessCode: true,
      aiRequestsToday: true,
      aiRequestsResetAt: true,
    },
  });

  if (!subscription?.accessCode) {
    return null; // No access code - use normal billing flow
  }

  const now = new Date();
  let requestsToday = subscription.aiRequestsToday;

  // Reset counter if it's a new day (UTC)
  if (subscription.aiRequestsResetAt) {
    const resetDate = new Date(subscription.aiRequestsResetAt);
    if (
      resetDate.getUTCFullYear() !== now.getUTCFullYear() ||
      resetDate.getUTCMonth() !== now.getUTCMonth() ||
      resetDate.getUTCDate() !== now.getUTCDate()
    ) {
      // New day - reset counter
      await prisma.subscription.update({
        where: { organizationId },
        data: { aiRequestsToday: 0, aiRequestsResetAt: now },
      });
      requestsToday = 0;
    }
  }

  const allowed = requestsToday < ACCESS_CODE_AI_DAILY_LIMIT;
  const remaining = Math.max(0, ACCESS_CODE_AI_DAILY_LIMIT - requestsToday);

  // Calculate next reset (midnight UTC)
  const resetAt = new Date(now);
  resetAt.setUTCDate(resetAt.getUTCDate() + 1);
  resetAt.setUTCHours(0, 0, 0, 0);

  return { hasAccessCode: true, allowed, remaining, limit: ACCESS_CODE_AI_DAILY_LIMIT, resetAt };
}

/**
 * Increment the daily AI request counter for an access-code org.
 */
export async function incrementAccessCodeAiUsage(organizationId: string) {
  await prisma.subscription.update({
    where: { organizationId },
    data: { aiRequestsToday: { increment: 1 } },
  });
}
