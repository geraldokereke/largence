import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const eventType = searchParams.get("eventType") || "all";
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      organizationId: orgId,
    };

    // Filter by event type
    if (eventType !== "all") {
      switch (eventType) {
        case "document":
          where.entityType = "Document";
          break;
        case "approval":
          where.action = {
            in: ["DOCUMENT_APPROVED", "DOCUMENT_REJECTED"],
          };
          break;
        case "compliance":
          where.action = {
            in: [
              "COMPLIANCE_CHECK_RUN",
              "COMPLIANCE_CHECK_COMPLETED",
              "AGENTIC_COMPLIANCE_RUN",
              "AGENTIC_COMPLIANCE_COMPLETED",
            ],
          };
          break;
        case "user":
          where.entityType = "User";
          break;
        case "integration":
          where.action = {
            in: [
              "INTEGRATION_CONNECTED",
              "INTEGRATION_DISCONNECTED",
              "INTEGRATION_SYNCED",
              "INTEGRATION_ERROR",
            ],
          };
          break;
        case "system":
          where.userType = "system";
          break;
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { userName: { contains: search, mode: "insensitive" } },
        { entityName: { contains: search, mode: "insensitive" } },
        { actionLabel: { contains: search, mode: "insensitive" } },
        { ipAddress: { contains: search, mode: "insensitive" } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get audit logs with pagination
    const [auditLogs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Get counts by event type for the current week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [
      totalEventsThisWeek,
      documentEventsCount,
      approvalEventsCount,
      complianceEventsCount,
      userEventsCount,
      integrationEventsCount,
      systemEventsCount,
    ] = await Promise.all([
      prisma.auditLog.count({
        where: {
          organizationId: orgId,
          createdAt: { gte: oneWeekAgo },
        },
      }),
      prisma.auditLog.count({
        where: {
          organizationId: orgId,
          entityType: "Document",
          createdAt: { gte: oneWeekAgo },
        },
      }),
      prisma.auditLog.count({
        where: {
          organizationId: orgId,
          action: { in: ["DOCUMENT_APPROVED", "DOCUMENT_REJECTED"] },
          createdAt: { gte: oneWeekAgo },
        },
      }),
      prisma.auditLog.count({
        where: {
          organizationId: orgId,
          action: {
            in: [
              "COMPLIANCE_CHECK_RUN",
              "COMPLIANCE_CHECK_COMPLETED",
              "AGENTIC_COMPLIANCE_RUN",
              "AGENTIC_COMPLIANCE_COMPLETED",
            ],
          },
          createdAt: { gte: oneWeekAgo },
        },
      }),
      prisma.auditLog.count({
        where: {
          organizationId: orgId,
          entityType: "User",
          createdAt: { gte: oneWeekAgo },
        },
      }),
      prisma.auditLog.count({
        where: {
          organizationId: orgId,
          action: {
            in: [
              "INTEGRATION_CONNECTED",
              "INTEGRATION_DISCONNECTED",
              "INTEGRATION_SYNCED",
              "INTEGRATION_ERROR",
            ],
          },
          createdAt: { gte: oneWeekAgo },
        },
      }),
      prisma.auditLog.count({
        where: {
          organizationId: orgId,
          userType: "system",
          createdAt: { gte: oneWeekAgo },
        },
      }),
    ]);

    // Get stats
    const activeUsers = await prisma.auditLog.groupBy({
      by: ["userId"],
      where: {
        organizationId: orgId,
        createdAt: { gte: oneWeekAgo },
        userId: { not: null },
      },
    });

    const documentsModifiedToday = await prisma.auditLog.count({
      where: {
        organizationId: orgId,
        entityType: "Document",
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const lastComplianceCheck = await prisma.auditLog.findFirst({
      where: {
        organizationId: orgId,
        action: {
          in: [
            "COMPLIANCE_CHECK_RUN",
            "COMPLIANCE_CHECK_COMPLETED",
            "AGENTIC_COMPLIANCE_RUN",
            "AGENTIC_COMPLIANCE_COMPLETED",
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    return NextResponse.json({
      auditLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      eventCounts: {
        all: totalEventsThisWeek,
        document: documentEventsCount,
        approval: approvalEventsCount,
        compliance: complianceEventsCount,
        user: userEventsCount,
        integration: integrationEventsCount,
        system: systemEventsCount,
      },
      stats: {
        eventsThisWeek: totalEventsThisWeek,
        activeUsers: activeUsers.length,
        documentsModified: documentEventsCount,
        documentsModifiedToday,
        complianceChecks: complianceEventsCount,
        lastComplianceCheck: lastComplianceCheck?.createdAt || null,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 },
    );
  }
}
