import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { IntegrationProvider } from "@prisma/client";
import { docxToHtml, textToHtml } from "@/lib/document-converter";

interface ImportedFile {
  id: string;
  name: string;
  content: string;
  provider: string;
  path?: string;
}

// Helper to get valid access token for Dropbox
async function getDropboxAccessToken(integration: {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
}): Promise<string | null> {
  const isExpired =
    integration.tokenExpiresAt &&
    new Date(integration.tokenExpiresAt).getTime() < Date.now() + 5 * 60 * 1000;

  if (isExpired && integration.refreshToken) {
    const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: integration.refreshToken,
        client_id: process.env.DROPBOX_CLIENT_ID!,
        client_secret: process.env.DROPBOX_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        accessToken: data.access_token,
        tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
        ...(data.refresh_token && { refreshToken: data.refresh_token }),
      },
    });

    return data.access_token;
  }

  return integration.accessToken;
}

// Helper to get valid access token for Google Drive
async function getGoogleDriveAccessToken(integration: {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
}): Promise<string | null> {
  const isExpired =
    integration.tokenExpiresAt &&
    new Date(integration.tokenExpiresAt).getTime() < Date.now() + 5 * 60 * 1000;

  if (isExpired && integration.refreshToken) {
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

    if (!response.ok) return null;

    const data = await response.json();
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        accessToken: data.access_token,
        tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
      },
    });

    return data.access_token;
  }

  return integration.accessToken;
}

// Import file from Dropbox with proper format handling
async function importFromDropbox(
  accessToken: string,
  filePath: string
): Promise<{ name: string; content: string }> {
  const response = await fetch(
    "https://content.dropboxapi.com/2/files/download",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Dropbox-API-Arg": JSON.stringify({ path: filePath }),
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Dropbox download error:", error);
    throw new Error("Failed to download file from Dropbox");
  }

  // Get filename from response headers
  const apiResult = response.headers.get("dropbox-api-result");
  let name = "Imported Document";
  if (apiResult) {
    try {
      const result = JSON.parse(apiResult);
      name = result.name || name;
    } catch {}
  }

  // Determine file type and convert appropriately
  const ext = name.split(".").pop()?.toLowerCase() || "";
  let content: string;

  if (ext === "docx") {
    // Handle DOCX files with mammoth
    const buffer = Buffer.from(await response.arrayBuffer());
    const result = await docxToHtml(buffer);
    content = result.content;
  } else if (ext === "doc") {
    // For .doc files, try to get text content
    const buffer = Buffer.from(await response.arrayBuffer());
    try {
      const result = await docxToHtml(buffer);
      content = result.content;
    } catch {
      // If mammoth fails on old .doc, fallback to raw text
      content = `<p>This .doc file format is not fully supported. Please save as .docx and try again.</p>`;
    }
  } else if (ext === "md" || ext === "txt") {
    // Convert plain text/markdown to HTML
    const text = await response.text();
    content = textToHtml(text);
  } else if (ext === "html" || ext === "htm") {
    // HTML files can be used directly
    content = await response.text();
  } else {
    // Default to plain text
    const text = await response.text();
    content = textToHtml(text);
  }

  return { name, content };
}

// Import file from Google Drive
async function importFromGoogleDrive(
  accessToken: string,
  fileId: string
): Promise<{ name: string; content: string; mimeType: string }> {
  // First get file metadata
  const metadataResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!metadataResponse.ok) {
    throw new Error("Failed to get file metadata from Google Drive");
  }

  const metadata = await metadataResponse.json();
  const { name, mimeType } = metadata;

  let content: string;

  // Handle Google Docs native format
  if (mimeType === "application/vnd.google-apps.document") {
    // Export as HTML
    const exportResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/html`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!exportResponse.ok) {
      throw new Error("Failed to export Google Doc");
    }

    content = await exportResponse.text();
  } else if (
    mimeType === "text/plain" ||
    mimeType === "text/markdown" ||
    mimeType === "text/html" ||
    mimeType.startsWith("text/")
  ) {
    // Download text files directly
    const downloadResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!downloadResponse.ok) {
      throw new Error("Failed to download file from Google Drive");
    }

    content = await downloadResponse.text();
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    // For Word docs, export as HTML via Google
    const exportResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/html`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (exportResponse.ok) {
      content = await exportResponse.text();
    } else {
      // Fallback: download and note that it needs processing
      content = `<p>Imported Word document: ${name}</p><p>This document requires processing. Please paste the content manually.</p>`;
    }
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  return { name, content, mimeType };
}

// Import page from Notion
async function importFromNotion(
  accessToken: string,
  pageId: string
): Promise<{ name: string; content: string }> {
  // Get page metadata
  const pageResponse = await fetch(
    `https://api.notion.com/v1/pages/${pageId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Notion-Version": "2022-06-28",
      },
    }
  );

  if (!pageResponse.ok) {
    throw new Error("Failed to get Notion page");
  }

  const page = await pageResponse.json();

  // Extract title
  let name = "Untitled";
  const titleProp = page.properties?.title || page.properties?.Name;
  if (titleProp?.title?.[0]?.plain_text) {
    name = titleProp.title[0].plain_text;
  }

  // Get page content (blocks)
  const blocksResponse = await fetch(
    `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Notion-Version": "2022-06-28",
      },
    }
  );

  if (!blocksResponse.ok) {
    throw new Error("Failed to get Notion page content");
  }

  const blocksData = await blocksResponse.json();

  // Convert Notion blocks to HTML
  const content = convertNotionBlocksToHtml(blocksData.results);

  return { name, content };
}

// Convert Notion blocks to HTML
function convertNotionBlocksToHtml(blocks: any[]): string {
  const htmlParts: string[] = [];

  for (const block of blocks) {
    const type = block.type;
    const data = block[type];

    if (!data) continue;

    switch (type) {
      case "paragraph":
        const paraText = extractRichText(data.rich_text);
        if (paraText) {
          htmlParts.push(`<p>${paraText}</p>`);
        }
        break;

      case "heading_1":
        htmlParts.push(`<h1>${extractRichText(data.rich_text)}</h1>`);
        break;

      case "heading_2":
        htmlParts.push(`<h2>${extractRichText(data.rich_text)}</h2>`);
        break;

      case "heading_3":
        htmlParts.push(`<h3>${extractRichText(data.rich_text)}</h3>`);
        break;

      case "bulleted_list_item":
        htmlParts.push(`<li>${extractRichText(data.rich_text)}</li>`);
        break;

      case "numbered_list_item":
        htmlParts.push(`<li>${extractRichText(data.rich_text)}</li>`);
        break;

      case "code":
        htmlParts.push(`<pre><code>${extractRichText(data.rich_text)}</code></pre>`);
        break;

      case "quote":
        htmlParts.push(`<blockquote>${extractRichText(data.rich_text)}</blockquote>`);
        break;

      case "divider":
        htmlParts.push("<hr>");
        break;

      case "to_do":
        const checked = data.checked ? "☑" : "☐";
        htmlParts.push(`<p>${checked} ${extractRichText(data.rich_text)}</p>`);
        break;

      case "callout":
        const emoji = data.icon?.emoji || "💡";
        htmlParts.push(`<aside>${emoji} ${extractRichText(data.rich_text)}</aside>`);
        break;

      default:
        // For unsupported block types, try to extract any text
        if (data.rich_text) {
          const text = extractRichText(data.rich_text);
          if (text) {
            htmlParts.push(`<p>${text}</p>`);
          }
        }
    }
  }

  // Wrap consecutive list items
  let result = htmlParts.join("\n");
  result = result.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });

  return result || "<p></p>";
}

// Extract rich text from Notion format
function extractRichText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return "";

  return richText
    .map((part) => {
      let text = part.plain_text || "";

      // Escape HTML
      text = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Apply formatting
      if (part.annotations) {
        if (part.annotations.bold) text = `<strong>${text}</strong>`;
        if (part.annotations.italic) text = `<em>${text}</em>`;
        if (part.annotations.strikethrough) text = `<s>${text}</s>`;
        if (part.annotations.underline) text = `<u>${text}</u>`;
        if (part.annotations.code) text = `<code>${text}</code>`;
      }

      // Handle links
      if (part.href) {
        text = `<a href="${part.href}">${text}</a>`;
      }

      return text;
    })
    .join("");
}

// List files from integration for browsing
export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const providerParam = searchParams.get("provider")?.toUpperCase();
    const path = searchParams.get("path") || "";

    if (!providerParam || !["DROPBOX", "GOOGLE_DRIVE", "NOTION"].includes(providerParam)) {
      return NextResponse.json(
        { error: "Invalid provider. Supported: DROPBOX, GOOGLE_DRIVE, NOTION" },
        { status: 400 }
      );
    }

    const provider = providerParam as IntegrationProvider;

    const integration = await prisma.integration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider,
        },
      },
    });

    if (!integration || integration.status !== "CONNECTED") {
      return NextResponse.json(
        { error: `${provider} not connected` },
        { status: 400 }
      );
    }

    if (provider === "DROPBOX") {
      const accessToken = await getDropboxAccessToken(integration);
      if (!accessToken) {
        return NextResponse.json(
          { error: "Dropbox authorization expired" },
          { status: 401 }
        );
      }

      const listResponse = await fetch(
        "https://api.dropboxapi.com/2/files/list_folder",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: path || "",
            recursive: false,
            include_deleted: false,
          }),
        }
      );

      if (!listResponse.ok) {
        const errorData = await listResponse.json();
        if (errorData?.error?.[".tag"] === "path") {
          return NextResponse.json({ files: [], path });
        }
        throw new Error("Failed to list files");
      }

      const listResult = await listResponse.json();

      return NextResponse.json({
        files: listResult.entries
          .filter((entry: any) => {
            // Only show folders and supported file types
            if (entry[".tag"] === "folder") return true;
            const ext = entry.name.split(".").pop()?.toLowerCase();
            return ["md", "txt", "html", "doc", "docx", "rtf"].includes(ext || "");
          })
          .map((entry: any) => ({
            type: entry[".tag"],
            id: entry.id,
            name: entry.name,
            path: entry.path_display,
            size: entry.size,
            modified: entry.client_modified,
          })),
        hasMore: listResult.has_more,
        path,
      });
    }

    if (provider === "GOOGLE_DRIVE") {
      const accessToken = await getGoogleDriveAccessToken(integration);
      if (!accessToken) {
        return NextResponse.json(
          { error: "Google Drive authorization expired" },
          { status: 401 }
        );
      }

      // Build query for Google Drive
      let query = "trashed=false";
      if (path) {
        query += ` and '${path}' in parents`;
      } else {
        query += " and 'root' in parents";
      }

      // Filter to supported types
      const mimeTypes = [
        "application/vnd.google-apps.folder",
        "application/vnd.google-apps.document",
        "text/plain",
        "text/markdown",
        "text/html",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ];

      const listResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,modifiedTime)&orderBy=folder,name`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!listResponse.ok) {
        throw new Error("Failed to list files from Google Drive");
      }

      const listResult = await listResponse.json();

      return NextResponse.json({
        files: listResult.files
          .filter((file: any) => mimeTypes.includes(file.mimeType))
          .map((file: any) => ({
            type: file.mimeType === "application/vnd.google-apps.folder" ? "folder" : "file",
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            size: file.size,
            modified: file.modifiedTime,
          })),
        path,
      });
    }

    if (provider === "NOTION") {
      const accessToken = integration.accessToken;
      if (!accessToken) {
        return NextResponse.json(
          { error: "Notion authorization expired" },
          { status: 401 }
        );
      }

      // Search for pages in Notion
      const searchResponse = await fetch("https://api.notion.com/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          filter: { property: "object", value: "page" },
          page_size: 50,
        }),
      });

      if (!searchResponse.ok) {
        throw new Error("Failed to search Notion pages");
      }

      const searchResult = await searchResponse.json();

      return NextResponse.json({
        files: searchResult.results.map((page: any) => {
          // Extract title from Notion page
          let title = "Untitled";
          const titleProp = page.properties?.title || page.properties?.Name;
          if (titleProp?.title?.[0]?.plain_text) {
            title = titleProp.title[0].plain_text;
          }

          return {
            type: "file",
            id: page.id,
            name: title,
            url: page.url,
            modified: page.last_edited_time,
          };
        }),
        path: "",
      });
    }

    return NextResponse.json({ files: [] });
  } catch (error) {
    console.error("Import list error:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}

// Import file and create document
export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { provider, fileId, filePath, documentType = "OTHER", createDocument = true } = body;

    if (!provider || (!fileId && !filePath)) {
      return NextResponse.json(
        { error: "Provider and file ID or path required" },
        { status: 400 }
      );
    }

    const normalizedProvider = provider.toUpperCase() as IntegrationProvider;

    const integration = await prisma.integration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider: normalizedProvider,
        },
      },
    });

    if (!integration || integration.status !== "CONNECTED") {
      return NextResponse.json(
        { error: `${normalizedProvider} not connected` },
        { status: 400 }
      );
    }

    let importedFile: { name: string; content: string };

    if (normalizedProvider === "DROPBOX") {
      const accessToken = await getDropboxAccessToken(integration);
      if (!accessToken) {
        return NextResponse.json(
          { error: "Dropbox authorization expired" },
          { status: 401 }
        );
      }

      importedFile = await importFromDropbox(accessToken, filePath || fileId);
    } else if (normalizedProvider === "GOOGLE_DRIVE") {
      const accessToken = await getGoogleDriveAccessToken(integration);
      if (!accessToken) {
        return NextResponse.json(
          { error: "Google Drive authorization expired" },
          { status: 401 }
        );
      }

      importedFile = await importFromGoogleDrive(accessToken, fileId);
    } else if (normalizedProvider === "NOTION") {
      const accessToken = integration.accessToken;
      if (!accessToken) {
        return NextResponse.json(
          { error: "Notion authorization expired" },
          { status: 401 }
        );
      }

      importedFile = await importFromNotion(accessToken, fileId);
    } else {
      return NextResponse.json(
        { error: "Unsupported provider" },
        { status: 400 }
      );
    }

    // Clean the filename for document title
    const title = importedFile.name.replace(/\.(md|txt|html|doc|docx|rtf)$/i, "");

    // If just returning content (for compliance check), don't create document
    if (!createDocument) {
      return NextResponse.json({
        success: true,
        title,
        content: importedFile.content,
        provider: normalizedProvider,
      });
    }

    // Create new document
    const document = await prisma.document.create({
      data: {
        title,
        content: importedFile.content,
        documentType,
        status: "DRAFT",
        userId,
        organizationId: orgId,
        visibility: "PRIVATE",
      },
    });

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
      action: "DOCUMENT_CREATED",
      actionLabel: `Imported document from ${normalizedProvider}`,
      entityType: "Document",
      entityId: document.id,
      entityName: title,
      userId,
      organizationId: orgId,
      metadata: {
        source: normalizedProvider,
        originalFileName: importedFile.name,
      },
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        status: document.status,
      },
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import file" },
      { status: 500 }
    );
  }
}
