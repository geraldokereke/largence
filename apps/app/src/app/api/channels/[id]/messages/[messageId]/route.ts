import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// PATCH /api/channels/[id]/messages/[messageId] - Edit message
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    const { id, messageId } = await params;

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, reactions } = body;

    // Verify message exists and user owns it (for content edit)
    const message = await prisma.channelMessage.findFirst({
      where: {
        id: messageId,
        channelId: id,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Handle reactions (anyone can add reactions)
    if (reactions !== undefined) {
      const updatedMessage = await prisma.channelMessage.update({
        where: { id: messageId },
        data: { reactions },
      });
      return NextResponse.json(updatedMessage);
    }

    // For content edit, must be message author
    if (content !== undefined) {
      if (message.userId !== userId) {
        return NextResponse.json(
          { error: "You can only edit your own messages" },
          { status: 403 }
        );
      }

      const updatedMessage = await prisma.channelMessage.update({
        where: { id: messageId },
        data: {
          content: content.trim(),
          isEdited: true,
          editedAt: new Date(),
        },
      });
      return NextResponse.json(updatedMessage);
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// DELETE /api/channels/[id]/messages/[messageId] - Delete message
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    const { id, messageId } = await params;

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify message exists
    const message = await prisma.channelMessage.findFirst({
      where: {
        id: messageId,
        channelId: id,
      },
      include: {
        channel: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user owns the message or is admin/owner
    const membership = message.channel.members[0];
    const isOwnerOrAdmin =
      membership?.role === "OWNER" || membership?.role === "ADMIN";
    const isMessageAuthor = message.userId === userId;

    if (!isMessageAuthor && !isOwnerOrAdmin) {
      return NextResponse.json(
        { error: "You can only delete your own messages" },
        { status: 403 }
      );
    }

    // Soft delete the message
    await prisma.channelMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        content: "[Message deleted]",
      },
    });

    // Update parent reply count if this was a reply
    if (message.parentId) {
      await prisma.channelMessage.update({
        where: { id: message.parentId },
        data: {
          replyCount: { decrement: 1 },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
