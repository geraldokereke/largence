import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

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

    // Verify document ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        organizationId: orgId,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const shares = await prisma.documentShare.findMany({
      where: { documentId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(shares);
  } catch (error) {
    console.error("Error fetching shares:", error);
    return NextResponse.json(
      { error: "Failed to fetch shares" },
      { status: 500 }
    );
  }
}

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
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const body = await request.json();
    const { sharedWithEmail, permission, expiresAt, password, message } = body;

    // Generate a unique access token
    const accessToken = randomBytes(32).toString("hex");

    const share = await prisma.documentShare.create({
      data: {
        documentId,
        sharedByUserId: userId,
        sharedWithEmail,
        permission: permission || "VIEW",
        accessToken,
        password: password || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        message,
      },
    });

    // Generate the share URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const shareUrl = `${baseUrl}/share/${accessToken}`;

    return NextResponse.json({
      ...share,
      shareUrl,
    });
  } catch (error) {
    console.error("Error creating share:", error);
    return NextResponse.json(
      { error: "Failed to create share" },
      { status: 500 }
    );
  }
}
