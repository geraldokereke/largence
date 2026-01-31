/**
 * Feature Gating Library
 * 
 * This module provides comprehensive feature gating based on subscription plans.
 * Use these utilities to check if a user/organization has access to specific features.
 */

import prisma from "@/lib/prisma";
import { PLANS } from "./polar";

export type FeatureKey = 
  // AI Features
  | "ai_drafting"
  | "ai_editing"
  | "agentic_compliance"
  // Compliance
  | "compliance_basic"
  | "compliance_auto"
  // Documents
  | "document_versioning"
  | "document_export"
  | "document_sharing"
  | "advanced_export"
  // Organization
  | "team_collaboration"
  | "custom_templates"
  | "e_signatures"
  | "audit_logs"
  | "matters"
  | "clause_library"
  | "custom_integrations"
  | "analytics"
  | "priority_support"
  | "api_access";

export type LimitKey =
  | "documents"
  | "ai_generations"
  | "ai_tokens"
  | "compliance_checks"
  | "e_signatures"
  | "team_members"
  | "storage"
  | "templates";

// Map feature keys to subscription fields
const FEATURE_MAP: Record<FeatureKey, keyof typeof PLANS.FREE.features> = {
  ai_drafting: "hasAiDrafting",
  ai_editing: "hasAiEditing",
  agentic_compliance: "hasAgenticCompliance",
  compliance_basic: "hasComplianceBasic",
  compliance_auto: "hasComplianceAuto",
  document_versioning: "hasDocumentVersioning",
  document_export: "hasDocumentExport",
  document_sharing: "hasDocumentSharing",
  advanced_export: "hasAdvancedExport",
  team_collaboration: "hasTeamCollaboration",
  custom_templates: "hasCustomTemplates",
  e_signatures: "hasESignatures",
  audit_logs: "hasAuditLogs",
  matters: "hasMatters",
  clause_library: "hasClauseLibrary",
  custom_integrations: "hasCustomIntegrations",
  analytics: "hasAnalytics",
  priority_support: "hasPrioritySupport",
  api_access: "hasApiAccess",
};

// Feature display names for UI
export const FEATURE_NAMES: Record<FeatureKey, string> = {
  ai_drafting: "AI Document Drafting",
  ai_editing: "AI Document Editing",
  agentic_compliance: "AI Compliance Auto-Fix",
  compliance_basic: "Basic Compliance Checks",
  compliance_auto: "Automated Compliance Monitoring",
  document_versioning: "Document Version History",
  document_export: "Document Export (PDF/DOCX)",
  document_sharing: "Document Sharing",
  advanced_export: "Advanced Export Options",
  team_collaboration: "Team Collaboration",
  custom_templates: "Custom Templates",
  e_signatures: "E-Signatures",
  audit_logs: "Audit Trail",
  matters: "Matter/Case Management",
  clause_library: "Clause Library",
  custom_integrations: "Integrations (DocuSign)",
  analytics: "Analytics Dashboard",
  priority_support: "Priority Support",
  api_access: "API Access",
};

// Minimum plan required for each feature
export const FEATURE_MIN_PLAN: Record<FeatureKey, keyof typeof PLANS> = {
  ai_drafting: "FREE",
  ai_editing: "STUDENT",
  agentic_compliance: "PRO",
  compliance_basic: "FREE",
  compliance_auto: "PRO",
  document_versioning: "FREE",
  document_export: "FREE",
  document_sharing: "FREE",
  advanced_export: "STUDENT",
  team_collaboration: "PRO",
  custom_templates: "STUDENT",
  e_signatures: "STUDENT",
  audit_logs: "PRO",
  matters: "PRO",
  clause_library: "STUDENT",
  custom_integrations: "PRO",
  analytics: "STUDENT",
  priority_support: "MAX",
  api_access: "MAX",
};

export interface FeatureCheckResult {
  allowed: boolean;
  feature: string;
  currentPlan: string;
  requiredPlan: string;
  reason?: string;
}

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
  reason?: string;
}

/**
 * Get subscription with features for an organization
 */
export async function getSubscriptionWithFeatures(organizationId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId },
  });

  if (!subscription) {
    // Return free plan defaults if no subscription
    return {
      plan: "FREE" as const,
      features: PLANS.FREE.features,
      limits: {
        maxDocuments: PLANS.FREE.maxDocuments,
        maxAiGenerations: PLANS.FREE.maxAiGenerations,
        maxAiTokens: PLANS.FREE.maxAiTokens,
        maxComplianceChecks: PLANS.FREE.maxComplianceChecks,
        maxESignatures: PLANS.FREE.maxESignatures,
        maxTeamMembers: PLANS.FREE.maxTeamMembers,
        maxStorage: PLANS.FREE.maxStorage,
        maxTemplates: PLANS.FREE.maxTemplates,
      },
      subscription: null,
    };
  }

  const planKey = subscription.plan as keyof typeof PLANS;
  const planConfig = PLANS[planKey] || PLANS.FREE;

  return {
    plan: planKey,
    features: {
      hasAiDrafting: subscription.hasAiDrafting,
      hasAiEditing: subscription.hasAiEditing ?? planConfig.features.hasAiEditing,
      hasAgenticCompliance: subscription.hasAgenticCompliance ?? planConfig.features.hasAgenticCompliance,
      hasComplianceBasic: true, // Always available
      hasComplianceAuto: subscription.hasComplianceAuto,
      hasDocumentVersioning: subscription.hasDocumentVersioning ?? planConfig.features.hasDocumentVersioning,
      hasDocumentExport: subscription.hasDocumentExport ?? planConfig.features.hasDocumentExport,
      hasDocumentSharing: subscription.hasDocumentSharing ?? planConfig.features.hasDocumentSharing,
      hasAdvancedExport: planConfig.features.hasAdvancedExport,
      hasTeamCollaboration: subscription.hasTeamCollaboration ?? planConfig.features.hasTeamCollaboration,
      hasCustomTemplates: subscription.hasCustomTemplates,
      hasESignatures: subscription.hasESignatures ?? planConfig.features.hasESignatures,
      hasAuditLogs: subscription.hasAuditLogs ?? planConfig.features.hasAuditLogs,
      hasMatters: subscription.hasMatters ?? planConfig.features.hasMatters,
      hasClauseLibrary: subscription.hasClauseLibrary ?? planConfig.features.hasClauseLibrary,
      hasCustomIntegrations: subscription.hasCustomIntegrations,
      hasAnalytics: subscription.hasAnalytics,
      hasPrioritySupport: subscription.hasPrioritySupport,
      hasApiAccess: subscription.hasApiAccess ?? planConfig.features.hasApiAccess,
    },
    limits: {
      maxDocuments: subscription.maxContracts,
      maxAiGenerations: subscription.maxAiGenerations ?? planConfig.maxAiGenerations,
      maxAiTokens: subscription.maxAiTokens ?? planConfig.maxAiTokens,
      maxComplianceChecks: subscription.maxComplianceChecks ?? planConfig.maxComplianceChecks,
      maxESignatures: subscription.maxESignatures ?? planConfig.maxESignatures,
      maxTeamMembers: subscription.maxTeamMembers,
      maxStorage: subscription.maxStorage,
      maxTemplates: subscription.maxTemplates ?? planConfig.maxTemplates,
    },
    subscription,
  };
}

/**
 * Check if a feature is available for an organization
 */
export async function canUseFeature(
  organizationId: string,
  feature: FeatureKey
): Promise<FeatureCheckResult> {
  const { plan, features } = await getSubscriptionWithFeatures(organizationId);
  const featureField = FEATURE_MAP[feature];
  const hasFeature = features[featureField as keyof typeof features] ?? false;
  const requiredPlan = FEATURE_MIN_PLAN[feature];

  return {
    allowed: hasFeature,
    feature: FEATURE_NAMES[feature],
    currentPlan: plan,
    requiredPlan,
    reason: hasFeature
      ? undefined
      : `${FEATURE_NAMES[feature]} requires ${PLANS[requiredPlan].name} plan or higher.`,
  };
}

/**
 * Check usage against limits
 */
export async function checkLimit(
  organizationId: string,
  limitKey: LimitKey,
  currentUsage: number
): Promise<LimitCheckResult> {
  const { limits, plan } = await getSubscriptionWithFeatures(organizationId);
  
  let limit: number;
  switch (limitKey) {
    case "documents":
      limit = limits.maxDocuments;
      break;
    case "ai_generations":
      limit = limits.maxAiGenerations;
      break;
    case "ai_tokens":
      limit = limits.maxAiTokens;
      break;
    case "compliance_checks":
      limit = limits.maxComplianceChecks;
      break;
    case "e_signatures":
      limit = limits.maxESignatures;
      break;
    case "team_members":
      limit = limits.maxTeamMembers;
      break;
    case "storage":
      limit = limits.maxStorage;
      break;
    case "templates":
      limit = limits.maxTemplates;
      break;
    default:
      limit = 0;
  }

  // -1 means unlimited
  const unlimited = limit === -1;
  const allowed = unlimited || currentUsage < limit;
  const remaining = unlimited ? Infinity : Math.max(0, limit - currentUsage);

  return {
    allowed,
    current: currentUsage,
    limit,
    remaining,
    unlimited,
    reason: allowed
      ? undefined
      : `You've reached your ${limitKey.replace("_", " ")} limit (${limit}). Upgrade your plan for more.`,
  };
}

/**
 * Comprehensive feature gate check for API routes
 * Use this to protect API endpoints
 */
export async function requireFeature(
  organizationId: string,
  feature: FeatureKey
): Promise<void> {
  const result = await canUseFeature(organizationId, feature);
  if (!result.allowed) {
    const error = new Error(result.reason);
    (error as any).code = "FEATURE_NOT_AVAILABLE";
    (error as any).requiredPlan = result.requiredPlan;
    throw error;
  }
}

/**
 * Comprehensive limit check for API routes
 */
export async function requireLimit(
  organizationId: string,
  limitKey: LimitKey,
  currentUsage: number
): Promise<void> {
  const result = await checkLimit(organizationId, limitKey, currentUsage);
  if (!result.allowed) {
    const error = new Error(result.reason);
    (error as any).code = "LIMIT_EXCEEDED";
    (error as any).limit = result.limit;
    (error as any).current = result.current;
    throw error;
  }
}

/**
 * Get all features available for a plan (for UI display)
 */
export function getPlanFeatures(planKey: keyof typeof PLANS) {
  const plan = PLANS[planKey];
  return {
    name: plan.name,
    description: plan.description,
    monthlyPrice: plan.monthlyPrice,
    features: Object.entries(plan.features)
      .filter(([_, value]) => value)
      .map(([key]) => {
        const featureKey = Object.entries(FEATURE_MAP).find(
          ([_, field]) => field === key
        )?.[0] as FeatureKey | undefined;
        return featureKey ? FEATURE_NAMES[featureKey] : key;
      }),
    limits: {
      documents: plan.maxDocuments === -1 ? "Unlimited" : `${plan.maxDocuments}/month`,
      aiGenerations: plan.maxAiGenerations === -1 ? "Unlimited" : `${plan.maxAiGenerations}/month`,
      aiTokens: plan.maxAiTokens === -1 ? "Unlimited" : `${(plan.maxAiTokens / 1000).toFixed(0)}K/month`,
      complianceChecks: plan.maxComplianceChecks === -1 ? "Unlimited" : `${plan.maxComplianceChecks}/month`,
      eSignatures: plan.maxESignatures === -1 ? "Unlimited" : `${plan.maxESignatures}/month`,
      teamMembers: plan.maxTeamMembers === -1 ? "Unlimited" : `${plan.maxTeamMembers}`,
      storage: plan.maxStorage === -1 ? "Unlimited" : `${(plan.maxStorage / 1000).toFixed(0)} GB`,
      templates: plan.maxTemplates === -1 ? "Unlimited" : `${plan.maxTemplates}`,
    },
  };
}

/**
 * Compare plans for upgrade flow
 */
export function comparePlans(currentPlan: keyof typeof PLANS, targetPlan: keyof typeof PLANS) {
  const current = getPlanFeatures(currentPlan);
  const target = getPlanFeatures(targetPlan);
  
  // Find new features in target plan
  const newFeatures = target.features.filter(f => !current.features.includes(f));
  
  return {
    currentPlan: current,
    targetPlan: target,
    newFeatures,
    isUpgrade: PLANS[targetPlan].monthlyPrice! > (PLANS[currentPlan].monthlyPrice ?? 0),
    priceDifference: (PLANS[targetPlan].monthlyPrice ?? 0) - (PLANS[currentPlan].monthlyPrice ?? 0),
  };
}
