import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";
import { createAuditLog, getUserInitials } from "@/lib/audit";

// GET a specific version
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> },
) {
  try {
    const { userId, orgId } = await auth();
    const { id, versionId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify document ownership
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

    // Get the specific version
    const version = await prisma.documentVersion.findFirst({
      where: {
        id: versionId,
        documentId: id,
      },
    });

    if (!version) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ version });
  } catch (error: any) {
    console.error("Fetch document version error:", error);
    return NextResponse.json(
      { error: "Failed to fetch document version" },
      { status: 500 },
    );
  }
}

// POST restore a specific version
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> },
) {
  try {
    const { userId, orgId } = await auth();
    const { id, versionId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify document ownership
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

    // Get the version to restore
    const versionToRestore = await prisma.documentVersion.findFirst({
      where: {
        id: versionId,
        documentId: id,
      },
    });

    if (!versionToRestore) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 },
      );
    }

    const user = await currentUser();
    const userName = user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.username ||
        "User"
      : "User";
    const userAvatar = getUserInitials(user?.firstName, user?.lastName);

    // Get the latest version number
    const latestVersion = await prisma.documentVersion.findFirst({
      where: { documentId: id },
      orderBy: { version: "desc" },
    });

    const newVersionNumber = (latestVersion?.version || 0) + 1;

    // Create a new version with the current state before restoring (to preserve history)
    await prisma.documentVersion.create({
      data: {
        documentId: id,
        version: newVersionNumber,
        title: document.title,
        content: document.content,
        status: document.status,
        changeType: "RESTORE",
        changeSummary: `Restored to version ${versionToRestore.version}`,
        changedFields: ["content", "title"],
        userId,
        userName,
        userAvatar,
      },
    });

    // Update the document with the restored content
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        title: versionToRestore.title,
        content: versionToRestore.content,
        status: versionToRestore.status,
      },
    });

    // Log to audit trail
    if (orgId) {
      await createAuditLog({
        userId,
        organizationId: orgId,
        action: "DOCUMENT_UPDATED",
        actionLabel: `Restored document to version ${versionToRestore.version}`,
        entityType: "Document",
        entityId: id,
        entityName: updatedDocument.title,
        metadata: {
          restoredFromVersion: versionToRestore.version,
          previousTitle: document.title,
          newTitle: versionToRestore.title,
        },
        userName,
        userAvatar,
      });
    }

    return NextResponse.json({ 
      document: updatedDocument,
      restoredFrom: versionToRestore.version,
    });
  } catch (error: any) {
    console.error("Restore document version error:", error);
    return NextResponse.json(
      { error: "Failed to restore document version" },
      { status: 500 },
    );
  }
}
