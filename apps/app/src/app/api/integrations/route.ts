import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Integration provider type
type IntegrationProviderType =
  | "NOTION"
  | "GOOGLE_DRIVE"
  | "DROPBOX"
  | "SLACK"
  | "MICROSOFT_365"
  | "DOCUSIGN"
  | "GOOGLE_SHEETS"
  | "SALESFORCE"
  | "TRELLO"
  | "ASANA"
  | "ZAPIER"
  | "AIRTABLE"
  | "HUBSPOT";

// In-memory storage for connected integrations (per organization)
// In production, this would be stored in the database
const connectedIntegrationsStore: Map<
  string,
  Map<
    string,
    {
      id: string;
      provider: IntegrationProviderType;
      status: string;
      connectedAt: Date;
      lastSyncAt: Date;
      syncedItemsCount: number;
    }
  >
> = new Map();

// Integration metadata for available integrations
const INTEGRATION_CATALOG: Record<
  IntegrationProviderType,
  {
    name: string;
    description: string;
    category: string;
    features: string[];
  }
> = {
  NOTION: {
    name: "Notion",
    description: "Sync documents and collaborate with your team workspace",
    category: "Productivity",
    features: ["Two-way sync", "Auto-backup", "Real-time updates"],
  },
  GOOGLE_DRIVE: {
    name: "Google Drive",
    description: "Store and access your legal documents in Google Drive",
    category: "Cloud Storage",
    features: ["Auto-backup", "Folder mapping", "Version control"],
  },
  DROPBOX: {
    name: "Dropbox",
    description: "Automatically sync documents to your Dropbox account",
    category: "Cloud Storage",
    features: ["Auto-backup", "Smart sync", "Selective sync"],
  },
  SLACK: {
    name: "Slack",
    description: "Get notifications and updates in your Slack channels",
    category: "Productivity",
    features: ["Notifications", "Command shortcuts", "File sharing"],
  },
  MICROSOFT_365: {
    name: "Microsoft 365",
    description: "Connect with Word, Excel, and OneDrive for seamless workflow",
    category: "Productivity",
    features: ["Office integration", "OneDrive sync", "Calendar sync"],
  },
  DOCUSIGN: {
    name: "DocuSign",
    description: "Send documents for e-signature and track signing progress",
    category: "Productivity",
    features: ["E-signatures", "Status tracking", "Auto-reminders"],
  },
  GOOGLE_SHEETS: {
    name: "Google Sheets",
    description: "Export data and reports to Google Sheets automatically",
    category: "Productivity",
    features: ["Data export", "Auto-refresh", "Custom templates"],
  },
  SALESFORCE: {
    name: "Salesforce",
    description: "Sync customer data and contracts with your CRM",
    category: "CRM & Sales",
    features: ["Contact sync", "Deal tracking", "Custom fields"],
  },
  TRELLO: {
    name: "Trello",
    description: "Manage legal workflows and projects with Trello boards",
    category: "Productivity",
    features: ["Board sync", "Card creation", "Checklist automation"],
  },
  ASANA: {
    name: "Asana",
    description: "Track document approvals and tasks in Asana",
    category: "Productivity",
    features: ["Task automation", "Project sync", "Due date tracking"],
  },
  ZAPIER: {
    name: "Zapier",
    description: "Create custom automation workflows with 5,000+ apps",
    category: "Automation",
    features: ["Custom workflows", "Multi-step zaps", "Webhooks"],
  },
  AIRTABLE: {
    name: "Airtable",
    description: "Organize and track documents in flexible Airtable bases",
    category: "Productivity",
    features: ["Base sync", "View creation", "Record automation"],
  },
  HUBSPOT: {
    name: "HubSpot",
    description: "Integrate with HubSpot CRM for customer and deal management",
    category: "CRM & Sales",
    features: ["Contact sync", "Deal pipeline", "Activity logging"],
  },
};

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get connected integrations for this organization from in-memory store
    const orgIntegrations = connectedIntegrationsStore.get(orgId) || new Map();
    const connectedList = Array.from(orgIntegrations.values());

    // Build the response with all integrations (connected and available)
    const allIntegrations = Object.entries(INTEGRATION_CATALOG).map(
      ([providerId, catalog]) => {
        const connected = connectedList.find((i) => i.provider === providerId);

        return {
          id: connected?.id || providerId,
          provider: providerId,
          name: catalog.name,
          description: catalog.description,
          category: catalog.category,
          features: catalog.features,
          status: connected?.status || "available",
          connectedAt: connected?.connectedAt?.toISOString() || null,
          lastSyncAt: connected?.lastSyncAt?.toISOString() || null,
          lastSyncStatus: connected ? "success" : null,
          syncedItemsCount: connected?.syncedItemsCount || 0,
          externalEmail: null,
          syncEnabled: true,
          settings: null,
        };
      },
    );

    // Calculate stats
    const connectedCount = connectedList.length;
    const totalSyncedItems = connectedList.reduce(
      (acc: number, i) => acc + i.syncedItemsCount,
      0,
    );
    const lastSyncTime =
      connectedList.length > 0
        ? connectedList
            .map((i) => i.lastSyncAt)
            .filter(Boolean)
            .sort((a, b) => (b?.getTime() || 0) - (a?.getTime() || 0))[0]
            ?.toISOString() || null
        : null;

    // Group by category
    const categories = [
      {
        id: "all",
        name: "All Integrations",
        count: allIntegrations.length,
      },
      {
        id: "connected",
        name: "Connected",
        count: connectedCount,
      },
      {
        id: "Cloud Storage",
        name: "Cloud Storage",
        count: allIntegrations.filter((i) => i.category === "Cloud Storage")
          .length,
      },
      {
        id: "Productivity",
        name: "Productivity",
        count: allIntegrations.filter((i) => i.category === "Productivity")
          .length,
      },
      {
        id: "CRM & Sales",
        name: "CRM & Sales",
        count: allIntegrations.filter((i) => i.category === "CRM & Sales")
          .length,
      },
      {
        id: "Automation",
        name: "Automation",
        count: allIntegrations.filter((i) => i.category === "Automation")
          .length,
      },
    ];

    return NextResponse.json({
      integrations: allIntegrations,
      categories,
      stats: {
        connectedCount,
        totalSyncedItems,
        lastSyncTime,
        availableCount: allIntegrations.length - connectedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 },
    );
  }
}

// Connect a new integration
export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { provider } = body;

    if (
      !provider ||
      !INTEGRATION_CATALOG[provider as IntegrationProviderType]
    ) {
      return NextResponse.json(
        { error: "Invalid integration provider" },
        { status: 400 },
      );
    }

    const catalog = INTEGRATION_CATALOG[provider as IntegrationProviderType];

    // Get or create org integrations map
    if (!connectedIntegrationsStore.has(orgId)) {
      connectedIntegrationsStore.set(orgId, new Map());
    }
    const orgIntegrations = connectedIntegrationsStore.get(orgId)!;

    // Check if already connected
    if (orgIntegrations.has(provider)) {
      return NextResponse.json(
        { error: "Integration already connected" },
        { status: 400 },
      );
    }

    // Create the integration
    const integrationId = `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const integration = {
      id: integrationId,
      provider: provider as IntegrationProviderType,
      status: "CONNECTED",
      connectedAt: now,
      lastSyncAt: now,
      syncedItemsCount: Math.floor(Math.random() * 500) + 50, // Demo data
    };

    orgIntegrations.set(provider, integration);

    return NextResponse.json({
      success: true,
      integration: {
        id: integration.id,
        provider: integration.provider,
        name: catalog.name,
        status: integration.status,
        connectedAt: integration.connectedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error connecting integration:", error);
    return NextResponse.json(
      { error: "Failed to connect integration" },
      { status: 500 },
    );
  }
}

// Export the store for the [id] route to use
export { connectedIntegrationsStore, INTEGRATION_CATALOG };
export type { IntegrationProviderType };
