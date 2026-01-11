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

    const matter = await prisma.matter.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
      include: {
        documents: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: "desc" },
        },
        _count: {
          select: { documents: true },
        },
      },
    });

    if (!matter) {
      return NextResponse.json({ error: "Matter not found" }, { status: 404 });
    }

    return NextResponse.json(matter);
  } catch (error) {
    console.error("Error fetching matter:", error);
    return NextResponse.json(
      { error: "Failed to fetch matter" },
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

    const body = await request.json();
    const {
      name,
      description,
      matterNumber,
      status,
      clientName,
      clientEmail,
      clientPhone,
      clientCompany,
      matterType,
      practiceArea,
      dueDate,
      closeDate,
      billingType,
      hourlyRate,
      flatFee,
      retainerAmount,
      notes,
    } = body;

    // Verify ownership
    const existingMatter = await prisma.matter.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!existingMatter) {
      return NextResponse.json({ error: "Matter not found" }, { status: 404 });
    }

    const matter = await prisma.matter.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(matterNumber !== undefined && { matterNumber }),
        ...(status !== undefined && { status }),
        ...(clientName !== undefined && { clientName }),
        ...(clientEmail !== undefined && { clientEmail }),
        ...(clientPhone !== undefined && { clientPhone }),
        ...(clientCompany !== undefined && { clientCompany }),
        ...(matterType !== undefined && { matterType }),
        ...(practiceArea !== undefined && { practiceArea }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(closeDate !== undefined && { closeDate: closeDate ? new Date(closeDate) : null }),
        ...(billingType !== undefined && { billingType }),
        ...(hourlyRate !== undefined && { hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null }),
        ...(flatFee !== undefined && { flatFee: flatFee ? parseFloat(flatFee) : null }),
        ...(retainerAmount !== undefined && { retainerAmount: retainerAmount ? parseFloat(retainerAmount) : null }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    return NextResponse.json(matter);
  } catch (error) {
    console.error("Error updating matter:", error);
    return NextResponse.json(
      { error: "Failed to update matter" },
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
    const existingMatter = await prisma.matter.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!existingMatter) {
      return NextResponse.json({ error: "Matter not found" }, { status: 404 });
    }

    // Delete the matter (documents will be unlinked due to the relation)
    await prisma.matter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting matter:", error);
    return NextResponse.json(
      { error: "Failed to delete matter" },
      { status: 500 }
    );
  }
}
