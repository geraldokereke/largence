import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  connectedIntegrationsStore,
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

    const orgIntegrations = connectedIntegrationsStore.get(orgId);
    if (!orgIntegrations) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 },
      );
    }

    let integration = null;
    for (const [provider, int] of orgIntegrations.entries()) {
      if (int.id === id) {
        const catalog =
          INTEGRATION_CATALOG[provider as IntegrationProviderType];
        integration = {
          ...int,
          name: catalog?.name,
          description: catalog?.description,
          category: catalog?.category,
          features: catalog?.features,
        };
        break;
      }
    }

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ integration });
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

    const orgIntegrations = connectedIntegrationsStore.get(orgId);
    if (!orgIntegrations) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 },
      );
    }

    let foundProvider: string | null = null;
    for (const [provider, int] of orgIntegrations.entries()) {
      if (int.id === id) {
        foundProvider = provider;
        break;
      }
    }

    if (!foundProvider) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 },
      );
    }

    // For now, just return success (settings would be updated in a real implementation)
    return NextResponse.json({ success: true });
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

    const orgIntegrations = connectedIntegrationsStore.get(orgId);
    if (!orgIntegrations) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 },
      );
    }

    let foundProvider: string | null = null;
    for (const [provider, int] of orgIntegrations.entries()) {
      if (int.id === id) {
        foundProvider = provider;
        break;
      }
    }

    if (!foundProvider) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 },
      );
    }

    // Get integration info before deleting for audit log
    const catalog =
      INTEGRATION_CATALOG[foundProvider as IntegrationProviderType];

    // Remove the integration
    orgIntegrations.delete(foundProvider);

    // Log audit event for integration disconnection
    const user = await currentUser();
    await createAuditLog({
      userId,
      organizationId: orgId,
      action: "INTEGRATION_DISCONNECTED",
      actionLabel: `Disconnected ${catalog?.name || foundProvider} integration`,
      entityType: "Integration",
      entityId: id,
      entityName: catalog?.name || foundProvider,
      metadata: {
        provider: foundProvider,
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
