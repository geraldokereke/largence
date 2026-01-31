import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { notifyDocumentShared } from "@/lib/notifications";

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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.largence.com";
    const shareUrl = `${baseUrl}/share/${accessToken}`;

    // Send notification to the recipient
    if (sharedWithEmail) {
      try {
        const user = await currentUser();
        const sharedByName = user?.firstName 
          ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
          : user?.emailAddresses?.[0]?.emailAddress || "Someone";

        await notifyDocumentShared({
          recipientEmail: sharedWithEmail,
          documentId,
          documentTitle: document.title,
          sharedByName,
          organizationId: orgId,
          permission: permission || "VIEW",
          shareUrl,
        });
      } catch (notifyError) {
        // Don't fail the share if notification fails
        console.error("Failed to send share notification:", notifyError);
      }
    }

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
