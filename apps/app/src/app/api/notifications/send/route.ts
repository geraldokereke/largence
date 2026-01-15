import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  notifyDocumentShared,
  notifyComplianceCompleted,
  notifyDocumentUpdated,
  notifySystemAlert,
} from "@/lib/notifications";

// API endpoint for triggering notifications programmatically
export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;

    const organizationId = orgId || "";

    switch (type) {
      case "DOCUMENT_SHARED": {
        const { 
          recipientUserId, 
          documentId, 
          documentTitle, 
          sharedByUserId,
          sharedByName,
          permission = "VIEW"
        } = data;
        
        if (!recipientUserId) {
          return NextResponse.json(
            { error: "recipientUserId is required for DOCUMENT_SHARED" },
            { status: 400 }
          );
        }
        
        await notifyDocumentShared({
          recipientUserId,
          documentId,
          documentTitle,
          sharedByUserId: sharedByUserId || userId,
          sharedByName,
          permission,
          organizationId,
        });
        break;
      }

      case "COMPLIANCE_COMPLETED": {
        const { targetUserId, documentId, documentTitle, score, issuesCount = 0 } = data;
        await notifyComplianceCompleted({
          userId: targetUserId || userId,
          documentId,
          documentTitle,
          score,
          issuesCount,
          organizationId,
        });
        break;
      }

      case "DOCUMENT_UPDATED": {
        const { recipientUserIds, documentId, documentTitle, updatedByName } = data;
        
        if (!recipientUserIds || !Array.isArray(recipientUserIds) || recipientUserIds.length === 0) {
          return NextResponse.json(
            { error: "recipientUserIds array is required for DOCUMENT_UPDATED" },
            { status: 400 }
          );
        }
        
        await notifyDocumentUpdated({
          recipientUserIds,
          documentId,
          documentTitle,
          updatedByName,
          organizationId,
        });
        break;
      }

      case "SYSTEM_ALERT": {
        const { userIds, title, message, actionUrl } = data;
        
        // Support both single user and multiple users
        const targetUserIds = userIds || [userId];
        
        await notifySystemAlert({
          userIds: Array.isArray(targetUserIds) ? targetUserIds : [targetUserIds],
          title,
          message,
          actionUrl,
          organizationId,
        });
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown notification type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
