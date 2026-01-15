import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Count my documents
    const myDocuments = await prisma.document.count({
      where: { userId },
    });

    let teamDocuments = 0;
    let sharedWithMe = 0;

    // Only count team/shared if user is in an organization
    if (orgId) {
      // Count team documents (from same org, not owned by user)
      // Once migration is applied, this will filter by visibility = TEAM
      teamDocuments = await prisma.document.count({
        where: {
          organizationId: orgId,
          NOT: { userId },
        },
      });

      // Count documents shared specifically with the user
      try {
        sharedWithMe = await prisma.documentCollaborator.count({
          where: { userId },
        });
      } catch {
        // collaborator table doesn't exist yet, fallback to 0
        sharedWithMe = 0;
      }
    }

    return NextResponse.json({
      my: myDocuments,
      team: teamDocuments,
      shared: sharedWithMe,
      total: myDocuments,  // Only show my documents in the badge
    });
  } catch (error: any) {
    console.error("Fetch document counts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch counts" },
      { status: 500 }
    );
  }
}
