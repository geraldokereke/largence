import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET /api/channels/[id]/messages - Get messages for a channel
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

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "50");
    const parentId = searchParams.get("parentId"); // For thread replies

    // Verify channel access
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

    // Check access for private channels
    if (channel.type === "PRIVATE" || channel.type === "DIRECT") {
      const isMember = channel.members.length > 0;
      if (!isMember) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Fetch messages
    const messages = await prisma.channelMessage.findMany({
      where: {
        channelId: id,
        isDeleted: false,
        ...(parentId ? { parentId } : { parentId: null }), // Top-level or replies
      },
      orderBy: { createdAt: parentId ? "asc" : "desc" },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      include: {
        _count: {
          select: { replies: true },
        },
      },
    });

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, -1) : messages;

    // Update last read timestamp
    await prisma.channelMember.upsert({
      where: {
        channelId_userId: {
          channelId: id,
          userId,
        },
      },
      update: {
        lastReadAt: new Date(),
      },
      create: {
        channelId: id,
        userId,
        lastReadAt: new Date(),
      },
    });

    return NextResponse.json({
      messages: parentId ? items : items.reverse(), // Chronological order
      nextCursor: hasMore ? items[items.length - 1]?.id : null,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/channels/[id]/messages - Send a message
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
    const {
      content,
      type = "TEXT",
      attachments,
      documentId,
      matterId,
      parentId,
      mentionedUserIds,
      userName,
      userAvatar,
    } = body;

    if (!content?.trim() && type === "TEXT") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Verify channel exists and user has access
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

    // Auto-join public channels when sending message
    if (channel.type === "PUBLIC" && channel.members.length === 0) {
      await prisma.channelMember.create({
        data: {
          channelId: id,
          userId,
        },
      });
    } else if (
      (channel.type === "PRIVATE" || channel.type === "DIRECT") &&
      channel.members.length === 0
    ) {
      return NextResponse.json(
        { error: "You must be a member to send messages" },
        { status: 403 }
      );
    }

    // Create message
    const message = await prisma.channelMessage.create({
      data: {
        channelId: id,
        userId,
        userName: userName || "Unknown User",
        userAvatar,
        content: content.trim(),
        type,
        attachments,
        documentId,
        matterId,
        parentId,
        mentionedUserIds: mentionedUserIds || [],
      },
      include: {
        _count: {
          select: { replies: true },
        },
      },
    });

    // Update reply count if this is a reply
    if (parentId) {
      await prisma.channelMessage.update({
        where: { id: parentId },
        data: {
          replyCount: { increment: 1 },
        },
      });
    }

    // Update channel's updatedAt
    await prisma.channel.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // Create notifications for mentioned users
    if (mentionedUserIds?.length > 0) {
      await prisma.notification.createMany({
        data: mentionedUserIds.map((mentionedUserId: string) => ({
          userId: mentionedUserId,
          organizationId: orgId,
          type: "SYSTEM_ALERT" as const,
          title: "You were mentioned",
          message: `${userName || "Someone"} mentioned you in #${channel.name}`,
          actionUrl: `/messages?channelId=${id}`,
        })),
      });
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
