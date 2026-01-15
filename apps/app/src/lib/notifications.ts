import prisma from "@/lib/prisma";
import { sendTemplatedEmail } from "@/lib/email";
import { clerkClient } from "@clerk/nextjs/server";
import { NotificationType } from "@prisma/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.largence.com";

export interface NotificationPayload {
  userId: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  message: string;
  documentId?: string;
  complianceId?: string;
  actionUrl?: string;
}

export interface NotificationOptions {
  sendEmail?: boolean;
  emailOverride?: {
    to?: string;
    subject?: string;
  };
}

// Create an in-app notification
export async function createNotification(
  payload: NotificationPayload,
  options: NotificationOptions = {}
) {
  try {
    // Create in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId: payload.userId,
        organizationId: payload.organizationId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        documentId: payload.documentId,
        complianceId: payload.complianceId,
        actionUrl: payload.actionUrl,
      },
    });

    // Optionally send email notification
    if (options.sendEmail) {
      try {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(payload.userId);
        const email = options.emailOverride?.to || user.emailAddresses[0]?.emailAddress;

        if (email) {
          // Send a generic notification email based on type
          await sendNotificationEmail(payload, email);
        }
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
        // Don't throw - notification was still created
      }
    }

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    throw error;
  }
}

// Send notification email based on type
async function sendNotificationEmail(payload: NotificationPayload, email: string) {
  switch (payload.type) {
    case "DOCUMENT_SHARED":
      // Extract metadata from message or use defaults
      await sendTemplatedEmail("documentShared", email, {
        sharedBy: "A team member",
        documentTitle: payload.title,
        documentUrl: payload.actionUrl || `${APP_URL}/documents`,
        permission: "view",
      });
      break;

    case "COMPLIANCE_COMPLETED":
      await sendTemplatedEmail("complianceComplete", email, {
        documentTitle: payload.title,
        score: 100, // Would need to pass this in metadata
        issuesCount: 0,
        documentUrl: payload.actionUrl || `${APP_URL}/documents`,
      });
      break;

    case "DOCUMENT_UPDATED":
      await sendTemplatedEmail("documentStatusChange", email, {
        documentTitle: payload.title,
        oldStatus: "draft",
        newStatus: "updated",
        changedBy: "A team member",
        documentUrl: payload.actionUrl || `${APP_URL}/documents`,
      });
      break;

    default:
      // Generic notification - send a simple email
      // Could create a generic template if needed
      break;
  }
}

// Bulk create notifications (e.g., for team broadcasts)
export async function createBulkNotifications(
  notifications: NotificationPayload[],
  options: NotificationOptions = {}
) {
  const results = await Promise.allSettled(
    notifications.map((payload) => createNotification(payload, options))
  );

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return { successful, failed, total: notifications.length };
}

// Get notifications for a user
export async function getUserNotifications(
  userId: string,
  organizationId: string,
  options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  } = {}
) {
  const { limit = 20, offset = 0, unreadOnly = false } = options;

  const where = {
    userId,
    organizationId,
    ...(unreadOnly && { read: false }),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { userId, organizationId, read: false },
    }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    hasMore: offset + notifications.length < total,
  };
}

// Mark notifications as read
export async function markNotificationsRead(
  notificationIds: string[],
  userId: string
) {
  return prisma.notification.updateMany({
    where: {
      id: { in: notificationIds },
      userId, // Ensure user owns these notifications
    },
    data: { read: true },
  });
}

// Mark all notifications as read
export async function markAllNotificationsRead(
  userId: string,
  organizationId: string
) {
  return prisma.notification.updateMany({
    where: {
      userId,
      organizationId,
      read: false,
    },
    data: { read: true },
  });
}

// Delete old notifications (for cleanup)
export async function deleteOldNotifications(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return prisma.notification.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
      read: true,
    },
  });
}

// ===============================
// Event-specific notification helpers
// ===============================

export async function notifyDocumentShared(params: {
  documentId: string;
  documentTitle: string;
  sharedByUserId?: string;
  sharedByName: string;
  recipientUserId?: string;
  recipientEmail?: string;
  organizationId: string;
  permission?: string;
  shareUrl?: string;
}) {
  const permission = params.permission || "VIEW";
  
  // If we have a recipientUserId, create an in-app notification
  if (params.recipientUserId) {
    await createNotification(
      {
        userId: params.recipientUserId,
        organizationId: params.organizationId,
        type: "DOCUMENT_SHARED",
        title: "Document Shared",
        message: `${params.sharedByName} shared "${params.documentTitle}" with you (${permission} access)`,
        documentId: params.documentId,
        actionUrl: `${APP_URL}/documents/${params.documentId}`,
      },
      { sendEmail: false } // Will send email separately if we have email
    );
  }
  
  // If we have a recipientEmail, send an email notification
  if (params.recipientEmail) {
    try {
      await sendTemplatedEmail("documentShared", params.recipientEmail, {
        documentTitle: params.documentTitle,
        sharedBy: params.sharedByName,
        permission,
        documentUrl: params.shareUrl || `${APP_URL}/documents/${params.documentId}`,
      });
    } catch (error) {
      console.error("Failed to send document shared email:", error);
    }
  }
}

export async function notifyComplianceCompleted(params: {
  documentId: string;
  documentTitle: string;
  userId: string;
  organizationId: string;
  score: number;
  issuesCount: number;
}) {
  const type = params.score >= 80 ? "COMPLIANCE_COMPLETED" : "COMPLIANCE_FAILED";
  
  return createNotification(
    {
      userId: params.userId,
      organizationId: params.organizationId,
      type,
      title: params.documentTitle,
      message: `Compliance check completed with ${params.score}% score${params.issuesCount > 0 ? ` (${params.issuesCount} issues found)` : ""}`,
      documentId: params.documentId,
      actionUrl: `${APP_URL}/documents/${params.documentId}`,
    },
    { sendEmail: params.score < 80 } // Only email if score is low
  );
}

export async function notifyDocumentUpdated(params: {
  documentId: string;
  documentTitle: string;
  updatedByName: string;
  recipientUserIds: string[];
  organizationId: string;
}) {
  const notifications = params.recipientUserIds.map((userId) => ({
    userId,
    organizationId: params.organizationId,
    type: "DOCUMENT_UPDATED" as NotificationType,
    title: params.documentTitle,
    message: `${params.updatedByName} updated "${params.documentTitle}"`,
    documentId: params.documentId,
    actionUrl: `${APP_URL}/documents/${params.documentId}`,
  }));

  return createBulkNotifications(notifications);
}

export async function notifySystemAlert(params: {
  userIds: string[];
  organizationId: string;
  title: string;
  message: string;
  actionUrl?: string;
}) {
  const notifications = params.userIds.map((userId) => ({
    userId,
    organizationId: params.organizationId,
    type: "SYSTEM_ALERT" as NotificationType,
    title: params.title,
    message: params.message,
    actionUrl: params.actionUrl,
  }));

  return createBulkNotifications(notifications, { sendEmail: true });
}
