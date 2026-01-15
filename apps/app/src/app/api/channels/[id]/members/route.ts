import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// POST /api/channels/[id]/members - Add members to channel
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

    const body = await request.json();
    const { userIds } = body;

    if (!userIds?.length) {
      return NextResponse.json(
        { error: "User IDs are required" },
        { status: 400 }
      );
    }

    // Verify channel and user permissions
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

    // For private channels, only owners/admins can add members
    if (channel.type === "PRIVATE" || channel.type === "DIRECT") {
      const membership = channel.members[0];
      if (
        !membership ||
        (membership.role !== "OWNER" && membership.role !== "ADMIN")
      ) {
        return NextResponse.json(
          { error: "Only admins can add members to private channels" },
          { status: 403 }
        );
      }
    }

    // Add members
    const members = await prisma.channelMember.createMany({
      data: userIds.map((uid: string) => ({
        channelId: id,
        userId: uid,
        role: "MEMBER",
      })),
      skipDuplicates: true,
    });

    // Create system message
    await prisma.channelMessage.create({
      data: {
        channelId: id,
        userId,
        userName: "System",
        content: `${userIds.length} member(s) were added to the channel`,
        type: "SYSTEM",
      },
    });

    return NextResponse.json({ added: members.count }, { status: 201 });
  } catch (error) {
    console.error("Error adding members:", error);
    return NextResponse.json(
      { error: "Failed to add members" },
      { status: 500 }
    );
  }
}

// DELETE /api/channels/[id]/members - Remove member or leave channel
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

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId") || userId;

    // Verify channel
    const channel = await prisma.channel.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
      include: {
        members: true,
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const currentMembership = channel.members.find((m) => m.userId === userId);
    const targetMembership = channel.members.find(
      (m) => m.userId === targetUserId
    );

    if (!targetMembership) {
      return NextResponse.json(
        { error: "User is not a member" },
        { status: 404 }
      );
    }

    // Can't remove yourself if you're the owner (must transfer ownership first)
    if (targetUserId === userId && targetMembership.role === "OWNER") {
      return NextResponse.json(
        { error: "Owner cannot leave channel. Transfer ownership first." },
        { status: 400 }
      );
    }

    // If removing someone else, must be owner/admin
    if (targetUserId !== userId) {
      if (
        !currentMembership ||
        (currentMembership.role !== "OWNER" && currentMembership.role !== "ADMIN")
      ) {
        return NextResponse.json(
          { error: "Only admins can remove members" },
          { status: 403 }
        );
      }
    }

    // Remove member
    await prisma.channelMember.delete({
      where: {
        channelId_userId: {
          channelId: id,
          userId: targetUserId,
        },
      },
    });

    // Create system message
    await prisma.channelMessage.create({
      data: {
        channelId: id,
        userId,
        userName: "System",
        content:
          targetUserId === userId
            ? "A member left the channel"
            : "A member was removed from the channel",
        type: "SYSTEM",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}

// PATCH /api/channels/[id]/members - Update member settings
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
    const { targetUserId, role, isMuted } = body;

    const actualTargetUserId = targetUserId || userId;

    // Verify channel
    const channel = await prisma.channel.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
      include: {
        members: true,
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const currentMembership = channel.members.find((m) => m.userId === userId);

    // For muting self, anyone can do it
    if (isMuted !== undefined && actualTargetUserId === userId) {
      const updated = await prisma.channelMember.update({
        where: {
          channelId_userId: {
            channelId: id,
            userId,
          },
        },
        data: { isMuted },
      });
      return NextResponse.json(updated);
    }

    // For role changes, must be owner
    if (role !== undefined) {
      if (!currentMembership || currentMembership.role !== "OWNER") {
        return NextResponse.json(
          { error: "Only the owner can change roles" },
          { status: 403 }
        );
      }

      // If transferring ownership, demote self
      if (role === "OWNER" && actualTargetUserId !== userId) {
        await prisma.$transaction([
          prisma.channelMember.update({
            where: {
              channelId_userId: {
                channelId: id,
                userId,
              },
            },
            data: { role: "ADMIN" },
          }),
          prisma.channelMember.update({
            where: {
              channelId_userId: {
                channelId: id,
                userId: actualTargetUserId,
              },
            },
            data: { role: "OWNER" },
          }),
        ]);

        return NextResponse.json({ success: true });
      }

      const updated = await prisma.channelMember.update({
        where: {
          channelId_userId: {
            channelId: id,
            userId: actualTargetUserId,
          },
        },
        data: { role },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}
