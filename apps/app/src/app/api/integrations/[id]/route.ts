import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@largence/lib/prisma";
import {
  INTEGRATION_CATALOG,
  type IntegrationProviderType,
} from "../route";
import { createAuditLog, getUserInitials } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId, orgId } = await auth();
    const { id } = await params;

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const integration = await prisma.integration.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 },
      );
    }

    const catalog = INTEGRATION_CATALOG[integration.provider as IntegrationProviderType];

    return NextResponse.json({
      integration: {
        id: integration.id,
        provider: integration.provider,
        name: integration.name,
        description: catalog?.description,
        category: catalog?.category,
        features: catalog?.features,
        status: integration.status,
        externalEmail: integration.externalEmail,
        syncEnabled: integration.syncEnabled,
        lastSyncAt: integration.lastSyncAt?.toISOString(),
        lastSyncStatus: integration.lastSyncStatus,
        syncedItemsCount: integration.syncedItemsCount,
        connectedAt: integration.connectedAt.toISOString(),
        settings: integration.settings,
      },
    });
  } catch (error) {
    console.error("Error fetching integration:", error);
    return NextResponse.json(
      { error: "Failed to fetch integration" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId, orgId } = await auth();
    const { id } = await params;

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { syncEnabled, settings } = body;

    const integration = await prisma.integration.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.integration.update({
      where: { id },
      data: {
        ...(syncEnabled !== undefined && { syncEnabled }),
        ...(settings && { settings }),
      },
    });

    return NextResponse.json({ success: true, integration: updated });
  } catch (error) {
    console.error("Error updating integration:", error);
    return NextResponse.json(
      { error: "Failed to update integration" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId, orgId } = await auth();
    const { id } = await params;

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const integration = await prisma.integration.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 },
      );
    }

    const catalog = INTEGRATION_CATALOG[integration.provider as IntegrationProviderType];

    // Delete the integration from database
    await prisma.integration.delete({
      where: { id },
    });

    // Log audit event for integration disconnection
    const user = await currentUser();
    await createAuditLog({
      userId,
      organizationId: orgId,
      action: "INTEGRATION_DISCONNECTED",
      actionLabel: `Disconnected ${catalog?.name || integration.provider} integration`,
      entityType: "Integration",
      entityId: id,
      entityName: catalog?.name || integration.provider,
      metadata: {
        provider: integration.provider,
        category: catalog?.category,
      },
      userName: user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.username ||
          "User"
        : "User",
      userAvatar: getUserInitials(user?.firstName, user?.lastName),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting integration:", error);
    return NextResponse.json(
      { error: "Failed to disconnect integration" },
      { status: 500 },
    );
  }
}
