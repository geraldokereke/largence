import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await params;
    const body = await req.json();

    // Update organization public metadata
    const client = await clerkClient();
    await client.organizations.updateOrganizationMetadata(orgId, {
      publicMetadata: body,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating organization metadata:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update metadata" },
      { status: 500 }
    );
  }
}
