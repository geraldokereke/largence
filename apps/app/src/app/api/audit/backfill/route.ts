import { NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getUserInitials } from "@/lib/audit";

// POST: Backfill audit logs from existing documents
// This is a one-time migration endpoint to populate audit trail with historical data
export async function POST() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all documents for this organization that don't have audit logs
    const documents = await prisma.document.findMany({
      where: {
        organizationId: orgId,
      },
      orderBy: { createdAt: "asc" },
    });

    // Get existing audit log document IDs to avoid duplicates
    const existingAuditLogs = await prisma.auditLog.findMany({
      where: {
        organizationId: orgId,
        action: "DOCUMENT_CREATED",
        entityType: "Document",
      },
      select: { entityId: true },
    });

    const existingDocIds = new Set(existingAuditLogs.map((log) => log.entityId));

    // Filter documents that don't have audit logs
    const docsToBackfill = documents.filter((doc) => !existingDocIds.has(doc.id));

    if (docsToBackfill.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No documents need backfilling",
        backfilled: 0,
      });
    }

    // Get user info for the documents
    const client = await clerkClient();
    const userCache = new Map<string, { name: string; initials: string }>();

    const createdLogs = [];

    for (const doc of docsToBackfill) {
      let userName = "User";
      let userAvatar = "U";

      // Try to get user info from cache or fetch
      if (doc.userId) {
        if (userCache.has(doc.userId)) {
          const cached = userCache.get(doc.userId)!;
          userName = cached.name;
          userAvatar = cached.initials;
        } else {
          try {
            const user = await client.users.getUser(doc.userId);
            userName =
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              user.username ||
              "User";
            userAvatar = getUserInitials(user.firstName, user.lastName);
            userCache.set(doc.userId, { name: userName, initials: userAvatar });
          } catch {
            // User may have been deleted, use defaults
          }
        }
      }

      // Create audit log for document creation
      const auditLog = await prisma.auditLog.create({
        data: {
          userId: doc.userId,
          organizationId: orgId,
          action: "DOCUMENT_CREATED",
          actionLabel: `Created new ${doc.documentType || "document"}`,
          entityType: "Document",
          entityId: doc.id,
          entityName: doc.title,
          metadata: {
            documentType: doc.documentType,
            jurisdiction: doc.jurisdiction,
            backfilled: true, // Mark as backfilled for reference
          },
          ipAddress: "Backfilled",
          userAgent: null,
          location: "Historical",
          device: "Unknown",
          userName,
          userAvatar,
          userType: "user",
          createdAt: doc.createdAt, // Use original document creation date
        },
      });

      createdLogs.push(auditLog);
    }

    // Also backfill compliance checks
    const complianceChecks = await prisma.complianceCheck.findMany({
      where: {
        document: {
          organizationId: orgId,
        },
      },
      include: {
        document: {
          select: {
            title: true,
            userId: true,
            organizationId: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const existingComplianceLogs = await prisma.auditLog.findMany({
      where: {
        organizationId: orgId,
        action: "COMPLIANCE_CHECK_COMPLETED",
        entityType: "Compliance",
      },
      select: { entityId: true },
    });

    const existingComplianceIds = new Set(
      existingComplianceLogs.map((log) => log.entityId)
    );

    const complianceToBackfill = complianceChecks.filter(
      (check) => !existingComplianceIds.has(check.id)
    );

    for (const check of complianceToBackfill) {
      let userName = "User";
      let userAvatar = "U";

      if (check.document.userId && userCache.has(check.document.userId)) {
        const cached = userCache.get(check.document.userId)!;
        userName = cached.name;
        userAvatar = cached.initials;
      }

      await prisma.auditLog.create({
        data: {
          userId: check.document.userId,
          organizationId: orgId,
          action: "COMPLIANCE_CHECK_COMPLETED",
          actionLabel: `Compliance check completed (Score: ${check.overallScore || 0}/100)`,
          entityType: "Compliance",
          entityId: check.id,
          entityName: check.document.title,
          metadata: {
            score: check.overallScore,
            jurisdiction: check.jurisdiction,
            documentType: check.documentType,
            backfilled: true,
          },
          ipAddress: "Backfilled",
          userAgent: null,
          location: "Historical",
          device: "Unknown",
          userName,
          userAvatar,
          userType: "user",
          createdAt: check.completedAt || check.createdAt,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Backfilled audit logs from existing data`,
      backfilled: {
        documents: createdLogs.length,
        complianceChecks: complianceToBackfill.length,
      },
    });
  } catch (error) {
    console.error("Error backfilling audit logs:", error);
    return NextResponse.json(
      { error: "Failed to backfill audit logs" },
      { status: 500 },
    );
  }
}
