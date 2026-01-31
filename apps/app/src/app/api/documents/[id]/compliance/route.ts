import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { runComplianceChecks } from "@largence/lib/compliance-rules";
import prisma from "@largence/lib/prisma";
import { canPerformAction, recordUsage } from "@/lib/stripe";
import { createAuditLog, getUserInitials } from "@/lib/audit";
import { sendTemplatedEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: documentId } = await params;

    // Get the document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    // Verify ownership
    if (document.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check usage limits before running compliance check
    if (orgId) {
      const usageCheck = await canPerformAction(orgId, "compliance");
      if (!usageCheck.allowed) {
        return NextResponse.json(
          {
            error: usageCheck.reason,
            requiresUpgrade: true,
            currentPlan: usageCheck.subscription?.plan || "FREE",
          },
          { status: 402 }, // Payment Required
        );
      }
    }

    // Create compliance check record
    const complianceCheck = await prisma.complianceCheck.create({
      data: {
        documentId,
        status: "IN_PROGRESS",
        issues: [],
        warnings: [],
        suggestions: [],
        rulesChecked: [],
        jurisdiction: document.jurisdiction,
        documentType: document.documentType,
      },
    });

    // Run compliance checks
    const results = runComplianceChecks(document.content, {
      title: document.title,
      documentType: document.documentType,
      jurisdiction: document.jurisdiction || undefined,
      category: document.category || undefined,
    });

    // Update compliance check with results
    const updatedCheck = await prisma.complianceCheck.update({
      where: { id: complianceCheck.id },
      data: {
        status: "COMPLETED",
        overallScore: results.score,
        issues: JSON.parse(JSON.stringify(results.issues)),
        warnings: JSON.parse(JSON.stringify(results.warnings)),
        suggestions: JSON.parse(JSON.stringify(results.suggestions)),
        completedAt: new Date(),
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        organizationId: document.organizationId,
        type: results.score >= 80 ? "COMPLIANCE_COMPLETED" : "COMPLIANCE_FAILED",
        title: "Compliance Check Complete",
        message: `Compliance check for "${document.title}" completed with a score of ${results.score}/100. ${results.issues.length} critical issues found.`,
        documentId,
        complianceId: updatedCheck.id,
        actionUrl: `/compliance/${updatedCheck.id}`,
      },
    });

    // Send email notification if score is below 80%
    if (results.score < 80) {
      try {
        const user = await currentUser();
        const userEmail = user?.emailAddresses?.[0]?.emailAddress;
        
        if (userEmail) {
          await sendTemplatedEmail("complianceComplete", userEmail, {
            documentTitle: document.title,
            score: results.score,
            issuesCount: results.issues.length,
            documentUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://app.largence.com"}/documents/${documentId}`,
          });
        }
      } catch (emailError) {
        console.error("Failed to send compliance email:", emailError);
      }
    }

    // Record usage after successful compliance check
    if (orgId) {
      await recordUsage(orgId, "COMPLIANCE_CHECK", updatedCheck.id);

      // Log audit event for compliance check
      const user = await currentUser();
      await createAuditLog({
        userId,
        organizationId: orgId,
        action: "COMPLIANCE_CHECK_COMPLETED",
        actionLabel: `Ran compliance check (Score: ${results.score}/100)`,
        entityType: "Compliance",
        entityId: updatedCheck.id,
        entityName: document.title,
        metadata: {
          documentId,
          score: results.score,
          issuesCount: results.issues.length,
          warningsCount: results.warnings.length,
          suggestionsCount: results.suggestions.length,
          jurisdiction: document.jurisdiction,
          documentType: document.documentType,
        },
        userName: user
          ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.username ||
            "User"
          : "User",
        userAvatar: getUserInitials(user?.firstName, user?.lastName),
      });
    }

    return NextResponse.json({
      success: true,
      complianceCheck: updatedCheck,
    });
  } catch (error) {
    console.error("Error running compliance check:", error);
    return NextResponse.json(
      { error: "Failed to run compliance check" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: documentId } = await params;

    // Get all compliance checks for this document
    const checks = await prisma.complianceCheck.findMany({
      where: { documentId },
      orderBy: { createdAt: "desc" },
      include: {
        document: {
          select: {
            userId: true,
          },
        },
      },
    });

    // Verify ownership
    if (checks.length > 0 && checks[0].document.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      checks: checks.map((check) => ({
        ...check,
        document: undefined,
      })),
    });
  } catch (error) {
    console.error("Error fetching compliance checks:", error);
    return NextResponse.json(
      { error: "Failed to fetch compliance checks" },
      { status: 500 },
    );
  }
}
