import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const complianceCheck = await prisma.complianceCheck.findUnique({
      where: { id },
      include: {
        document: {
          select: {
            title: true,
            userId: true,
          },
        },
      },
    });

    if (!complianceCheck) {
      return NextResponse.json(
        { error: "Compliance check not found" },
        { status: 404 },
      );
    }

    // Verify user owns the document
    if (complianceCheck.document.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ complianceCheck });
  } catch (error) {
    console.error("Error fetching compliance check:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
