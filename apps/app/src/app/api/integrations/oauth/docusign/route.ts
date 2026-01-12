import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const DOCUSIGN_CLIENT_ID = process.env.DOCUSIGN_CLIENT_ID!;
const DOCUSIGN_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/docusign/callback`
  : "http://localhost:3000/api/integrations/oauth/docusign/callback";

// Use demo environment for development, production for live
const DOCUSIGN_AUTH_BASE = process.env.DOCUSIGN_ENVIRONMENT === "production"
  ? "https://account.docusign.com"
  : "https://account-d.docusign.com";

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!DOCUSIGN_CLIENT_ID) {
      return NextResponse.json(
        { error: "DocuSign integration is not configured" },
        { status: 500 }
      );
    }

    // Create state parameter with user info
    const state = Buffer.from(JSON.stringify({ userId, orgId })).toString("base64");

    // DocuSign OAuth scopes
    const scopes = ["signature", "extended"];

    // Build DocuSign OAuth URL
    const authUrl = new URL(`${DOCUSIGN_AUTH_BASE}/oauth/auth`);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scopes.join(" "));
    authUrl.searchParams.set("client_id", DOCUSIGN_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", DOCUSIGN_REDIRECT_URI);
    authUrl.searchParams.set("state", state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error("DocuSign OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate DocuSign OAuth" },
      { status: 500 }
    );
  }
}
