import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@largence/lib/prisma";
import { createAuditLog, getUserInitials } from "@/lib/audit";

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

// Integration metadata for available integrations
const INTEGRATION_CATALOG: Record<
  IntegrationProviderType,
  {
    name: string;
    description: string;
    category: string;
    features: string[];
    oauthSupported: boolean;
  }
> = {
  NOTION: {
    name: "Notion",
    description: "Sync documents and collaborate with your team workspace",
    oauthSupported: true,
    category: "Productivity",
    features: ["Two-way sync", "Auto-backup", "Real-time updates"],
  },
  GOOGLE_DRIVE: {
    name: "Google Drive",
    description: "Store and access your legal documents in Google Drive",
    category: "Cloud Storage",
    features: ["Auto-backup", "Folder mapping", "Version control"],
    oauthSupported: false, // Disabled until Google verification complete
  },
  DROPBOX: {
    name: "Dropbox",
    description: "Automatically sync documents to your Dropbox account",
    category: "Cloud Storage",
    features: ["Auto-backup", "Smart sync", "Selective sync"],
    oauthSupported: true,
  },
  SLACK: {
    name: "Slack",
    description: "Get notifications and updates in your Slack channels",
    category: "Productivity",
    features: ["Notifications", "Command shortcuts", "File sharing"],
    oauthSupported: false,
  },
  MICROSOFT_365: {
    name: "Microsoft 365",
    description: "Connect with Word, Excel, and OneDrive for seamless workflow",
    category: "Productivity",
    features: ["Office integration", "OneDrive sync", "Calendar sync"],
    oauthSupported: false,
  },
  DOCUSIGN: {
    name: "DocuSign",
    description: "Send documents for e-signature and track signing progress",
    category: "Productivity",
    features: ["E-signatures", "Status tracking", "Auto-reminders"],
    oauthSupported: true,
  },
  GOOGLE_SHEETS: {
    name: "Google Sheets",
    description: "Export data and reports to Google Sheets automatically",
    category: "Productivity",
    features: ["Data export", "Auto-refresh", "Custom templates"],
    oauthSupported: false,
  },
  SALESFORCE: {
    name: "Salesforce",
    description: "Sync customer data and contracts with your CRM",
    category: "CRM & Sales",
    features: ["Contact sync", "Deal tracking", "Custom fields"],
    oauthSupported: false,
  },
  TRELLO: {
    name: "Trello",
    description: "Manage legal workflows and projects with Trello boards",
    category: "Productivity",
    features: ["Board sync", "Card creation", "Checklist automation"],
    oauthSupported: false,
  },
  ASANA: {
    name: "Asana",
    description: "Track document approvals and tasks in Asana",
    category: "Productivity",
    features: ["Task automation", "Project sync", "Due date tracking"],
    oauthSupported: false,
  },
  ZAPIER: {
    name: "Zapier",
    description: "Create custom automation workflows with 5,000+ apps",
    category: "Automation",
    features: ["Custom workflows", "Multi-step zaps", "Webhooks"],
    oauthSupported: false,
  },
  AIRTABLE: {
    name: "Airtable",
    description: "Organize and track documents in flexible Airtable bases",
    category: "Productivity",
    features: ["Base sync", "View creation", "Record automation"],
    oauthSupported: false,
  },
  HUBSPOT: {
    name: "HubSpot",
    description: "Integrate with HubSpot CRM for customer and deal management",
    category: "CRM & Sales",
    features: ["Contact sync", "Deal pipeline", "Activity logging"],
    oauthSupported: false,
  },
};

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get connected integrations from database
    const connectedIntegrations = await prisma.integration.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        provider: true,
        name: true,
        status: true,
        externalEmail: true,
        syncEnabled: true,
        lastSyncAt: true,
        lastSyncStatus: true,
        syncedItemsCount: true,
        connectedAt: true,
        settings: true,
      },
    });

    // Build the response with all integrations (connected and available)
    const allIntegrations = Object.entries(INTEGRATION_CATALOG).map(
      ([providerId, catalog]) => {
        const connected = connectedIntegrations.find(
          (i) => i.provider === providerId
        );

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
          lastSyncStatus: connected?.lastSyncStatus || null,
          syncedItemsCount: connected?.syncedItemsCount || 0,
          externalEmail: connected?.externalEmail || null,
          syncEnabled: connected?.syncEnabled ?? true,
          settings: connected?.settings || null,
          oauthSupported: catalog.oauthSupported,
        };
      },
    );

    // Calculate stats
    const connectedCount = connectedIntegrations.filter(
      (i) => i.status === "CONNECTED"
    ).length;
    const totalSyncedItems = connectedIntegrations.reduce(
      (acc, i) => acc + i.syncedItemsCount,
      0,
    );
    const lastSyncTime =
      connectedIntegrations.length > 0
        ? connectedIntegrations
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

    // Check if already connected in database
    const existing = await prisma.integration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider,
        },
      },
    });

    if (existing && existing.status === "CONNECTED") {
      return NextResponse.json(
        { error: "Integration already connected" },
        { status: 400 },
      );
    }

    // For OAuth-supported integrations, return OAuth URL to initiate flow
    if (catalog.oauthSupported) {
      let oauthEndpoint = "";
      
      if (provider === "GOOGLE_DRIVE") {
        oauthEndpoint = "/api/integrations/oauth/google-drive";
      } else if (provider === "NOTION") {
        oauthEndpoint = "/api/integrations/oauth/notion";
      } else if (provider === "DROPBOX") {
        oauthEndpoint = "/api/integrations/oauth/dropbox";
      } else if (provider === "DOCUSIGN") {
        oauthEndpoint = "/api/integrations/oauth/docusign";
      }

      if (oauthEndpoint) {
        // Build the OAuth authorization URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "https://app.largence.com";
        
        if (provider === "GOOGLE_DRIVE") {
          const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
          if (!GOOGLE_CLIENT_ID) {
            return NextResponse.json(
              { error: "Google Drive integration is not configured. Please add GOOGLE_CLIENT_ID to environment variables." },
              { status: 500 }
            );
          }
          
          const GOOGLE_REDIRECT_URI = `${baseUrl}/api/integrations/oauth/google-drive/callback`;
          const SCOPES = [
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/drive.readonly",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
          ];
          
          const state = Buffer.from(JSON.stringify({ userId, orgId })).toString("base64");
          
          const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
          authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
          authUrl.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
          authUrl.searchParams.set("response_type", "code");
          authUrl.searchParams.set("scope", SCOPES.join(" "));
          authUrl.searchParams.set("access_type", "offline");
          authUrl.searchParams.set("prompt", "consent");
          authUrl.searchParams.set("state", state);

          return NextResponse.json({
            success: true,
            requiresOAuth: true,
            authUrl: authUrl.toString(),
          });
        } else if (provider === "NOTION") {
          const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID;
          if (!NOTION_CLIENT_ID) {
            return NextResponse.json(
              { error: "Notion integration is not configured. Please add NOTION_CLIENT_ID to environment variables." },
              { status: 500 }
            );
          }
          
          const NOTION_REDIRECT_URI = `${baseUrl}/api/integrations/oauth/notion/callback`;
          const state = Buffer.from(JSON.stringify({ userId, orgId })).toString("base64");
          
          const authUrl = new URL("https://api.notion.com/v1/oauth/authorize");
          authUrl.searchParams.set("client_id", NOTION_CLIENT_ID);
          authUrl.searchParams.set("redirect_uri", NOTION_REDIRECT_URI);
          authUrl.searchParams.set("response_type", "code");
          authUrl.searchParams.set("owner", "user");
          authUrl.searchParams.set("state", state);

          return NextResponse.json({
            success: true,
            requiresOAuth: true,
            authUrl: authUrl.toString(),
          });
        } else if (provider === "DROPBOX") {
          const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
          if (!DROPBOX_CLIENT_ID) {
            return NextResponse.json(
              { error: "Dropbox integration is not configured. Please add DROPBOX_CLIENT_ID to environment variables." },
              { status: 500 }
            );
          }
          
          const DROPBOX_REDIRECT_URI = `${baseUrl}/api/integrations/oauth/dropbox/callback`;
          const state = Buffer.from(JSON.stringify({ userId, orgId })).toString("base64");
          
          const authUrl = new URL("https://www.dropbox.com/oauth2/authorize");
          authUrl.searchParams.set("client_id", DROPBOX_CLIENT_ID);
          authUrl.searchParams.set("redirect_uri", DROPBOX_REDIRECT_URI);
          authUrl.searchParams.set("response_type", "code");
          authUrl.searchParams.set("token_access_type", "offline");
          authUrl.searchParams.set("state", state);
          // Request both read and write access for files
          authUrl.searchParams.set("scope", "files.content.read files.content.write files.metadata.read");

          return NextResponse.json({
            success: true,
            requiresOAuth: true,
            authUrl: authUrl.toString(),
          });
        } else if (provider === "DOCUSIGN") {
          const DOCUSIGN_CLIENT_ID = process.env.DOCUSIGN_CLIENT_ID;
          if (!DOCUSIGN_CLIENT_ID) {
            return NextResponse.json(
              { error: "DocuSign integration is not configured. Please add DOCUSIGN_CLIENT_ID to environment variables." },
              { status: 500 }
            );
          }
          
          const DOCUSIGN_REDIRECT_URI = `${baseUrl}/api/integrations/oauth/docusign/callback`;
          const SCOPES = ["signature", "extended"];
          const state = Buffer.from(JSON.stringify({ userId, orgId })).toString("base64");
          
          // Use demo environment for development
          const docusignAuthBase = process.env.DOCUSIGN_ENVIRONMENT === "production" 
            ? "https://account.docusign.com" 
            : "https://account-d.docusign.com";
          
          const authUrl = new URL(`${docusignAuthBase}/oauth/auth`);
          authUrl.searchParams.set("client_id", DOCUSIGN_CLIENT_ID);
          authUrl.searchParams.set("redirect_uri", DOCUSIGN_REDIRECT_URI);
          authUrl.searchParams.set("response_type", "code");
          authUrl.searchParams.set("scope", SCOPES.join(" "));
          authUrl.searchParams.set("state", state);

          return NextResponse.json({
            success: true,
            requiresOAuth: true,
            authUrl: authUrl.toString(),
          });
        }
      }
    }

    // For non-OAuth integrations, return coming soon message
    return NextResponse.json({
      success: false,
      comingSoon: true,
      message: `${catalog.name} integration is coming soon!`,
    });
  } catch (error) {
    console.error("Error connecting integration:", error);
    return NextResponse.json(
      { error: "Failed to connect integration" },
      { status: 500 },
    );
  }
}

export { INTEGRATION_CATALOG };
export type { IntegrationProviderType };

