import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";
import { createAuditLog, getUserInitials } from "@/lib/audit";

const DOCUSIGN_CLIENT_ID = process.env.DOCUSIGN_CLIENT_ID!;
const DOCUSIGN_CLIENT_SECRET = process.env.DOCUSIGN_CLIENT_SECRET!;
const DOCUSIGN_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/docusign/callback`
  : "http://localhost:3000/api/integrations/oauth/docusign/callback";

// Use demo environment for development, production for live
const DOCUSIGN_AUTH_BASE = process.env.DOCUSIGN_ENVIRONMENT === "production"
  ? "https://account.docusign.com"
  : "https://account-d.docusign.com";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth error
    if (error) {
      console.error("DocuSign OAuth error:", error);
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
    const basicAuth = Buffer.from(`${DOCUSIGN_CLIENT_ID}:${DOCUSIGN_CLIENT_SECRET}`).toString("base64");
    
    const tokenResponse = await fetch(`${DOCUSIGN_AUTH_BASE}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: DOCUSIGN_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("DocuSign token exchange error:", errorData);
      return NextResponse.redirect(
        new URL("/integrations?error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokens;

    // Get user info from DocuSign
    let externalEmail = null;
    let externalAccountId = null;
    let accountName = null;
    let baseUri = null;

    try {
      const userInfoResponse = await fetch(
        `${DOCUSIGN_AUTH_BASE}/oauth/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        externalEmail = userInfo.email;
        
        // Get the default account
        const defaultAccount = userInfo.accounts?.find((acc: any) => acc.is_default) 
          || userInfo.accounts?.[0];
        
        if (defaultAccount) {
          externalAccountId = defaultAccount.account_id;
          accountName = defaultAccount.account_name;
          baseUri = defaultAccount.base_uri;
        }
      }
    } catch (e) {
      console.error("Failed to get DocuSign user info:", e);
    }

    // Calculate token expiration
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    // Create or update integration record
    const integration = await prisma.integration.upsert({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider: "DOCUSIGN",
        },
      },
      update: {
        status: "CONNECTED",
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt,
        externalEmail,
        externalAccountId,
        scope: ["signature", "extended"],
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        connectedAt: new Date(),
        settings: {
          accountName,
          baseUri,
          environment: process.env.DOCUSIGN_ENVIRONMENT || "demo",
        },
      },
      create: {
        organizationId: orgId,
        userId,
        provider: "DOCUSIGN",
        name: "DocuSign",
        status: "CONNECTED",
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt,
        externalEmail,
        externalAccountId,
        scope: ["signature", "extended"],
        syncEnabled: true,
        syncFrequency: "realtime",
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        settings: {
          accountName,
          baseUri,
          environment: process.env.DOCUSIGN_ENVIRONMENT || "demo",
        },
      },
    });

    // Log audit event
    const user = await currentUser();
    await createAuditLog({
      userId,
      organizationId: orgId,
      action: "INTEGRATION_CONNECTED",
      actionLabel: "Connected DocuSign integration",
      entityType: "Integration",
      entityId: integration.id,
      entityName: "DocuSign",
      metadata: {
        provider: "DOCUSIGN",
        externalEmail,
        accountName,
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
      new URL("/integrations?success=docusign_connected", request.url)
    );
  } catch (error) {
    console.error("DocuSign OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/integrations?error=callback_failed", request.url)
    );
  }
}
