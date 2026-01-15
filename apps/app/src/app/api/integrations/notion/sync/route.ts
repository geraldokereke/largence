import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@largence/lib/prisma";
import { createAuditLog, getUserInitials } from "@/lib/audit";

// Export document to Notion as a page
export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, parentPageId, databaseId } = body;

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
          provider: "NOTION",
        },
      },
    });

    if (!integration || integration.status !== "CONNECTED") {
      return NextResponse.json(
        { error: "Notion is not connected" },
        { status: 400 }
      );
    }

    // Get the document - check both user ownership and organization
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
        { error: "Document not found or you don't have access" },
        { status: 404 }
      );
    }

    const accessToken = integration.accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token available" },
        { status: 400 }
      );
    }

    // Convert document content to Notion blocks
    const contentBlocks = convertToNotionBlocks(document.content || "");

    // Determine parent (page or database, or workspace for public integrations)
    let parent: Record<string, string | boolean>;
    if (databaseId) {
      parent = { database_id: databaseId };
    } else if (parentPageId) {
      parent = { page_id: parentPageId };
    } else {
      // For public integrations, we can create a private page at workspace level
      // by using workspace: true as the parent
      parent = { workspace: true };
    }

    // Create page in Notion
    const pagePayload: Record<string, any> = {
      parent,
      properties: databaseId
        ? {
            // Database properties
            Name: { title: [{ text: { content: document.title } }] },
            Status: { select: { name: document.status || "Draft" } },
            Type: { select: { name: document.documentType || "General" } },
          }
        : {
            // Page properties
            title: [{ text: { content: document.title } }],
          },
      children: contentBlocks,
    };

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify(pagePayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Notion API error:", errorData);
      throw new Error(errorData.message || "Failed to create page in Notion");
    }

    const notionPage = await response.json();

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
      actionLabel: "Exported document to Notion",
      entityType: "Document",
      entityId: documentId,
      entityName: document.title,
      metadata: {
        provider: "NOTION",
        notionPageId: notionPage.id,
        notionUrl: notionPage.url,
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
      page: {
        id: notionPage.id,
        url: notionPage.url,
      },
    });
  } catch (error: any) {
    console.error("Notion sync error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync with Notion" },
      { status: 500 }
    );
  }
}

// List Notion pages and databases for picker
export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "all"; // "pages", "databases", or "all"

    // Get the integration
    const integration = await prisma.integration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider: "NOTION",
        },
      },
    });

    if (!integration || integration.status !== "CONNECTED") {
      return NextResponse.json(
        { error: "Notion is not connected" },
        { status: 400 }
      );
    }

    const accessToken = integration.accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token available" },
        { status: 400 }
      );
    }

    // Search for pages and databases
    const searchPayload: Record<string, any> = {
      page_size: 50,
    };

    if (type === "pages") {
      searchPayload.filter = { property: "object", value: "page" };
    } else if (type === "databases") {
      searchPayload.filter = { property: "object", value: "database" };
    }

    const response = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify(searchPayload),
    });

    if (!response.ok) {
      throw new Error("Failed to search Notion");
    }

    const data = await response.json();

    // Format results
    const results = data.results.map((item: any) => ({
      id: item.id,
      object: item.object,
      title: getNotionTitle(item),
      url: item.url,
      icon: item.icon,
    }));

    return NextResponse.json({
      items: results,
    });
  } catch (error: any) {
    console.error("Notion search error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search Notion" },
      { status: 500 }
    );
  }
}

// Helper function to convert HTML/text content to Notion blocks
function convertToNotionBlocks(content: string): any[] {
  const blocks: any[] = [];

  // Simple conversion - split by paragraphs
  // In a real implementation, you'd parse HTML and convert properly
  const paragraphs = content
    .replace(/<[^>]*>/g, "\n") // Remove HTML tags
    .split(/\n\n+/) // Split by double newlines
    .filter((p) => p.trim());

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    // Check if it looks like a heading
    if (trimmed.length < 100 && !trimmed.includes(".")) {
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: trimmed } }],
        },
      });
    } else {
      // Regular paragraph
      // Notion has a 2000 character limit per text block
      const chunks = chunkText(trimmed, 2000);
      for (const chunk of chunks) {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: chunk } }],
          },
        });
      }
    }
  }

  // Add at least one block if empty
  if (blocks.length === 0) {
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: "Document content" } }],
      },
    });
  }

  return blocks;
}

// Helper to chunk text into smaller pieces
function chunkText(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLength) {
    // Try to break at a sentence or word boundary
    let breakPoint = remaining.lastIndexOf(". ", maxLength);
    if (breakPoint === -1 || breakPoint < maxLength / 2) {
      breakPoint = remaining.lastIndexOf(" ", maxLength);
    }
    if (breakPoint === -1 || breakPoint < maxLength / 2) {
      breakPoint = maxLength;
    }

    chunks.push(remaining.substring(0, breakPoint + 1).trim());
    remaining = remaining.substring(breakPoint + 1).trim();
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks;
}

// Helper to get title from Notion object
function getNotionTitle(item: any): string {
  if (item.object === "page") {
    const titleProp = item.properties?.title || item.properties?.Name;
    if (titleProp?.title?.[0]?.plain_text) {
      return titleProp.title[0].plain_text;
    }
  } else if (item.object === "database") {
    if (item.title?.[0]?.plain_text) {
      return item.title[0].plain_text;
    }
  }
  return "Untitled";
}
