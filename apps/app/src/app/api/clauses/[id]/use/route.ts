import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Track clause usage
export async function POST(
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

    // Increment usage count
    const clause = await prisma.clause.update({
      where: { id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    return NextResponse.json(clause);
  } catch (error) {
    console.error("Error tracking clause use:", error);
    return NextResponse.json(
      { error: "Failed to track clause use" },
      { status: 500 }
    );
  }
}
