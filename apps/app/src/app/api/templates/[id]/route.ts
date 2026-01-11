import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";

// GET - Get a single template
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Check access - user can view if:
    // 1. They own it
    // 2. It belongs to their organization
    // 3. It's published and public
    const hasAccess =
      template.userId === userId ||
      template.organizationId === orgId ||
      (template.isPublished && template.isPublic);

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Increment usage count when fetching for use
    const { searchParams } = new URL(request.url);
    if (searchParams.get("use") === "true") {
      await prisma.template.update({
        where: { id },
        data: { usageCount: { increment: 1 } },
      });
    }

    return NextResponse.json({
      template,
      isOwner: template.userId === userId || template.organizationId === orgId,
    });
  } catch (error: any) {
    console.error("Fetch template error:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

// PATCH - Update a template
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Only owner can update
    const isOwner =
      template.userId === userId || template.organizationId === orgId;
    if (!isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      documentType,
      jurisdiction,
      content,
      tags,
      isPublic,
      publishToDirectory,
    } = body;

    // Get author name if publishing for the first time
    let authorName = template.authorName;
    if (publishToDirectory && !template.authorName) {
      const user = await currentUser();
      authorName = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Anonymous";
    }

    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(documentType && { documentType }),
        ...(jurisdiction !== undefined && { jurisdiction }),
        ...(content && { content }),
        ...(tags && { tags }),
        ...(isPublic !== undefined && { isPublic }),
        ...(publishToDirectory !== undefined && {
          isPublished: publishToDirectory,
          publishedAt: publishToDirectory ? new Date() : null,
          authorName: publishToDirectory ? authorName : null,
        }),
      },
    });

    return NextResponse.json({ template: updatedTemplate });
  } catch (error: any) {
    console.error("Update template error:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a template
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Only owner can delete
    const isOwner =
      template.userId === userId || template.organizationId === orgId;
    if (!isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.template.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete template error:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
