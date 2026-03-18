import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { htmlToDocx } from "@/lib/document-converter";

interface MicrosoftTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

async function refreshMicrosoftToken(integration: {
  id: string;
  refreshToken: string | null;
}): Promise<string | null> {
  if (!integration.refreshToken) return null;

  try {
    const response = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: integration.refreshToken,
          client_id: process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to refresh Microsoft token:", await response.text());
      return null;
    }

    const data: MicrosoftTokenResponse = await response.json();

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
    console.error("Error refreshing Microsoft token:", error);
    return null;
  }
}

async function getValidAccessToken(integration: {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
}): Promise<string | null> {
  const isExpired =
    integration.tokenExpiresAt &&
    new Date(integration.tokenExpiresAt).getTime() < Date.now() + 5 * 60 * 1000;

  if (isExpired) {
    return refreshMicrosoftToken(integration);
  }

  return integration.accessToken;
}

// Upload document to OneDrive
export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!orgId) {
      return NextResponse.json({ error: "Organization required" }, { status: 400 });
    }

    const { documentId, folderPath = "/Largence" } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    const integration = await prisma.integration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider: "MICROSOFT_365",
        },
      },
    });

    if (!integration || integration.status !== "CONNECTED") {
      return NextResponse.json({ error: "Microsoft not connected" }, { status: 400 });
    }

    const accessToken = await getValidAccessToken(integration);
    if (!accessToken) {
      await prisma.integration.update({
        where: { id: integration.id },
        data: { status: "ERROR" },
      });
      return NextResponse.json(
        { error: "Microsoft authorization expired. Please reconnect." },
        { status: 401 }
      );
    }

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        OR: [{ organizationId: orgId }, { userId }],
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const fileName = `${document.title.replace(/[/\\?%*:|"<>]/g, "-")}.docx`;
    const uploadPath = `${folderPath}/${fileName}`;

    let fileBuffer: Buffer;
    try {
      fileBuffer = await htmlToDocx(document.content || "", {
        title: document.title,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      });
    } catch (error) {
      console.error("Error generating DOCX:", error);
      fileBuffer = Buffer.from(document.content || "", "utf-8");
    }

    // Use upload session for reliability (handles files of any size)
    const sessionResponse = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/root:${uploadPath}:/createUploadSession`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item: {
            "@microsoft.graph.conflictBehavior": "replace",
            name: fileName,
          },
        }),
      }
    );

    if (!sessionResponse.ok) {
      const errorData = await sessionResponse.json();
      console.error("OneDrive create session error:", errorData);
      return NextResponse.json(
        { error: "Failed to create OneDrive upload session" },
        { status: 500 }
      );
    }

    const { uploadUrl } = await sessionResponse.json();

    // Upload the file bytes
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Length": String(fileBuffer.byteLength),
        "Content-Range": `bytes 0-${fileBuffer.byteLength - 1}/${fileBuffer.byteLength}`,
      },
      body: new Uint8Array(fileBuffer),
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.error("OneDrive upload error:", errorData);
      return NextResponse.json(
        { error: "Failed to upload to OneDrive" },
        { status: 500 }
      );
    }

    const uploadResult = await uploadResponse.json();

    // Get the Word Online edit URL
    const webUrl: string = uploadResult.webUrl || null;
    const wordEditUrl = webUrl
      ? webUrl.replace("/_layouts/15/WopiFrame.aspx", "/_layouts/15/Doc.aspx") + "&action=edit"
      : null;

    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        lastSyncAt: new Date(),
        syncedItemsCount: { increment: 1 },
      },
    });

    await createAuditLog({
      action: "DOCUMENT_EXPORTED",
      actionLabel: "Exported document to OneDrive",
      entityType: "Document",
      entityId: document.id,
      entityName: document.title,
      userId,
      organizationId: orgId,
      metadata: {
        destination: "OneDrive",
        filePath: uploadPath,
        fileName,
        fileId: uploadResult.id,
      },
    });

    return NextResponse.json({
      success: true,
      file: {
        id: uploadResult.id,
        name: uploadResult.name,
        path: uploadPath,
        size: uploadResult.size,
        webUrl: uploadResult.webUrl,
        wordEditUrl,
      },
    });
  } catch (error) {
    console.error("Microsoft sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync with Microsoft" },
      { status: 500 }
    );
  }
}

// List files in OneDrive folder
export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!orgId) {
      return NextResponse.json({ error: "Organization required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const folderPath = searchParams.get("path") || "/Largence";

    const integration = await prisma.integration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider: "MICROSOFT_365",
        },
      },
    });

    if (!integration || integration.status !== "CONNECTED") {
      return NextResponse.json({ error: "Microsoft not connected" }, { status: 400 });
    }

    const accessToken = await getValidAccessToken(integration);
    if (!accessToken) {
      await prisma.integration.update({
        where: { id: integration.id },
        data: { status: "ERROR" },
      });
      return NextResponse.json(
        { error: "Microsoft authorization expired. Please reconnect." },
        { status: 401 }
      );
    }

    const listResponse = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/root:${folderPath}:/children`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!listResponse.ok) {
      // Folder may not exist yet — return empty list
      if (listResponse.status === 404) {
        return NextResponse.json({ files: [], folderPath });
      }
      const errorData = await listResponse.json();
      console.error("OneDrive list error:", errorData);
      return NextResponse.json(
        { error: "Failed to list OneDrive files" },
        { status: 500 }
      );
    }

    const listResult = await listResponse.json();

    return NextResponse.json({
      files: listResult.value.map((entry: {
        id: string;
        name: string;
        size: number;
        lastModifiedDateTime: string;
        webUrl: string;
        folder?: object;
        file?: object;
      }) => ({
        type: entry.folder ? "folder" : "file",
        id: entry.id,
        name: entry.name,
        path: `${folderPath}/${entry.name}`,
        size: entry.size,
        modified: entry.lastModifiedDateTime,
        webUrl: entry.webUrl,
      })),
      folderPath,
    });
  } catch (error) {
    console.error("OneDrive list error:", error);
    return NextResponse.json(
      { error: "Failed to list OneDrive files" },
      { status: 500 }
    );
  }
}
