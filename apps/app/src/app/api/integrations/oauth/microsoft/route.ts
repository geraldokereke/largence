import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID!;
const MICROSOFT_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/microsoft/callback`
  : "http://localhost:3000/api/integrations/oauth/microsoft/callback";

const SCOPES = [
  "https://graph.microsoft.com/Files.ReadWrite",
  "https://graph.microsoft.com/User.Read",
  "offline_access",
];

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!MICROSOFT_CLIENT_ID) {
      return NextResponse.json(
        { error: "Microsoft integration is not configured" },
        { status: 500 }
      );
    }

    const state = Buffer.from(JSON.stringify({ userId, orgId })).toString("base64");

    const authUrl = new URL(
      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
    );
    authUrl.searchParams.set("client_id", MICROSOFT_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", MICROSOFT_REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", SCOPES.join(" "));
    authUrl.searchParams.set("response_mode", "query");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("prompt", "consent");

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error("Microsoft OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Microsoft OAuth" },
      { status: 500 }
    );
  }
}
