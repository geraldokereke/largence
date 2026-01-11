import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";

// GET all versions for a document
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

    // Get all versions for this document
    const versions = await prisma.documentVersion.findMany({
      where: { documentId: id },
      orderBy: { version: "desc" },
      select: {
        id: true,
        version: true,
        title: true,
        content: true,
        status: true,
        changeType: true,
        changeSummary: true,
        changedFields: true,
        userId: true,
        userName: true,
        userAvatar: true,
        auditLogId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ 
      document: {
        id: document.id,
        title: document.title,
        currentContent: document.content,
        status: document.status,
      },
      versions,
      totalVersions: versions.length,
    });
  } catch (error: any) {
    console.error("Fetch document versions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch document versions" },
      { status: 500 },
    );
  }
}
