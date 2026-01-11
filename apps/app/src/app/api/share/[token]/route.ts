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
    });
  } catch (error) {
    console.error("Error accessing share:", error);
    return NextResponse.json(
      { error: "Failed to access document" },
      { status: 500 }
    );
  }
}
