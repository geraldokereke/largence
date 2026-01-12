import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@largence/lib/prisma";
import { createAuditLog, getUserInitials } from "@/lib/audit";

// Refresh access token if expired
async function refreshAccessToken(integration: {
  id: string;
  refreshToken: string | null;
}) {
  if (!integration.refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: integration.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const tokens = await response.json();
  
  // Update the integration with new token
  await prisma.integration.update({
    where: { id: integration.id },
    data: {
      accessToken: tokens.access_token,
      tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    },
  });

  return tokens.access_token;
}

// Get valid access token (refresh if needed)
async function getValidAccessToken(integration: {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
}) {
  if (!integration.accessToken) {
    throw new Error("No access token available");
  }

  // Check if token is expired (with 5 minute buffer)
  const isExpired = integration.tokenExpiresAt
    ? new Date(integration.tokenExpiresAt).getTime() < Date.now() - 5 * 60 * 1000
    : true;

  if (isExpired) {
    return refreshAccessToken(integration);
  }

  return integration.accessToken;
}

// Export document to Google Drive
export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, format = "pdf", folderId } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Get the integration
    const integration = await prisma.integration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider: "GOOGLE_DRIVE",
        },
      },
    });

    if (!integration || integration.status !== "CONNECTED") {
      return NextResponse.json(
        { error: "Google Drive is not connected" },
        { status: 400 }
      );
    }

    // Get the document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        organizationId: orgId,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Get valid access token
    const accessToken = await getValidAccessToken(integration);

    // Create file metadata
    const metadata: Record<string, any> = {
      name: `${document.title}.${format}`,
      mimeType: format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    // Add to specific folder if provided
    if (folderId) {
      metadata.parents = [folderId];
    }

    // Convert document content to the requested format
    let fileContent: string;
    let contentType: string;

    if (format === "pdf") {
      // For PDF, we'll use the document content as HTML and let Google convert it
      // In a real implementation, you'd use a PDF library
      fileContent = `<html><body>${document.content || document.title}</body></html>`;
      contentType = "text/html";
    } else {
      // For DOCX, send as plain text (Google will handle conversion)
      fileContent = document.content || document.title;
      contentType = "text/plain";
    }

    // Create multipart request body
    const boundary = "largence_boundary";
    const multipartBody = [
      `--${boundary}`,
      "Content-Type: application/json; charset=UTF-8",
      "",
      JSON.stringify(metadata),
      `--${boundary}`,
      `Content-Type: ${contentType}`,
      "",
      fileContent,
      `--${boundary}--`,
    ].join("\r\n");

    // Upload to Google Drive
    const uploadResponse = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: multipartBody,
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.error("Google Drive upload error:", errorData);
      throw new Error(errorData.error?.message || "Failed to upload to Google Drive");
    }

    const uploadedFile = await uploadResponse.json();

    // Update integration sync status
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        syncedItemsCount: { increment: 1 },
      },
    });

    // Log audit event
    const user = await currentUser();
    await createAuditLog({
      userId,
      organizationId: orgId,
      action: "DOCUMENT_EXPORTED",
      actionLabel: "Exported document to Google Drive",
      entityType: "Document",
      entityId: documentId,
      entityName: document.title,
      metadata: {
        provider: "GOOGLE_DRIVE",
        format,
        driveFileId: uploadedFile.id,
        driveFileName: uploadedFile.name,
      },
      userName: user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.username ||
          "User"
        : "User",
      userAvatar: getUserInitials(user?.firstName, user?.lastName),
    });

    return NextResponse.json({
      success: true,
      file: {
        id: uploadedFile.id,
        name: uploadedFile.name,
        webViewLink: uploadedFile.webViewLink,
      },
    });
  } catch (error: any) {
    console.error("Google Drive sync error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync with Google Drive" },
      { status: 500 }
    );
  }
}

// List Google Drive folders (for folder picker)
export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const parentId = searchParams.get("parentId") || "root";

    // Get the integration
    const integration = await prisma.integration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider: "GOOGLE_DRIVE",
        },
      },
    });

    if (!integration || integration.status !== "CONNECTED") {
      return NextResponse.json(
        { error: "Google Drive is not connected" },
        { status: 400 }
      );
    }

    // Get valid access token
    const accessToken = await getValidAccessToken(integration);

    // List folders
    const query = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,parents)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to list folders");
    }

    const data = await response.json();

    return NextResponse.json({
      folders: data.files || [],
      parentId,
    });
  } catch (error: any) {
    console.error("Google Drive folder list error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list folders" },
      { status: 500 }
    );
  }
}
