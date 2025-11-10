import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import {
  Search,
  Filter,
  CheckCircle2,
  Settings,
  Trash2,
  Clock,
} from "lucide-react";
import {
  SiNotion,
  SiGoogledrive,
  SiDropbox,
  SiSlack,
  SiGooglesheets,
  SiTrello,
  SiAsana,
  SiZapier,
  SiAirtable,
  SiSalesforce,
  SiHubspot,
} from "react-icons/si";
import { FaMicrosoft, FaFileSignature } from "react-icons/fa";

const categories = [
  { id: "all", name: "All Integrations", count: 24 },
  { id: "connected", name: "Connected", count: 8 },
  { id: "storage", name: "Cloud Storage", count: 6 },
  { id: "productivity", name: "Productivity", count: 8 },
  { id: "crm", name: "CRM & Sales", count: 4 },
  { id: "automation", name: "Automation", count: 6 },
];

const integrations = [
  {
    id: 1,
    name: "Notion",
    description: "Sync documents and collaborate with your team workspace",
    icon: SiNotion,
    iconColor: "text-black",
    iconBg: "bg-black/5",
    category: "Productivity",
    status: "connected",
    lastSync: "5 minutes ago",
    connectedDate: "Jan 15, 2025",
    syncedItems: 234,
    features: ["Two-way sync", "Auto-backup", "Real-time updates"],
  },
  {
    id: 2,
    name: "Google Drive",
    description: "Store and access your legal documents in Google Drive",
    icon: SiGoogledrive,
    iconColor: "text-[#4285F4]",
    iconBg: "bg-blue-500/5",
    category: "Cloud Storage",
    status: "connected",
    lastSync: "12 minutes ago",
    connectedDate: "Jan 10, 2025",
    syncedItems: 456,
    features: ["Auto-backup", "Folder mapping", "Version control"],
  },
  {
    id: 3,
    name: "Dropbox",
    description: "Automatically sync documents to your Dropbox account",
    icon: SiDropbox,
    iconColor: "text-[#0061FF]",
    iconBg: "bg-blue-600/5",
    category: "Cloud Storage",
    status: "connected",
    lastSync: "1 hour ago",
    connectedDate: "Feb 2, 2025",
    syncedItems: 189,
    features: ["Auto-backup", "Smart sync", "Selective sync"],
  },
  {
    id: 4,
    name: "Slack",
    description: "Get notifications and updates in your Slack channels",
    icon: SiSlack,
    iconColor: "text-[#4A154B]",
    iconBg: "bg-purple-900/5",
    category: "Productivity",
    status: "connected",
    lastSync: "Just now",
    connectedDate: "Jan 5, 2025",
    syncedItems: 1243,
    features: ["Notifications", "Command shortcuts", "File sharing"],
  },
  {
    id: 5,
    name: "Microsoft 365",
    description: "Connect with Word, Excel, and OneDrive for seamless workflow",
    icon: FaMicrosoft,
    iconColor: "text-[#00A4EF]",
    iconBg: "bg-blue-500/5",
    category: "Productivity",
    status: "connected",
    lastSync: "8 minutes ago",
    connectedDate: "Jan 20, 2025",
    syncedItems: 567,
    features: ["Office integration", "OneDrive sync", "Calendar sync"],
  },
  {
    id: 6,
    name: "DocuSign",
    description: "Send documents for e-signature and track signing progress",
    icon: FaFileSignature,
    iconColor: "text-[#FF3B2F]",
    iconBg: "bg-red-500/5",
    category: "Productivity",
    status: "connected",
    lastSync: "2 hours ago",
    connectedDate: "Feb 12, 2025",
    syncedItems: 89,
    features: ["E-signatures", "Status tracking", "Auto-reminders"],
  },
  {
    id: 7,
    name: "Google Sheets",
    description: "Export data and reports to Google Sheets automatically",
    icon: SiGooglesheets,
    iconColor: "text-[#34A853]",
    iconBg: "bg-green-500/5",
    category: "Productivity",
    status: "connected",
    lastSync: "30 minutes ago",
    connectedDate: "Jan 25, 2025",
    syncedItems: 124,
    features: ["Data export", "Auto-refresh", "Custom templates"],
  },
  {
    id: 8,
    name: "Salesforce",
    description: "Sync customer data and contracts with your CRM",
    icon: SiSalesforce,
    iconColor: "text-[#00A1E0]",
    iconBg: "bg-blue-400/5",
    category: "CRM & Sales",
    status: "connected",
    lastSync: "15 minutes ago",
    connectedDate: "Feb 1, 2025",
    syncedItems: 345,
    features: ["Contact sync", "Deal tracking", "Custom fields"],
  },
  {
    id: 9,
    name: "Trello",
    description: "Manage legal workflows and projects with Trello boards",
    icon: SiTrello,
    iconColor: "text-[#0079BF]",
    iconBg: "bg-blue-600/5",
    category: "Productivity",
    status: "available",
    lastSync: null,
    connectedDate: null,
    syncedItems: 0,
    features: ["Board sync", "Card creation", "Checklist automation"],
  },
  {
    id: 10,
    name: "Asana",
    description: "Track document approvals and tasks in Asana",
    icon: SiAsana,
    iconColor: "text-[#F06A6A]",
    iconBg: "bg-red-400/5",
    category: "Productivity",
    status: "available",
    lastSync: null,
    connectedDate: null,
    syncedItems: 0,
    features: ["Task automation", "Project sync", "Due date tracking"],
  },
  {
    id: 11,
    name: "Zapier",
    description: "Create custom automation workflows with 5,000+ apps",
    icon: SiZapier,
    iconColor: "text-[#FF4A00]",
    iconBg: "bg-orange-500/5",
    category: "Automation",
    status: "available",
    lastSync: null,
    connectedDate: null,
    syncedItems: 0,
    features: ["Custom workflows", "Multi-step zaps", "Webhooks"],
  },
  {
    id: 12,
    name: "Airtable",
    description: "Organize and track documents in flexible Airtable bases",
    icon: SiAirtable,
    iconColor: "text-[#18BFFF]",
    iconBg: "bg-blue-400/5",
    category: "Productivity",
    status: "available",
    lastSync: null,
    connectedDate: null,
    syncedItems: 0,
    features: ["Base sync", "View creation", "Record automation"],
  },
  {
    id: 13,
    name: "HubSpot",
    description: "Integrate with HubSpot CRM for customer and deal management",
    icon: SiHubspot,
    iconColor: "text-[#FF7A59]",
    iconBg: "bg-orange-400/5",
    category: "CRM & Sales",
    status: "available",
    lastSync: null,
    connectedDate: null,
    syncedItems: 0,
    features: ["Contact sync", "Deal pipeline", "Activity logging"],
  },
];

export default function IntegrationsPage() {
  return (
    <div className="flex flex-1 flex-col p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold font-(family-name:--font-general-sans)">
              Integrations
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connect Largence with your favorite tools and automate your legal
              workflows
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            className="h-10 rounded-sm pl-9"
          />
        </div>
        <Button variant="outline" className="h-10 rounded-sm">
          <Filter className="h-5 w-5" />
          Filters
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category, index) => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-sm border whitespace-nowrap transition-colors ${
              index === 0
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-accent"
            }`}
          >
            <span className="text-sm font-medium">{category.name}</span>
            <span className="ml-2 text-xs opacity-70">({category.count})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isConnected = integration.status === "connected";

          return (
            <div
              key={integration.id}
              className="group flex flex-col h-80 rounded-sm border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`p-3 rounded-sm ${integration.iconBg} shrink-0`}
                >
                  <Icon className={`h-8 w-8 ${integration.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold font-(family-name:--font-general-sans)">
                      {integration.name}
                    </h3>
                    {isConnected && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-sm text-xs font-medium ${
                        isConnected
                          ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isConnected ? "Connected" : "Available"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {integration.description}
              </p>

              {/* Features */}
              <div className="flex-1">
                <div className="space-y-1.5 mb-4">
                  {integration.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats (only for connected) */}
              {isConnected && (
                <div className="mb-4 pb-4 border-b space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Last sync</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-emerald-600" />
                      <span className="font-medium">
                        {integration.lastSync}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Items synced</span>
                    <span className="font-medium">
                      {integration.syncedItems.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                {isConnected ? (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 h-9 rounded-sm text-sm"
                    >
                      <Settings className="h-4 w-4" />
                      Manage
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button className="flex-1 h-9 rounded-sm text-sm">
                    Connect
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
