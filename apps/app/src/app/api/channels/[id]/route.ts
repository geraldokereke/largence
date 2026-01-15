import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET /api/channels/[id] - Get channel details
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

    const channel = await prisma.channel.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
      include: {
        members: {
          include: {
            // We'll need to get user info from Clerk in the frontend
          },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    // Check if user has access to private channel
    if (
      channel.type === "PRIVATE" ||
      channel.type === "DIRECT"
    ) {
      const isMember = channel.members.some((m) => m.userId === userId);
      if (!isMember) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    return NextResponse.json(channel);
  } catch (error) {
    console.error("Error fetching channel:", error);
    return NextResponse.json(
      { error: "Failed to fetch channel" },
      { status: 500 }
    );
  }
}

// PATCH /api/channels/[id] - Update channel
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
    const { name, description, isArchived } = body;

    // Check if user is owner or admin
    const channel = await prisma.channel.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const membership = channel.members[0];
    if (
      !membership ||
      (membership.role !== "OWNER" && membership.role !== "ADMIN")
    ) {
      return NextResponse.json(
        { error: "Only admins can update channel" },
        { status: 403 }
      );
    }

    const updatedChannel = await prisma.channel.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(isArchived !== undefined && { isArchived }),
      },
      include: {
        members: true,
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    });

    return NextResponse.json(updatedChannel);
  } catch (error) {
    console.error("Error updating channel:", error);
    return NextResponse.json(
      { error: "Failed to update channel" },
      { status: 500 }
    );
  }
}

// DELETE /api/channels/[id] - Delete channel
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

    // Check if user is owner
    const channel = await prisma.channel.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const membership = channel.members[0];
    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only the owner can delete channel" },
        { status: 403 }
      );
    }

    await prisma.channel.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting channel:", error);
    return NextResponse.json(
      { error: "Failed to delete channel" },
      { status: 500 }
    );
  }
}
