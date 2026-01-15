import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { htmlToDocx } from "@/lib/document-converter";

interface DropboxTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

async function refreshDropboxToken(integration: {
  id: string;
  refreshToken: string | null;
}): Promise<string | null> {
  if (!integration.refreshToken) {
    return null;
  }

  try {
    const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: integration.refreshToken,
        client_id: process.env.DROPBOX_CLIENT_ID!,
        client_secret: process.env.DROPBOX_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) {
      console.error("Failed to refresh Dropbox token:", await response.text());
      return null;
    }

    const data: DropboxTokenResponse = await response.json();

    // Update the stored tokens
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        accessToken: data.access_token,
        tokenExpiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : null,
        ...(data.refresh_token && { refreshToken: data.refresh_token }),
      },
    });

    return data.access_token;
  } catch (error) {
    console.error("Error refreshing Dropbox token:", error);
    return null;
  }
}

async function getValidAccessToken(integration: {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
}): Promise<string | null> {
  // Check if token is expired or about to expire (5 min buffer)
  const isExpired =
    integration.tokenExpiresAt &&
    new Date(integration.tokenExpiresAt).getTime() < Date.now() + 5 * 60 * 1000;

  if (isExpired) {
    return refreshDropboxToken(integration);
  }

  return integration.accessToken;
}

// Upload document to Dropbox
export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json(
        { error: "Organization required" },
        { status: 400 }
      );
    }

    const { documentId, folderPath = "/Largence" } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID required" },
        { status: 400 }
      );
    }

    // Get Dropbox integration
    const integration = await prisma.integration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider: "DROPBOX",
        },
      },
    });

    if (!integration || integration.status !== "CONNECTED") {
      return NextResponse.json(
        { error: "Dropbox not connected" },
        { status: 400 }
      );
    }

    const accessToken = await getValidAccessToken(integration);
    if (!accessToken) {
      // Mark integration as needing reconnection
      await prisma.integration.update({
        where: { id: integration.id },
        data: { status: "ERROR" },
      });
      return NextResponse.json(
        { error: "Dropbox authorization expired. Please reconnect." },
        { status: 401 }
      );
    }

    // Get the document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        OR: [
          { organizationId: orgId },
          { userId: userId },
        ],
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Generate proper DOCX file for cloud storage
    const fileName = `${document.title.replace(/[/\\?%*:|"<>]/g, "-")}.docx`;
    const filePath = `${folderPath}/${fileName}`;
    
    let fileBuffer: Buffer;
    try {
      fileBuffer = await htmlToDocx(
        document.content || "",
        {
          title: document.title,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        }
      );
    } catch (error) {
      console.error("Error generating DOCX:", error);
      // Fallback to plain text if DOCX generation fails
      fileBuffer = Buffer.from(document.content || "", "utf-8");
    }

    // Upload to Dropbox using files/upload endpoint
    const uploadResponse = await fetch(
      "https://content.dropboxapi.com/2/files/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/octet-stream",
          "Dropbox-API-Arg": JSON.stringify({
            path: filePath,
            mode: "overwrite",
            autorename: true,
            mute: false,
          }),
        },
        body: new Uint8Array(fileBuffer),
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.error("Dropbox upload error:", errorData);
      return NextResponse.json(
        { error: "Failed to upload to Dropbox" },
        { status: 500 }
      );
    }

    const uploadResult = await uploadResponse.json();

    // Update integration sync stats
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        lastSyncAt: new Date(),
        syncedItemsCount: { increment: 1 },
      },
    });

    // Create audit log
    await createAuditLog({
      action: "DOCUMENT_EXPORTED",
      actionLabel: "Exported document to Dropbox",
      entityType: "Document",
      entityId: document.id,
      entityName: document.title,
      userId,
      organizationId: orgId,
      metadata: {
        destination: "Dropbox",
        filePath: uploadResult.path_display,
        fileName,
      },
    });

    return NextResponse.json({
      success: true,
      file: {
        id: uploadResult.id,
        name: uploadResult.name,
        path: uploadResult.path_display,
        size: uploadResult.size,
      },
    });
  } catch (error) {
    console.error("Dropbox sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync with Dropbox" },
      { status: 500 }
    );
  }
}

// List files in Dropbox folder
export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json(
        { error: "Organization required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folderPath = searchParams.get("path") || "/Largence";

    // Get Dropbox integration
    const integration = await prisma.integration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider: "DROPBOX",
        },
      },
    });

    if (!integration || integration.status !== "CONNECTED") {
      return NextResponse.json(
        { error: "Dropbox not connected" },
        { status: 400 }
      );
    }

    const accessToken = await getValidAccessToken(integration);
    if (!accessToken) {
      await prisma.integration.update({
        where: { id: integration.id },
        data: { status: "ERROR" },
      });
      return NextResponse.json(
        { error: "Dropbox authorization expired. Please reconnect." },
        { status: 401 }
      );
    }

    // List folder contents
    const listResponse = await fetch(
      "https://api.dropboxapi.com/2/files/list_folder",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: folderPath === "/" ? "" : folderPath,
          recursive: false,
          include_deleted: false,
        }),
      }
    );

    if (!listResponse.ok) {
      const errorData = await listResponse.json();
      // Folder might not exist yet
      if (errorData?.error?.[".tag"] === "path") {
        return NextResponse.json({ files: [], folderPath });
      }
      console.error("Dropbox list error:", errorData);
      return NextResponse.json(
        { error: "Failed to list Dropbox files" },
        { status: 500 }
      );
    }

    const listResult = await listResponse.json();

    return NextResponse.json({
      files: listResult.entries.map((entry: {
        ".tag": string;
        id: string;
        name: string;
        path_display: string;
        size?: number;
        client_modified?: string;
      }) => ({
        type: entry[".tag"],
        id: entry.id,
        name: entry.name,
        path: entry.path_display,
        size: entry.size,
        modified: entry.client_modified,
      })),
      hasMore: listResult.has_more,
      cursor: listResult.cursor,
      folderPath,
    });
  } catch (error) {
    console.error("Dropbox list error:", error);
    return NextResponse.json(
      { error: "Failed to list Dropbox files" },
      { status: 500 }
    );
  }
}
