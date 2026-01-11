import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Fetch document for signing
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const signature = await prisma.documentSignature.findUnique({
      where: { accessToken: token },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
      },
    });

    if (!signature) {
      return NextResponse.json(
        { error: "Signature request not found" },
        { status: 404 }
      );
    }

    // Check if token has expired
    if (new Date(signature.tokenExpiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Signature request has expired" },
        { status: 410 }
      );
    }

    // Check if already signed
    if (signature.status === "SIGNED") {
      return NextResponse.json(
        { error: "Document has already been signed", alreadySigned: true },
        { status: 400 }
      );
    }

    // Mark as viewed if pending
    if (signature.status === "PENDING") {
      await prisma.documentSignature.update({
        where: { id: signature.id },
        data: { status: "VIEWED" },
      });
    }

    return NextResponse.json({
      signature: {
        id: signature.id,
        signerName: signature.signerName,
        signerEmail: signature.signerEmail,
        signerRole: signature.signerRole,
        status: signature.status,
      },
      document: signature.document,
    });
  } catch (error) {
    console.error("Error fetching signature request:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

// POST: Submit signature
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { signatureData, signatureType } = body;

    if (!signatureData) {
      return NextResponse.json(
        { error: "Signature data is required" },
        { status: 400 }
      );
    }

    const signature = await prisma.documentSignature.findUnique({
      where: { accessToken: token },
    });

    if (!signature) {
      return NextResponse.json(
        { error: "Signature request not found" },
        { status: 404 }
      );
    }

    // Check if token has expired
    if (new Date(signature.tokenExpiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Signature request has expired" },
        { status: 410 }
      );
    }

    // Check if already signed
    if (signature.status === "SIGNED") {
      return NextResponse.json(
        { error: "Document has already been signed" },
        { status: 400 }
      );
    }

    // Get IP and user agent for audit trail
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0] : "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Update signature with the signed data
    const updatedSignature = await prisma.documentSignature.update({
      where: { id: signature.id },
      data: {
        signatureData,
        signatureType: signatureType || "DRAW",
        status: "SIGNED",
        signedAt: new Date(),
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      signature: {
        id: updatedSignature.id,
        status: updatedSignature.status,
        signedAt: updatedSignature.signedAt,
      },
    });
  } catch (error) {
    console.error("Error submitting signature:", error);
    return NextResponse.json(
      { error: "Failed to submit signature" },
      { status: 500 }
    );
  }
}
