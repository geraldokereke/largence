import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";

// Note: visibility and collaborators features require migration to be applied
// Until then, we'll use a simplified approach based on organizationId

export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "my"; // "my", "team", "shared"

    type DocumentListItem = {
      id: string;
      title: string;
      content: string;
      status: string;
      documentType: string;
      jurisdiction: string | null;
      userId?: string;
      createdAt: Date;
      updatedAt: Date;
      collaboratorPermission?: string;
    };

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let documents: DocumentListItem[] = [];

    if (filter === "team" && orgId) {
      // Team documents: documents from the organization but not owned by current user
      // Once migration is applied, this will filter by visibility = TEAM
      documents = await prisma.document.findMany({
        where: {
          organizationId: orgId,
          NOT: { userId }, // Exclude own documents
        },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          content: true,
          status: true,
          documentType: true,
          jurisdiction: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else if (filter === "shared") {
      // Documents specifically shared with the current user as a collaborator
      // This requires the DocumentCollaborator table from migration
      // For now, return empty until migration is applied
      try {
        const collaborations = await prisma.documentCollaborator.findMany({
          where: { userId },
          include: {
            document: {
              select: {
                id: true,
                title: true,
                content: true,
                status: true,
                documentType: true,
                jurisdiction: true,
                userId: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        
        documents = collaborations.map((c) => ({
          ...c.document,
          collaboratorPermission: c.permission,
        }));
      } catch {
        // Table doesn't exist yet, return empty
        documents = [];
      }
    } else {
      // My documents: documents created by the user
      documents = await prisma.document.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          content: true,
          status: true,
          documentType: true,
          jurisdiction: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    return NextResponse.json({ documents, filter });
  } catch (error: any) {
    console.error("Fetch documents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, documentType, jurisdiction, status } = body;

    const document = await prisma.document.create({
      data: {
        title: title || "Untitled Document",
        content: content || "",
        documentType: documentType || "Other",
        jurisdiction: jurisdiction || "General",
        status: status || "DRAFT",
        userId,
        organizationId: orgId || userId,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error: any) {
    console.error("Create document error:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 },
    );
  }
}
