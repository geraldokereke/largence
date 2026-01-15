import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";
import {
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
} from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = orgId || "";
    
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const result = await getUserNotifications(userId, organizationId, {
      limit,
      offset,
      unreadOnly,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, notificationIds, read } = body;

    // Handle batch update
    if (notificationIds && Array.isArray(notificationIds)) {
      await markNotificationsRead(notificationIds, userId);
      return NextResponse.json({ success: true });
    }

    // Handle single update
    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID required" },
        { status: 400 },
      );
    }

    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: read !== undefined ? read : true,
      },
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = orgId || "";

    // Mark all as read using service
    await markAllNotificationsRead(userId, organizationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking all as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all as read" },
      { status: 500 },
    );
  }
}
