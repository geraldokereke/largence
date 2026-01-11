import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; signatureId: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    const { id: documentId, signatureId } = await params;

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

    // Delete the signature request
    await prisma.documentSignature.delete({
      where: { id: signatureId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting signature:", error);
    return NextResponse.json(
      { error: "Failed to delete signature request" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; signatureId: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    const { id: documentId, signatureId } = await params;

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

    const signature = await prisma.documentSignature.update({
      where: { id: signatureId },
      data: {
        ...(signerName !== undefined && { signerName }),
        ...(signerEmail !== undefined && { signerEmail }),
        ...(signerRole !== undefined && { signerRole }),
        ...(signOrder !== undefined && { signOrder }),
      },
    });

    return NextResponse.json(signature);
  } catch (error) {
    console.error("Error updating signature:", error);
    return NextResponse.json(
      { error: "Failed to update signature request" },
      { status: 500 }
    );
  }
}
