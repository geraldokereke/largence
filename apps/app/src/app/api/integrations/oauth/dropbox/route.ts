import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID!;
const DROPBOX_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/dropbox/callback`
  : "http://localhost:3000/api/integrations/oauth/dropbox/callback";

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!DROPBOX_CLIENT_ID) {
      return NextResponse.json(
        { error: "Dropbox integration is not configured" },
        { status: 500 }
      );
    }

    // Create state parameter with user info
    const state = Buffer.from(JSON.stringify({ userId, orgId })).toString("base64");

    // Build Dropbox OAuth URL
    const authUrl = new URL("https://www.dropbox.com/oauth2/authorize");
    authUrl.searchParams.set("client_id", DROPBOX_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", DROPBOX_REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("token_access_type", "offline"); // Get refresh token
    authUrl.searchParams.set("state", state);
    // Request both read and write access for files
    authUrl.searchParams.set("scope", "files.content.read files.content.write files.metadata.read");

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error("Dropbox OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Dropbox OAuth" },
      { status: 500 }
    );
  }
}
