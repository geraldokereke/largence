import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";
import { createAuditLog, getUserInitials } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId, orgId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const document = await prisma.document.findFirst({
      where: {
        id,
        OR: [{ userId }, ...(orgId ? [{ organizationId: orgId }] : [])],
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ document });
  } catch (error: any) {
    console.error("Fetch document error:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId, orgId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, status, skipVersion } = body;

    // Verify ownership
    const existing = await prisma.document.findFirst({
      where: {
        id,
        OR: [{ userId }, ...(orgId ? [{ organizationId: orgId }] : [])],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    // Determine what changed
    const changes: string[] = [];
    if (title !== undefined && title !== existing.title) changes.push("title");
    if (content !== undefined && content !== existing.content) changes.push("content");
    if (status !== undefined && status !== existing.status) changes.push("status");

    const user = await currentUser();
    const userName = user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.username ||
        "User"
      : "User";
    const userAvatar = getUserInitials(user?.firstName, user?.lastName);

    // Create a version snapshot before updating (if there are meaningful changes and not skipped)
    // Skip version for auto-save (frequent small changes) or when explicitly requested
    if (changes.length > 0 && !skipVersion) {
      // Get the latest version number
      const latestVersion = await prisma.documentVersion.findFirst({
        where: { documentId: id },
        orderBy: { version: "desc" },
      });

      const newVersionNumber = (latestVersion?.version || 0) + 1;

      // Determine change type
      let changeType: "CREATE" | "EDIT" | "STATUS_CHANGE" | "AI_REGENERATE" | "COMPLIANCE_FIX" | "RESTORE" = "EDIT";
      let changeSummary = `Updated ${changes.join(", ")}`;

      if (changes.includes("status") && changes.length === 1) {
        changeType = "STATUS_CHANGE";
        changeSummary = `Changed status from ${existing.status} to ${status}`;
      }

      await prisma.documentVersion.create({
        data: {
          documentId: id,
          version: newVersionNumber,
          title: existing.title,
          content: existing.content,
          status: existing.status,
          changeType,
          changeSummary,
          changedFields: changes,
          userId,
          userName,
          userAvatar,
        },
      });
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(status !== undefined && { status }),
      },
    });

    // Log document update to audit trail
    if (orgId && changes.length > 0) {
      const statusLabels: Record<string, string> = {
        DRAFT: "Draft",
        FINAL: "Final",
        ARCHIVED: "Archived",
      };

      let actionLabel = "Updated document";
      const metadata: Record<string, any> = {};

      if (status !== undefined && status !== existing.status) {
        actionLabel = `Changed status from ${statusLabels[existing.status]} to ${statusLabels[status]}`;
        metadata.previousStatus = existing.status;
        metadata.newStatus = status;
      } else if (changes.length > 0) {
        actionLabel = `Updated document ${changes.join(", ")}`;
        metadata.fieldsChanged = changes;
      }

      await createAuditLog({
        userId,
        organizationId: orgId,
        action: "DOCUMENT_UPDATED",
        actionLabel,
        entityType: "Document",
        entityId: id,
        entityName: document.title,
        metadata,
        userName,
        userAvatar,
      });
    }

    return NextResponse.json({ document });
  } catch (error: any) {
    console.error("Update document error:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId, orgId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.document.findFirst({
      where: {
        id,
        OR: [{ userId }, ...(orgId ? [{ organizationId: orgId }] : [])],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    await prisma.document.delete({ where: { id } });

    // Log audit event for document deletion
    if (orgId) {
      const user = await currentUser();
      await createAuditLog({
        userId,
        organizationId: orgId,
        action: "DOCUMENT_DELETED",
        actionLabel: `Deleted document`,
        entityType: "Document",
        entityId: id,
        entityName: existing.title,
        metadata: {
          documentType: existing.documentType,
          jurisdiction: existing.jurisdiction,
        },
        userName: user
          ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.username ||
            "User"
          : "User",
        userAvatar: getUserInitials(user?.firstName, user?.lastName),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 },
    );
  }
}
