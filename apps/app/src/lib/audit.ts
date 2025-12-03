import prisma from "@/lib/prisma";
import { AuditAction } from "@prisma/client";
import { headers } from "next/headers";

interface AuditLogParams {
  userId?: string | null;
  organizationId: string;
  action: AuditAction;
  actionLabel: string;
  entityType: string;
  entityId?: string | null;
  entityName: string;
  metadata?: Record<string, any> | null;
  userName?: string | null;
  userAvatar?: string | null;
  userType?: "user" | "system";
}

function getDeviceFromUserAgent(userAgent: string | null): string {
  if (!userAgent) return "Unknown";

  const isBot = /bot|crawler|spider/i.test(userAgent);
  if (isBot) return "System";

  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);

  let browser = "Unknown";
  if (/chrome/i.test(userAgent) && !/edge|edg/i.test(userAgent)) {
    browser = "Chrome";
  } else if (/firefox/i.test(userAgent)) {
    browser = "Firefox";
  } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    browser = "Safari";
  } else if (/edge|edg/i.test(userAgent)) {
    browser = "Edge";
  } else if (/opera|opr/i.test(userAgent)) {
    browser = "Opera";
  }

  if (isMobile && !isTablet) {
    return `Mobile - ${browser}`;
  } else if (isTablet) {
    return `Tablet - ${browser}`;
  }
  return `Desktop - ${browser}`;
}

export async function createAuditLog(params: AuditLogParams) {
  try {
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "Unknown";
    const userAgent = headersList.get("user-agent") || null;
    const device = getDeviceFromUserAgent(userAgent);

    // Try to get location from IP (simplified - in production use a geo-IP service)
    let location = "Unknown";

    const auditLog = await prisma.auditLog.create({
      data: {
        userId: params.userId,
        organizationId: params.organizationId,
        action: params.action,
        actionLabel: params.actionLabel,
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        metadata: params.metadata || undefined,
        ipAddress,
        userAgent,
        location,
        device,
        userName: params.userName,
        userAvatar: params.userAvatar,
        userType: params.userType || "user",
      },
    });

    return auditLog;
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit logging should not break the main flow
    return null;
  }
}

export async function createSystemAuditLog(
  organizationId: string,
  action: AuditAction,
  actionLabel: string,
  entityType: string,
  entityName: string,
  metadata?: Record<string, any> | null,
) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        userId: null,
        organizationId,
        action,
        actionLabel,
        entityType,
        entityId: null,
        entityName,
        metadata: metadata || undefined,
        ipAddress: "System",
        userAgent: null,
        location: "Automated",
        device: "System",
        userName: "Compliance AI",
        userAvatar: "AI",
        userType: "system",
      },
    });

    return auditLog;
  } catch (error) {
    console.error("Failed to create system audit log:", error);
    return null;
  }
}

// Helper to get user initials
export function getUserInitials(
  firstName?: string | null,
  lastName?: string | null,
): string {
  const first = firstName?.[0] || "";
  const last = lastName?.[0] || "";
  return (first + last).toUpperCase() || "U";
}
