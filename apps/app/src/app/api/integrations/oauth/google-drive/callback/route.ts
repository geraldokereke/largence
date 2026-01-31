import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";
import { createAuditLog, getUserInitials } from "@/lib/audit";

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/google-drive/callback`
  : "https://app.largence.com/api/integrations/oauth/google-drive/callback";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth error
    if (error) {
      console.error("Google OAuth error:", error);
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
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: GOOGLE_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange error:", errorData);
      return NextResponse.redirect(
        new URL("/integrations?error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokens;

    // Get user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    let externalEmail = null;
    let externalAccountId = null;

    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      externalEmail = userInfo.email;
      externalAccountId = userInfo.id;
    }

    // Calculate token expiration
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    // Create or update integration record
    const integration = await prisma.integration.upsert({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider: "GOOGLE_DRIVE",
        },
      },
      update: {
        status: "CONNECTED",
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt,
        externalEmail,
        externalAccountId,
        scope: [
          "drive.file",
          "drive.readonly",
          "userinfo.email",
          "userinfo.profile",
        ],
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        connectedAt: new Date(),
      },
      create: {
        organizationId: orgId,
        userId,
        provider: "GOOGLE_DRIVE",
        name: "Google Drive",
        status: "CONNECTED",
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt,
        externalEmail,
        externalAccountId,
        scope: [
          "drive.file",
          "drive.readonly",
          "userinfo.email",
          "userinfo.profile",
        ],
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
      actionLabel: "Connected Google Drive integration",
      entityType: "Integration",
      entityId: integration.id,
      entityName: "Google Drive",
      metadata: {
        provider: "GOOGLE_DRIVE",
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
      new URL("/integrations?success=google_drive_connected", request.url)
    );
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/integrations?error=callback_failed", request.url)
    );
  }
}
