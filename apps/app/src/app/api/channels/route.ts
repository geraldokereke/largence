import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET /api/channels - List all channels for the organization
export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const documentId = searchParams.get("documentId");
    const matterId = searchParams.get("matterId");

    const channels = await prisma.channel.findMany({
      where: {
        organizationId: orgId,
        isArchived: false,
        ...(type && { type: type as any }),
        ...(documentId && { documentId }),
        ...(matterId && { matterId }),
        OR: [
          { type: "PUBLIC" },
          {
            members: {
              some: { userId },
            },
          },
        ],
      },
      include: {
        members: {
          where: { userId },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Calculate unread count for each channel
    const channelsWithUnread = channels.map((channel: typeof channels[number]) => {
      const membership = channel.members[0];
      const lastMessage = channel.messages[0];
      const unreadCount =
        membership?.lastReadAt && lastMessage
          ? lastMessage.createdAt > membership.lastReadAt
            ? 1
            : 0
          : channel.messages.length > 0
            ? 1
            : 0;

      return {
        ...channel,
        unreadCount,
        isMember: channel.members.length > 0,
        lastMessage: lastMessage || null,
      };
    });

    return NextResponse.json({ channels: channelsWithUnread });
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    );
  }
}

// POST /api/channels - Create a new channel
export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, type, documentId, matterId, memberUserIds } =
      body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Channel name is required" },
        { status: 400 }
      );
    }

    // Create channel with creator as owner
    const channel = await prisma.channel.create({
      data: {
        organizationId: orgId,
        name: name.trim(),
        description: description?.trim(),
        type: type || "PUBLIC",
        documentId,
        matterId,
        createdByUserId: userId,
        members: {
          create: [
            { userId, role: "OWNER" },
            ...(memberUserIds || [])
              .filter((id: string) => id !== userId)
              .map((id: string) => ({ userId: id, role: "MEMBER" as const })),
          ],
        },
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

    // Create system message
    await prisma.channelMessage.create({
      data: {
        channelId: channel.id,
        userId,
        userName: "System",
        content: `Channel "${name}" was created`,
        type: "SYSTEM",
      },
    });

    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    console.error("Error creating channel:", error);
    return NextResponse.json(
      { error: "Failed to create channel" },
      { status: 500 }
    );
  }
}
