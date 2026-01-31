import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@largence/lib/prisma";
import { createAuditLog, getUserInitials } from "@/lib/audit";

// Notion OAuth configuration
const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID!;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET!;
const NOTION_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/notion/callback`
  : "https://app.largence.com/api/integrations/oauth/notion/callback";

// Initiate OAuth flow
export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if already connected
    const existing = await prisma.integration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider: "NOTION",
        },
      },
    });

    if (existing && existing.status === "CONNECTED") {
      return NextResponse.json(
        { error: "Notion is already connected" },
        { status: 400 }
      );
    }

    // Build OAuth URL
    const state = Buffer.from(JSON.stringify({ userId, orgId })).toString("base64");
    
    const authUrl = new URL("https://api.notion.com/v1/oauth/authorize");
    authUrl.searchParams.set("client_id", NOTION_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", NOTION_REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("owner", "user");
    authUrl.searchParams.set("state", state);

    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error("Error initiating Notion OAuth:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth flow" },
      { status: 500 }
    );
  }
}
