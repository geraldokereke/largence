import { auth } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";
import { NextResponse } from "next/server";

// Note: This API requires the team collaboration migration to be applied
// It will return appropriate errors if the tables don't exist yet

// GET all collaborators for a document
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    const { id: documentId } = await params;

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        OR: [
          { userId }, // Owner
          { organizationId: orgId }, // Same organization
        ],
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Try to get collaborators - will fail gracefully if table doesn't exist
    try {
      const collaborators = await prisma.documentCollaborator.findMany({
        where: { documentId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ collaborators, isOwner: document.userId === userId });
    } catch {
      // Table doesn't exist yet
      return NextResponse.json({ collaborators: [], isOwner: document.userId === userId });
    }
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaborators" },
      { status: 500 }
    );
  }
}

// POST add a new collaborator
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    const { id: documentId } = await params;

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify document ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        organizationId: orgId,
        userId, // Only owner can add collaborators for now
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found or not authorized" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { collaboratorUserId, permission } = body;

    if (!collaboratorUserId) {
      return NextResponse.json(
        { error: "Collaborator user ID is required" },
        { status: 400 }
      );
    }

    // Don't allow adding document owner as collaborator
    if (collaboratorUserId === document.userId) {
      return NextResponse.json(
        { error: "Cannot add document owner as collaborator" },
        { status: 400 }
      );
    }

    // Check if already a collaborator
    const existing = await prisma.documentCollaborator.findUnique({
      where: {
        documentId_userId: {
          documentId,
          userId: collaboratorUserId,
        },
      },
    });

    if (existing) {
      // Update existing collaborator permission
      const updated = await prisma.documentCollaborator.update({
        where: { id: existing.id },
        data: { permission: permission || "VIEW" },
      });
      return NextResponse.json(updated);
    }

    // Create new collaborator
    const collaborator = await prisma.documentCollaborator.create({
      data: {
        documentId,
        userId: collaboratorUserId,
        addedByUserId: userId,
        permission: permission || "VIEW",
      },
    });

    // Create notification for the collaborator
    await prisma.notification.create({
      data: {
        userId: collaboratorUserId,
        organizationId: orgId,
        type: "DOCUMENT_SHARED",
        title: "Document shared with you",
        message: `You've been added as a collaborator on "${document.title}"`,
        documentId,
        actionUrl: `/documents/${documentId}`,
      },
    });

    return NextResponse.json(collaborator, { status: 201 });
  } catch (error) {
    console.error("Error adding collaborator:", error);
    return NextResponse.json(
      { error: "Failed to add collaborator" },
      { status: 500 }
    );
  }
}

// DELETE remove a collaborator
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    const { id: documentId } = await params;
    const { searchParams } = new URL(request.url);
    const collaboratorId = searchParams.get("collaboratorId");

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!collaboratorId) {
      return NextResponse.json(
        { error: "Collaborator ID is required" },
        { status: 400 }
      );
    }

    // Verify document ownership or admin permission
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        organizationId: orgId,
        OR: [
          { userId }, // Owner
          { collaborators: { some: { userId, permission: "ADMIN" } } },
        ],
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found or not authorized" },
        { status: 404 }
      );
    }

    await prisma.documentCollaborator.delete({
      where: { id: collaboratorId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return NextResponse.json(
      { error: "Failed to remove collaborator" },
      { status: 500 }
    );
  }
}
