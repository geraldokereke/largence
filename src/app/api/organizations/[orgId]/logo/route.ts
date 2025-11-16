import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64 for Clerk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Upload logo to Clerk organization
    const client = await clerkClient();
    const organization = await client.organizations.updateOrganizationMetadata(orgId, {
      publicMetadata: {
        logoUrl: dataUrl,
      },
    });

    // Note: Clerk doesn't support custom organization images via API yet
    // The logo is stored in metadata and can be displayed in the UI
    return NextResponse.json({ success: true, imageUrl: dataUrl });
  } catch (error: any) {
    console.error("Error uploading organization logo:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload logo" },
      { status: 500 }
    );
  }
}
