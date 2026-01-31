import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");

    const share = await prisma.documentShare.findUnique({
      where: { accessToken: token },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            content: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!share) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 });
    }

    // Check if share has expired
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Share has expired" }, { status: 410 });
    }

    // Check password if required
    if (share.password && share.password !== password) {
      return NextResponse.json(
        { error: "Password required", requiresPassword: true },
        { status: 401 }
      );
    }

    // Update view count
    await prisma.documentShare.update({
      where: { id: share.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });

    return NextResponse.json({
      document: share.document,
      permission: share.permission,
      message: share.message,
      sharedAt: share.createdAt,
      shareId: share.id,
    });
  } catch (error) {
    console.error("Error accessing share:", error);
    return NextResponse.json(
      { error: "Failed to access document" },
      { status: 500 }
    );
  }
}

// PATCH - Update document content (for users with EDIT permission)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { content } = body;

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Find the share and verify permissions
    const share = await prisma.documentShare.findUnique({
      where: { accessToken: token },
      include: {
        document: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!share) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 });
    }

    // Check if share has expired
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Share has expired" }, { status: 410 });
    }

    // Only allow editing if permission is EDIT
    if (share.permission !== "EDIT") {
      return NextResponse.json(
        { error: "You do not have permission to edit this document" },
        { status: 403 }
      );
    }

    // Update the document
    const updatedDocument = await prisma.document.update({
      where: { id: share.documentId },
      data: { content },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      updatedAt: updatedDocument.updatedAt,
    });
  } catch (error) {
    console.error("Error updating shared document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}
