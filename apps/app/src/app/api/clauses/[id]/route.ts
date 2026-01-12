import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    const { id } = await params;

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clause = await prisma.clause.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!clause) {
      return NextResponse.json({ error: "Clause not found" }, { status: 404 });
    }

    // Add title alias for client compatibility
    return NextResponse.json({
      ...clause,
      title: clause.name,
    });
  } catch (error) {
    console.error("Error fetching clause:", error);
    return NextResponse.json(
      { error: "Failed to fetch clause" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    const { id } = await params;

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existingClause = await prisma.clause.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!existingClause) {
      return NextResponse.json({ error: "Clause not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      title, // Accept both name and title for compatibility
      description,
      content,
      category,
      subcategory,
      tags,
      jurisdiction,
      documentTypes,
      isFavorite,
    } = body;

    const clauseName = name || title; // Use name if provided, otherwise fall back to title

    const clause = await prisma.clause.update({
      where: { id },
      data: {
        ...(clauseName !== undefined && { name: clauseName }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(subcategory !== undefined && { subcategory }),
        ...(tags !== undefined && { tags }),
        ...(jurisdiction !== undefined && { jurisdiction }),
        ...(documentTypes !== undefined && { documentTypes }),
        ...(isFavorite !== undefined && { isFavorite }),
      },
    });

    // Add title alias for client compatibility
    return NextResponse.json({
      ...clause,
      title: clause.name,
    });
  } catch (error) {
    console.error("Error updating clause:", error);
    return NextResponse.json(
      { error: "Failed to update clause" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    const { id } = await params;

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existingClause = await prisma.clause.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!existingClause) {
      return NextResponse.json({ error: "Clause not found" }, { status: 404 });
    }

    await prisma.clause.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting clause:", error);
    return NextResponse.json(
      { error: "Failed to delete clause" },
      { status: 500 }
    );
  }
}
