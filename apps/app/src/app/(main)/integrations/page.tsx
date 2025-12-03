"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import {
  Search,
  CheckCircle2,
  Settings,
  Trash2,
  Clock,
  RefreshCw,
  AlertCircle,
  Loader2,
  ExternalLink,
  Zap,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@largence/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@largence/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

// Icon mapping for integration providers
const PROVIDER_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  NOTION: SiNotion,
  GOOGLE_DRIVE: SiGoogledrive,
  DROPBOX: SiDropbox,
  SLACK: SiSlack,
  MICROSOFT_365: FaMicrosoft,
  DOCUSIGN: FaFileSignature,
  GOOGLE_SHEETS: SiGooglesheets,
  SALESFORCE: SiSalesforce,
  TRELLO: SiTrello,
  ASANA: SiAsana,
  ZAPIER: SiZapier,
  AIRTABLE: SiAirtable,
  HUBSPOT: SiHubspot,
};

const PROVIDER_COLORS: Record<string, { text: string; bg: string }> = {
  NOTION: {
    text: "text-black dark:text-white",
    bg: "bg-black/5 dark:bg-white/10",
  },
  GOOGLE_DRIVE: { text: "text-[#4285F4]", bg: "bg-blue-500/10" },
  DROPBOX: { text: "text-[#0061FF]", bg: "bg-blue-600/10" },
  SLACK: { text: "text-[#4A154B]", bg: "bg-purple-900/10" },
  MICROSOFT_365: { text: "text-[#00A4EF]", bg: "bg-blue-500/10" },
  DOCUSIGN: { text: "text-[#FF3B2F]", bg: "bg-red-500/10" },
  GOOGLE_SHEETS: { text: "text-[#34A853]", bg: "bg-green-500/10" },
  SALESFORCE: { text: "text-[#00A1E0]", bg: "bg-blue-400/10" },
  TRELLO: { text: "text-[#0079BF]", bg: "bg-blue-600/10" },
  ASANA: { text: "text-[#F06A6A]", bg: "bg-red-400/10" },
  ZAPIER: { text: "text-[#FF4A00]", bg: "bg-orange-500/10" },
  AIRTABLE: { text: "text-[#18BFFF]", bg: "bg-blue-400/10" },
  HUBSPOT: { text: "text-[#FF7A59]", bg: "bg-orange-400/10" },
};

interface Integration {
  id: string;
  provider: string;
  name: string;
  description: string;
  category: string;
  features: string[];
  status: string;
  connectedAt: string | null;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  syncedItemsCount: number;
  externalEmail: string | null;
  syncEnabled: boolean;
  settings: Record<string, unknown> | null;
}

interface IntegrationsResponse {
  integrations: Integration[];
  categories: { id: string; name: string; count: number }[];
  stats: {
    connectedCount: number;
    totalSyncedItems: number;
    lastSyncTime: string | null;
    availableCount: number;
  };
}

async function fetchIntegrations(): Promise<IntegrationsResponse> {
  const res = await fetch("/api/integrations");
  if (!res.ok) throw new Error("Failed to fetch integrations");
  return res.json();
}

async function connectIntegration(
  provider: string,
): Promise<{ success: boolean }> {
  const res = await fetch("/api/integrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider }),
  });
  if (!res.ok) throw new Error("Failed to connect integration");
  return res.json();
}

async function disconnectIntegration(
  id: string,
): Promise<{ success: boolean }> {
  const res = await fetch(`/api/integrations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to disconnect integration");
  return res.json();
}

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [connectingProvider, setConnectingProvider] = useState<string | null>(
    null,
  );
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [integrationToDisconnect, setIntegrationToDisconnect] =
    useState<Integration | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["integrations"],
    queryFn: fetchIntegrations,
  });

  const connectMutation = useMutation({
    mutationFn: connectIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      setConnectingProvider(null);
    },
    onError: () => {
      setConnectingProvider(null);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      setShowDisconnectDialog(false);
      setIntegrationToDisconnect(null);
    },
  });

  const filteredIntegrations = useMemo(() => {
    if (!data?.integrations) return [];

    return data.integrations.filter((integration) => {
      // Category filter
      if (activeCategory !== "all") {
        if (activeCategory === "connected") {
          if (integration.status !== "CONNECTED") return false;
        } else if (integration.category !== activeCategory) {
          return false;
        }
      }

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          integration.name.toLowerCase().includes(searchLower) ||
          integration.description.toLowerCase().includes(searchLower) ||
          integration.category.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [data?.integrations, activeCategory, search]);

  const handleConnect = (provider: string) => {
    setConnectingProvider(provider);
    connectMutation.mutate(provider);
  };

  const handleDisconnectClick = (integration: Integration) => {
    setIntegrationToDisconnect(integration);
    setShowDisconnectDialog(true);
  };

  const handleDisconnectConfirm = () => {
    if (integrationToDisconnect) {
      disconnectMutation.mutate(integrationToDisconnect.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-sm mb-2" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded-sm" />
        </div>
        <div className="flex gap-3 mb-6">
          <div className="h-10 flex-1 bg-muted animate-pulse rounded-sm" />
          <div className="h-10 w-24 bg-muted animate-pulse rounded-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold mb-2">
          Failed to load integrations
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          There was an error loading your integrations.
        </p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="rounded-sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const categories = data?.categories || [];
  const stats = data?.stats;

  return (
    <div className="flex flex-1 flex-col p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold font-heading">
              Integrations
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connect Largence with your favorite tools and automate your legal
              workflows
            </p>
          </div>
          {stats && stats.connectedCount > 0 && (
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-semibold">
                  {stats.connectedCount}
                </div>
                <div className="text-xs text-muted-foreground">Connected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">
                  {stats.totalSyncedItems.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Items Synced
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            className="h-10 rounded-sm pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="h-10 rounded-sm"
          onClick={() => refetch()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-sm border whitespace-nowrap transition-colors ${
              activeCategory === category.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-accent"
            }`}
          >
            <span className="text-sm font-medium">{category.name}</span>
            <span className="ml-2 text-xs opacity-70">({category.count})</span>
          </button>
        ))}
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration) => {
          const Icon = PROVIDER_ICONS[integration.provider] || Zap;
          const colors = PROVIDER_COLORS[integration.provider] || {
            text: "text-primary",
            bg: "bg-primary/10",
          };
          const isConnected = integration.status === "CONNECTED";
          const isConnecting = connectingProvider === integration.provider;

          return (
            <div
              key={integration.id}
              className="group flex flex-col h-80 rounded-sm border bg-card p-6 hover:border-primary/50 transition-all"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-3 rounded-sm ${colors.bg} shrink-0`}>
                  <Icon className={`h-8 w-8 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold font-heading">
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
                    <span className="text-xs text-muted-foreground">
                      {integration.category}
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
              {isConnected && integration.lastSyncAt && (
                <div className="mb-4 pb-4 border-b space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Last sync</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-emerald-600" />
                      <span className="font-medium">
                        {formatDistanceToNow(new Date(integration.lastSyncAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Items synced</span>
                    <span className="font-medium">
                      {integration.syncedItemsCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                {isConnected ? (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 h-9 rounded-sm text-sm"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Now
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on {integration.name}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDisconnectClick(integration)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Disconnect
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Button
                    className="flex-1 h-9 rounded-sm text-sm"
                    onClick={() => handleConnect(integration.provider)}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Zap className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No integrations found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {search
              ? `No integrations match "${search}". Try a different search term.`
              : "No integrations available in this category."}
          </p>
          {search && (
            <Button
              variant="outline"
              className="mt-4 rounded-sm"
              onClick={() => setSearch("")}
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Disconnect Confirmation Dialog */}
      <Dialog
        open={showDisconnectDialog}
        onOpenChange={setShowDisconnectDialog}
      >
        <DialogContent className="rounded-sm">
          <DialogHeader>
            <DialogTitle>
              Disconnect {integrationToDisconnect?.name}?
            </DialogTitle>
            <DialogDescription>
              This will disconnect the {integrationToDisconnect?.name}{" "}
              integration from your organization. You can reconnect it at any
              time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisconnectDialog(false)}
              className="rounded-sm"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnectConfirm}
              disabled={disconnectMutation.isPending}
              className="rounded-sm"
            >
              {disconnectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                "Disconnect"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
