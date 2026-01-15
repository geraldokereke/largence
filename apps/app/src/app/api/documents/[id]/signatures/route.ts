import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendTemplatedEmail } from "@/lib/email";

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

    const signatures = await prisma.documentSignature.findMany({
      where: { documentId },
      orderBy: [{ signOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(signatures);
  } catch (error) {
    console.error("Error fetching signatures:", error);
    return NextResponse.json(
      { error: "Failed to fetch signatures" },
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
    const { signerName, signerEmail, signerRole, signOrder } = body;

    if (!signerName || !signerEmail) {
      return NextResponse.json(
        { error: "Signer name and email are required" },
        { status: 400 }
      );
    }

    // Set token expiration to 30 days from now
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30);

    const signature = await prisma.documentSignature.create({
      data: {
        documentId,
        signerName,
        signerEmail,
        signerRole: signerRole || null,
        signOrder: signOrder || 1,
        tokenExpiresAt,
      },
    });

    // Generate the signing URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const signingUrl = `${baseUrl}/sign/${signature.accessToken}`;

    // Send signature request email
    try {
      const user = await currentUser();
      const senderName = user?.firstName 
        ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
        : "Someone";

      await sendTemplatedEmail("signatureRequest", signerEmail, {
        documentTitle: document.title,
        senderName,
        signingUrl,
        expiresAt: tokenExpiresAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      });
    } catch (emailError) {
      console.error("Failed to send signature request email:", emailError);
    }

    return NextResponse.json({
      ...signature,
      signingUrl,
    });
  } catch (error) {
    console.error("Error creating signature request:", error);
    return NextResponse.json(
      { error: "Failed to create signature request" },
      { status: 500 }
    );
  }
}
