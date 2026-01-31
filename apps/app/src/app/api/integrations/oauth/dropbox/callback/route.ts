import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";
import { createAuditLog, getUserInitials } from "@/lib/audit";

const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID!;
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET!;
const DROPBOX_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/dropbox/callback`
  : "https://app.largence.com/api/integrations/oauth/dropbox/callback";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth error
    if (error) {
      console.error("Dropbox OAuth error:", error);
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
    const tokenResponse = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: DROPBOX_CLIENT_ID,
        client_secret: DROPBOX_CLIENT_SECRET,
        redirect_uri: DROPBOX_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Dropbox token exchange error:", errorData);
      return NextResponse.redirect(
        new URL("/integrations?error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in, account_id } = tokens;

    // Get user info from Dropbox
    let externalEmail = null;
    let displayName = null;

    try {
      const userInfoResponse = await fetch(
        "https://api.dropboxapi.com/2/users/get_current_account",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        externalEmail = userInfo.email;
        displayName = userInfo.name?.display_name;
      }
    } catch (e) {
      console.error("Failed to get Dropbox user info:", e);
    }

    // Calculate token expiration (Dropbox tokens expire in 4 hours by default)
    const tokenExpiresAt = expires_in 
      ? new Date(Date.now() + expires_in * 1000)
      : new Date(Date.now() + 4 * 60 * 60 * 1000);

    // Create or update integration record
    const integration = await prisma.integration.upsert({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider: "DROPBOX",
        },
      },
      update: {
        status: "CONNECTED",
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt,
        externalEmail,
        externalAccountId: account_id,
        scope: ["files.content.write", "files.content.read"],
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        connectedAt: new Date(),
        settings: {
          displayName,
        },
      },
      create: {
        organizationId: orgId,
        userId,
        provider: "DROPBOX",
        name: "Dropbox",
        status: "CONNECTED",
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt,
        externalEmail,
        externalAccountId: account_id,
        scope: ["files.content.write", "files.content.read"],
        syncEnabled: true,
        syncFrequency: "realtime",
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        settings: {
          displayName,
        },
      },
    });

    // Log audit event
    const user = await currentUser();
    await createAuditLog({
      userId,
      organizationId: orgId,
      action: "INTEGRATION_CONNECTED",
      actionLabel: "Connected Dropbox integration",
      entityType: "Integration",
      entityId: integration.id,
      entityName: "Dropbox",
      metadata: {
        provider: "DROPBOX",
        externalEmail,
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
      new URL("/integrations?success=dropbox_connected", request.url)
    );
  } catch (error) {
    console.error("Dropbox OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/integrations?error=callback_failed", request.url)
    );
  }
}
