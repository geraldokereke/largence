import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";
import { createAuditLog, getUserInitials } from "@/lib/audit";

// Notion OAuth configuration
const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID!;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET!;
const NOTION_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/notion/callback`
  : "http://localhost:3000/api/integrations/oauth/notion/callback";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth error
    if (error) {
      console.error("Notion OAuth error:", error);
      return NextResponse.redirect(
        new URL("/integrations?error=oauth_denied", request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/integrations?error=missing_params", request.url)
      );
    }

    // Decode state
    let stateData: { userId: string; orgId: string };
    try {
      stateData = JSON.parse(Buffer.from(state, "base64").toString());
    } catch {
      return NextResponse.redirect(
        new URL("/integrations?error=invalid_state", request.url)
      );
    }

    const { userId, orgId } = stateData;

    // Exchange code for tokens
    const basicAuth = Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString("base64");
    
    const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: NOTION_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Notion token exchange error:", errorData);
      return NextResponse.redirect(
        new URL("/integrations?error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json();
    const { access_token, workspace_id, workspace_name, workspace_icon, owner } = tokens;

    // Get user email from owner if available
    let externalEmail = null;
    let externalAccountId = workspace_id;

    if (owner?.user?.person?.email) {
      externalEmail = owner.user.person.email;
    }

    // Create or update integration record
    const integration = await prisma.integration.upsert({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider: "NOTION",
        },
      },
      update: {
        status: "CONNECTED",
        accessToken: access_token,
        tokenExpiresAt: null, // Notion tokens don't expire
        externalEmail,
        externalAccountId,
        scope: ["read_content", "insert_content", "update_content"],
        settings: {
          workspaceId: workspace_id,
          workspaceName: workspace_name,
          workspaceIcon: workspace_icon,
        },
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        connectedAt: new Date(),
      },
      create: {
        organizationId: orgId,
        userId,
        provider: "NOTION",
        name: workspace_name || "Notion",
        status: "CONNECTED",
        accessToken: access_token,
        tokenExpiresAt: null,
        externalEmail,
        externalAccountId,
        scope: ["read_content", "insert_content", "update_content"],
        settings: {
          workspaceId: workspace_id,
          workspaceName: workspace_name,
          workspaceIcon: workspace_icon,
        },
        syncEnabled: true,
        syncFrequency: "realtime",
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
      },
    });

    // Log audit event
    const user = await currentUser();
    await createAuditLog({
      userId,
      organizationId: orgId,
      action: "INTEGRATION_CONNECTED",
      actionLabel: `Connected Notion workspace: ${workspace_name || "Notion"}`,
      entityType: "Integration",
      entityId: integration.id,
      entityName: workspace_name || "Notion",
      metadata: {
        provider: "NOTION",
        workspaceId: workspace_id,
        workspaceName: workspace_name,
      },
      userName: user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.username ||
          "User"
        : "User",
      userAvatar: getUserInitials(user?.firstName, user?.lastName),
    });

    // Redirect to integrations page with success
    return NextResponse.redirect(
      new URL("/integrations?success=notion_connected", request.url)
    );
  } catch (error) {
    console.error("Notion OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/integrations?error=callback_failed", request.url)
    );
  }
}
