import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";
import { createAuditLog, getUserInitials } from "@/lib/audit";

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID!;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET!;
const MICROSOFT_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/microsoft/callback`
  : "http://localhost:3000/api/integrations/oauth/microsoft/callback";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.error("Microsoft OAuth error:", error);
      return NextResponse.redirect(
        new URL("/integrations?error=oauth_denied", request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/integrations?error=missing_params", request.url)
      );
    }

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
    const tokenResponse = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          client_id: MICROSOFT_CLIENT_ID,
          client_secret: MICROSOFT_CLIENT_SECRET,
          redirect_uri: MICROSOFT_REDIRECT_URI,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Microsoft token exchange error:", errorData);
      return NextResponse.redirect(
        new URL("/integrations?error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokens;

    // Get user info from Microsoft Graph
    let externalEmail: string | null = null;
    let displayName: string | null = null;
    let externalAccountId: string | null = null;

    try {
      const userInfoResponse = await fetch(
        "https://graph.microsoft.com/v1.0/me",
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        externalEmail = userInfo.mail || userInfo.userPrincipalName;
        displayName = userInfo.displayName;
        externalAccountId = userInfo.id;
      }
    } catch (e) {
      console.error("Failed to get Microsoft user info:", e);
    }

    const tokenExpiresAt = expires_in
      ? new Date(Date.now() + expires_in * 1000)
      : new Date(Date.now() + 60 * 60 * 1000);

    const integration = await prisma.integration.upsert({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider: "MICROSOFT_365",
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
          "https://graph.microsoft.com/Files.ReadWrite",
          "https://graph.microsoft.com/User.Read",
          "offline_access",
        ],
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        connectedAt: new Date(),
        settings: { displayName },
      },
      create: {
        organizationId: orgId,
        userId,
        provider: "MICROSOFT_365",
        name: "Microsoft",
        status: "CONNECTED",
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt,
        externalEmail,
        externalAccountId,
        scope: [
          "https://graph.microsoft.com/Files.ReadWrite",
          "https://graph.microsoft.com/User.Read",
          "offline_access",
        ],
        syncEnabled: true,
        syncFrequency: "realtime",
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        settings: { displayName },
      },
    });

    const user = await currentUser();
    await createAuditLog({
      userId,
      organizationId: orgId,
      action: "INTEGRATION_CONNECTED",
      actionLabel: "Connected Microsoft integration",
      entityType: "Integration",
      entityId: integration.id,
      entityName: "Microsoft",
      metadata: { provider: "MICROSOFT_365", externalEmail },
      userName: user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.username ||
          "User"
        : "User",
      userAvatar: getUserInitials(user?.firstName, user?.lastName),
    });

    return NextResponse.redirect(
      new URL("/integrations?success=microsoft_connected", request.url)
    );
  } catch (error) {
    console.error("Microsoft OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/integrations?error=callback_failed", request.url)
    );
  }
}
